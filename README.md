# Projet GreenIT

## Introduction
Ce projet est un site vitrine développé selon les principes de l'éco-conception afin de minimiser son impact environnemental. Le site est construit en utilisant des technologies légères et optimisées pour la performance et la durabilité.

## Choix d'Éco-Conception
1. **Développement Minimaliste** : Le site utilise un design et des pratiques de codage minimalistes pour réduire la consommation de ressources.
2. **Chargement Paresseux (Lazy Loading)** : Les images et autres ressources sont chargées uniquement lorsqu'elles sont nécessaires, réduisant ainsi les temps de chargement initiaux et l'utilisation de la bande passante.
3. **Images Optimisées** : Toutes les images sont optimisées et converties en formats modernes comme WebP pour réduire la taille des fichiers sans compromettre la qualité.
4. **Hébergement Efficace** : Le site est hébergé sur des serveurs alimentés par des sources d'énergie renouvelables.
5. **Mise en Cache** : Mise en œuvre de stratégies de mise en cache efficaces pour minimiser les requêtes serveur et améliorer les temps de chargement.
6. **Design Réactif** : Assurer que le site est accessible et performant sur tous les appareils, réduisant ainsi le besoin de versions multiples du site.

## Exécution du code 
Pour exécuter le projet, utilisez les commandes suivantes :

```sh
docker-compose up -d
docker-compose build --no-cache
```

### Informations sur l'Utilisateur Admin
Pour accéder au portail admin, utilisez les identifiants suivants :
- Nom d'utilisateur : admin
- Mot de passe : admin123

## Actions à Venir
### Mise en Production (MEP)
- **Intégration Continue/Déploiement Continu (CI/CD)** : Mise en place de pipelines CI/CD pour automatiser les processus de test et de déploiement.
- **Surveillance** : Configuration d'outils de surveillance pour suivre les performances du site et détecter les problèmes rapidement.

### Serveurs
- **Infrastructure Évolutive** : Utilisation de services cloud permettant de faire évoluer les ressources en fonction de la demande.
- **Répartition de Charge** : Mise en œuvre de répartiteurs de charge pour distribuer le trafic de manière uniforme entre les serveurs, assurant ainsi une haute disponibilité et fiabilité.

### Maintenance
- **Mises à Jour Régulières** : Maintenir à jour toutes les dépendances et bibliothèques pour garantir la sécurité et la performance.
- **Audits de Performance** : Réaliser des audits de performance réguliers pour identifier et résoudre les goulots d'étranglement ou inefficacités.
- **Retour Utilisateur** : Collecter et analyser les retours des utilisateurs pour améliorer continuellement le site.

## Montée en Charge du Site
À mesure que le site se développe et attire plus de visiteurs, les stratégies suivantes seront employées pour gérer l'augmentation du trafic :
1. **Évolutivité Horizontale** : Ajouter plus de serveurs pour gérer la charge supplémentaire.
2. **Réseau de Distribution de Contenu (CDN)** : Utiliser un CDN pour distribuer le contenu à l'échelle mondiale, réduisant la latence et améliorant les temps de chargement pour les utilisateurs du monde entier.
3. **Optimisation de la Base de Données** : Optimiser les requêtes de la base de données et utiliser des mécanismes de mise en cache pour réduire la charge sur la base de données.
4. **Architecture Microservices** : Décomposer l'application en services plus petits et indépendants qui peuvent être évolués individuellement.

En suivant ces principes et stratégies, le projet GreenIT vise à fournir un site web durable et performant qui minimise son impact environnemental tout en offrant une excellente expérience utilisateur.

## Contributor
Guilliam MORISSET (guilliammrst on GitHub)

---

&copy; 2025 - GreenIT - Tous droits réservés.