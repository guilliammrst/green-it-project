/**
 * Interface d'administration
 * Gestion de l'authentification et des articles
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configuration de l'API
    const API_URL = getApiBaseUrl() + '/api';
    let token = localStorage.getItem('adminToken');
    
    // Éléments DOM
    const loginSection = document.getElementById('loginSection');
    const articlesSection = document.getElementById('articlesSection');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const articlesList = document.getElementById('articlesList');
    const articleForm = document.getElementById('articleForm');
    const formTitle = document.getElementById('formTitle');
    const articleId = document.getElementById('articleId');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const excerptInput = document.getElementById('excerpt');
    const imageInput = document.getElementById('image');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Vérifier si les éléments existent
    if (!loginForm || !articlesSection) return;
    
    // Vérifier si l'utilisateur est déjà connecté
    if (token) {
      verifyToken();
    }
    
    // Gestion de la connexion
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        loginMessage.textContent = 'Connexion en cours...';
        loginMessage.className = 'info';
        
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur de connexion');
        }
        
        // Stocker le token et afficher l'interface admin
        token = data.token;
        localStorage.setItem('adminToken', token);
        showAdminInterface();
        
      } catch (error) {
        loginMessage.textContent = `Erreur: ${error.message}`;
        loginMessage.className = 'error';
      }
    });
    
    // Gestion de la déconnexion
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminToken');
        token = null;
        showLoginInterface();
      });
    }
    
    // Gestion du formulaire d'article
    if (articleForm) {
      articleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const article_Id = articleId.value
        const method = article_Id ? 'PUT' : 'POST';
        const url = article_Id ? `${API_URL}/articles/${article_Id}` : `${API_URL}/articles`;
        
        // Si une image est sélectionnée, l'optimiser d'abord
        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
          const imageFormData = new FormData();
          imageFormData.append('image', imageFile);
          
          // Appel à l'endpoint d'optimisation
          fetch(`${API_URL}/optimize-image`, {
            method: 'POST',
            body: imageFormData,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(response => response.json())
          .then(data => {
            // Remplacer le chemin de l'image par celui de l'image optimisée
            formData.set('image_path', data.image_path);
            
            // Soumettre le reste du formulaire
            submitArticleForm(url, method, formData);
          })
          .catch(error => {
            console.error('Erreur lors de l\'optimisation de l\'image:', error);
            // Continuer sans optimisation en cas d'erreur
            submitArticleForm(url, method, formData);
          });
        } else {
          // Pas d'image à optimiser, soumettre directement
          submitArticleForm(url, method, formData);
        }
      });
    }
    
    // Gestion du bouton Annuler
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        resetForm();
      });
    }
    
    // Fonctions
    
    // Vérifier la validité du token
    async function verifyToken() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (!response.ok) {
          throw new Error('Token invalide');
        }
        
        showAdminInterface();
        
      } catch (error) {
        localStorage.removeItem('adminToken');
        token = null;
        showLoginInterface();
      }
    }
    
    // Afficher l'interface d'administration
    function showAdminInterface() {
      if (loginSection) loginSection.style.display = 'none';
      if (articlesSection) articlesSection.style.display = 'block';
      
      // Charger les articles
      loadArticles();
    }
    
    // Afficher l'interface de connexion
    function showLoginInterface() {
      if (loginSection) loginSection.style.display = 'block';
      if (articlesSection) articlesSection.style.display = 'none';
    }
    
    // Charger la liste des articles
    async function loadArticles() {
      if (!articlesList) return;
      
      try {
        articlesList.innerHTML = '<p>Chargement des articles...</p>';
        
        const response = await fetch(`${API_URL}/articles`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des articles');
        }
        
        const articles = await response.json();
        
        if (articles.length === 0) {
          articlesList.innerHTML = '<p>Aucun article pour le moment.</p>';
          return;
        }
        
        // Afficher les articles
        let html = '';
        articles.forEach(article => {
          html += `
            <div class="article-card">
              <h3>${article.title}</h3>
              <p>${article.excerpt || article.content.substring(0, 100)}...</p>
              <div class="article-actions">
                <button class="btn edit-btn" data-id="${article.id}">Modifier</button>
                <button class="btn delete-btn" data-id="${article.id}">Supprimer</button>
              </div>
            </div>
          `;
        });
        
        articlesList.innerHTML = html;
        
        // Ajouter les événements sur les boutons
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = this.dataset.id;
            editArticle(id);
          });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = this.dataset.id;
            deleteArticle(id);
          });
        });
        
      } catch (error) {
        console.error('Erreur:', error);
        articlesList.innerHTML = '<p class="error">Impossible de charger les articles</p>';
      }
    }
    
    // Éditer un article
    async function editArticle(id) {
      try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de l\'article');
        }
        
        const article = await response.json();
        
        // Remplir le formulaire avec les données de l'article
        articleId.value = article.id;
        titleInput.value = article.title;
        contentInput.value = article.content;
        excerptInput.value = article.excerpt;
        
        // Changer le titre du formulaire
        formTitle.textContent = 'Modifier l\'article';
        
        // Afficher le bouton d'annulation
        cancelBtn.style.display = 'inline-block';
        
        // Faire défiler jusqu'au formulaire
        articleForm.scrollIntoView({ behavior: 'smooth' });
        
      } catch (error) {
        console.error('Erreur:', error);
        alert(`Erreur: ${error.message}`);
      }
    }
    
    // Supprimer un article
    async function deleteArticle(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/articles/${id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Erreur lors de la suppression');
        }
        
        // Recharger la liste des articles
        loadArticles();
        
        alert('Article supprimé avec succès');
        
      } catch (error) {
        console.error('Erreur:', error);
        alert(`Erreur: ${error.message}`);
      }
    }
    
    // Réinitialiser le formulaire
    function resetForm() {
      if (!articleForm) return;
      
      articleForm.reset();
      articleId.value = '';
      formTitle.textContent = 'Ajouter un nouvel article';
      cancelBtn.style.display = 'none';
    }
    
    // Fonction de soumission du formulaire
    async function submitArticleForm(url, method, formData) {
      // Convertir FormData en objet JSON
      const articleData = {};
      formData.forEach((value, key) => {
        // Ne pas inclure le fichier image lui-même
        if (key !== 'image') {
          articleData[key] = value;
        }
      });
      
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(articleData)
        });

        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de l\'enregistrement');
        }
        
        alert('Article ' + (articleId.value ? 'modifié' : 'ajouté') + ' avec succès');
        
        // Réinitialiser le formulaire
        resetForm();
        
        // Recharger la liste des articles
        loadArticles();
      }
      catch(error) {
        console.error('Erreur:', error);
        alert(`Erreur: ${error.message}`);
      }
    }
    
    // Obtenir l'URL de base de l'API
    function getApiBaseUrl() {
      return window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://votre-vrai-api-production.com';
    }
  });