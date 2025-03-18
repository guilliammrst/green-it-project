from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import time
from PIL import Image
import sqlalchemy as sa
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
SECRET_KEY = 'secret_key'  # À remplacer par une clé sécurisée en production

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # Limite taille des fichiers à 2MB

# Créer le dossier d'uploads s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configuration de la base de données (PostgreSQL)
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://greenit:password@localhost:5432/greenit_db')
engine = create_engine(DATABASE_URL)
Base = declarative_base()
Session = sessionmaker(bind=engine)

# Fonction pour se connecter à la base de données
def get_db_connection():
    return Session()

# Fonction pour initialiser la base de données
def init_db():
    try:
        # Vérifier si la table articles existe déjà
        with engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            try:
                # Vérifier si la table articles existe
                conn.execute(text("SELECT 1 FROM articles LIMIT 1"))
                print("Les tables existent déjà")
            except Exception:
                print("Les tables n'existent pas, création...")
                
                # Créer les tables manuellement pour s'assurer qu'elles sont bien créées
                try:
                    # Création manuelle des tables avec AUTOCOMMIT
                    conn.execute(text("""
                    DROP TABLE IF EXISTS articles CASCADE;
                    DROP TABLE IF EXISTS users CASCADE;
                    DROP TABLE IF EXISTS contacts CASCADE;
                    """))
                    
                    # Table users
                    conn.execute(text("""
                    CREATE TABLE users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        role VARCHAR(20) NOT NULL DEFAULT 'user',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    """))
                    print("Table users créée avec succès")
                    
                    # Table articles
                    conn.execute(text("""
                    CREATE TABLE articles (
                        id SERIAL PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        content TEXT NOT NULL,
                        excerpt TEXT,
                        image_path TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    """))
                    print("Table articles créée avec succès")
                    
                    # Table contacts
                    conn.execute(text("""
                    CREATE TABLE contacts (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        email VARCHAR(100) NOT NULL,
                        message TEXT NOT NULL,
                        read BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    """))
                    print("Table contacts créée avec succès")
                except Exception as e:
                    print(f"Erreur lors de la création manuelle des tables: {e}")
        
        # Le reste de votre fonction init_db reste inchangé
        with get_db_connection() as session:
            # Vérifier si l'utilisateur admin existe déjà
            admin_exists = False
            try:
                admin_exists = session.execute(
                    text("SELECT 1 FROM users WHERE username = 'admin'")
                ).fetchone()
            except Exception as e:
                print(f"Erreur lors de la vérification de l'admin: {e}")
            
            # Créer l'utilisateur admin si nécessaire
            if not admin_exists:
                try:
                    # Insérer un utilisateur admin par défaut
                    admin_password = generate_password_hash('admin123')
                    session.execute(
                        text("INSERT INTO users (username, password, role) VALUES (:username, :password, :role)"),
                        {"username": "admin", "password": admin_password, "role": "admin"}
                    )
                    print("Utilisateur admin créé avec succès")
                except Exception as e:
                    print(f"Erreur lors de la création de l'admin: {e}")
            
            try:
                session.commit()
                print("Commit des changements réussi")
            except Exception as e:
                print(f"Erreur lors du commit: {e}")
                session.rollback()
                
    except Exception as e:
        print(f"Erreur lors de l'initialisation de la base de données: {e}")

# Utilitaire pour vérifier les extensions de fichier
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes de l'API

@app.route('/api/articles', methods=['GET'])
def get_articles():
    with get_db_connection() as session:
        articles = session.execute(text("SELECT * FROM articles ORDER BY created_at DESC")).fetchall()
        
        # Version plus concise mais équivalente
        articles_list = [dict(row._mapping) for row in articles]
        
        return jsonify(articles_list)

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    with get_db_connection() as session:
        article = session.execute(text("SELECT * FROM articles WHERE id = :id"), {"id": article_id}).mappings().fetchone()
        
        if article is None:
            return jsonify({"error": "Article non trouvé"}), 404
        
        return jsonify(dict(article))

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    with get_db_connection() as session:
        user = session.execute(text("SELECT * FROM users WHERE username = :username"), {"username": username}).mappings().fetchone()
        
        if user and check_password_hash(user['password'], password):
            # En production, utilisez JWT ou une solution plus sécurisée
            # Ici, simple token pour démonstration
            return jsonify({
                "token": f"{username}_{int(time.time())}_{SECRET_KEY}",
                "user": {
                    "id": user['id'],
                    "username": user['username'],
                    "role": user['role']
                }
            })
        
        return jsonify({"error": "Nom d'utilisateur ou mot de passe incorrect"}), 401

@app.route('/api/articles', methods=['POST'])
def create_article():
    # Vérifier si l'utilisateur est authentifié (à améliorer en production)
    # En production, utilisez une vraie authentification avec JWT
    
    # Récupérer les données de l'article
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    excerpt = data.get('excerpt', content[:150] + '...' if content else '')
    image_path = data.get('image_path')
    
    # Enregistrer l'article dans la base de données
    with get_db_connection() as session:
        cursor = session.execute(
            text("INSERT INTO articles (title, content, excerpt, image_path, created_at) VALUES (:title, :content, :excerpt, :image_path, NOW())"),
            {"title": title, "content": content, "excerpt": excerpt, "image_path": image_path}
        )
        article_id = cursor.lastrowid
        session.commit()
    
    return jsonify({"message": "Article créé avec succès", "id": article_id}), 201

@app.route('/api/articles/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    # Vérifier si l'article existe
    with get_db_connection() as session:
        article = session.execute(text("SELECT * FROM articles WHERE id = :id"), {"id": article_id}).mappings().fetchone()
        
        if article is None:
            return jsonify({"error": "Article non trouvé"}), 404
    
    # Récupérer les données de l'article
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    excerpt = data.get('excerpt', content[:150] + '...' if content else '')
    dataImage = data.get('image_path')
    if dataImage is None:
        image_path = article.image_path
    else:
        image_path = dataImage
    
    # Mettre à jour l'article
    with get_db_connection() as session:
        session.execute(
            text("UPDATE articles SET title = :title, content = :content, excerpt = :excerpt, image_path = :image_path WHERE id = :id"),
            {"title": title, "content": content, "excerpt": excerpt, "image_path": image_path, "id": article_id}
        )
        session.commit()
    
    return jsonify({"message": "Article mis à jour avec succès"})

@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    with get_db_connection() as session:
        # Récupérer le chemin de l'image avant suppression
        article = session.execute(text("SELECT image_path FROM articles WHERE id = :id"), {"id": article_id}).mappings().fetchone()
        
        if article is None:
            return jsonify({"error": "Article non trouvé"}), 404
        
        # Supprimer l'article
        session.execute(text("DELETE FROM articles WHERE id = :id"), {"id": article_id})
        session.commit()
        
        # Supprimer l'image associée si elle existe
        if article['image_path']:
            try:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], article['image_path']))
            except OSError:
                pass  # Ignorer si le fichier n'existe pas
    
    return jsonify({"message": "Article supprimé avec succès"})

@app.route('/api/contact', methods=['POST'])
def send_contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    # Validation simple
    if not name or not email or not message:
        return jsonify({"error": "Tous les champs sont obligatoires"}), 400
    
    # Enregistrer le message dans la base de données
    with get_db_connection() as session:
        session.execute(
            text("INSERT INTO contacts (name, email, message, created_at) VALUES (:name, :email, :message, datetime('now'))"),
            {"name": name, "email": email, "message": message}
        )
        session.commit()
    
    return jsonify({"message": "Message envoyé avec succès"})

# Servir les fichiers uploadés
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Servir le site statique (pour le développement)
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../site-vitrine', path)

@app.route('/api/optimize-image', methods=['POST'])
def optimize_image():
    if 'image' not in request.files:
        return jsonify({"error": "Aucune image fournie"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Aucun fichier sélectionné"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_' + filename)
        file.save(temp_path)
        
        # Optimiser l'image
        try:
            # Générer un nom unique basé sur le timestamp
            name = f"article_{int(time.time())}"
            webp_name = f"{name}.webp"
            webp_path = os.path.join(app.config['UPLOAD_FOLDER'], webp_name)
            
            # Ouvrir et optimiser
            img = Image.open(temp_path)
            
            # Forcer la taille à 800x450px (aspect ratio 16:9)
            img = img.resize((800, 450), Image.LANCZOS)
            
            # Sauvegarder en WebP avec une qualité optimisée 
            img.save(webp_path, 'WEBP', quality=85, method=6)
            
            # Nettoyer le fichier temporaire
            os.remove(temp_path)
            
            return jsonify({
                "success": True,
                "image_path": webp_name,
                "url": f"/uploads/{webp_name}"
            })
            
        except Exception as e:
            # Nettoyer en cas d'erreur
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"error": "Type de fichier non autorisé"}), 400

@app.route('/api/batch-optimize-images', methods=['GET'])
def batch_optimize_images():
    with get_db_connection() as session:
        articles = session.execute(text("SELECT id, image_path FROM articles")).fetchall()
        results = []
        
        for article in articles:
            old_path = article['image_path']
            
            # Ignorer les chemins vides ou déjà optimisés
            if not old_path or old_path.startswith('article_'):
                continue
                
            # Chemin complet
            source_path = os.path.join('../site-vitrine', old_path)
            
            try:
                if os.path.exists(source_path):
                    # Générer un nom unique
                    name = f"article_{int(time.time())}_{article['id']}"
                    webp_name = f"{name}.webp"
                    webp_path = os.path.join(app.config['UPLOAD_FOLDER'], webp_name)
                    
                    # Optimiser l'image
                    img = Image.open(source_path)
                    img = img.resize((800, 450), Image.LANCZOS)
                    img.save(webp_path, 'WEBP', quality=85, method=6)
                    
                    # Mettre à jour la base de données
                    session.execute(
                        text("UPDATE articles SET image_path = :path WHERE id = :id"),
                        {"path": webp_name, "id": article['id']}
                    )
                    
                    results.append({
                        "article_id": article['id'],
                        "old_path": old_path,
                        "new_path": webp_name,
                        "status": "success"
                    })
                else:
                    results.append({
                        "article_id": article['id'],
                        "old_path": old_path,
                        "status": "error",
                        "message": "Fichier source introuvable"
                    })
            except Exception as e:
                results.append({
                    "article_id": article['id'],
                    "old_path": old_path,
                    "status": "error",
                    "message": str(e)
                })
        
        session.commit()
        
        return jsonify({
            "processed": len(results),
            "results": results
        })

if __name__ == '__main__':
    # Initialiser la base de données
    init_db()
    # Lancer le serveur
    app.run(debug=True, host='0.0.0.0', port=3000) 