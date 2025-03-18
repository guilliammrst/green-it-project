/**
 * Fichier JavaScript principal - GreenIT
 * Contient les fonctionnalités communes à toutes les pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Gestion du mode sombre
    initDarkMode();
    
    // Gestion de la recherche
    initSearch();
    
    // Chargement des articles si nous sommes sur la page d'accueil
    if (document.getElementById('articlesContainer')) {
      loadArticles();
    }
  });
  
  /**
   * Initialise le mode sombre
   */
  function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Vérifier la préférence de l'utilisateur
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Appliquer le thème initial
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
      document.body.classList.add('dark-mode');
      loadDarkModeCSS();
    }
    
    // Gestion du clic sur le bouton
    darkModeToggle.addEventListener('click', function() {
      if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        loadDarkModeCSS();
      }
    });
  }
  
  /**
   * Charge le CSS du mode sombre à la demande
   */
  function loadDarkModeCSS() {
    if (!document.getElementById('dark-mode-css')) {
      const link = document.createElement('link');
      link.id = 'dark-mode-css';
      link.rel = 'stylesheet';
      link.href = 'css/dark-mode.css';
      document.head.appendChild(link);
    }
  }
  
  /**
   * Initialise la recherche
   */
  function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length < 2) return;
        
        // Recherche dans les articles visibles sur la page
        searchInContent(query);
      }
    });
  }
  
  /**
   * Recherche dans le contenu de la page
   */
  function searchInContent(query) {
    // Recherche dans les titres, paragraphes, et autres éléments textuels
    const elements = document.querySelectorAll('h2, h3, p, .article-title, .article-excerpt');
    let found = false;
    
    elements.forEach(el => {
      const content = el.textContent.toLowerCase();
      
      // Réinitialiser le surlignage
      el.innerHTML = el.innerHTML.replace(/<mark>|<\/mark>/g, '');
      
      if (content.includes(query)) {
        found = true;
        
        // Surligner les résultats (version simplifiée)
        const regex = new RegExp(query, 'gi');
        el.innerHTML = el.innerHTML.replace(regex, match => `<mark>${match}</mark>`);
        
        // Scrolle vers le premier résultat
        if (found) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
    });
    
    if (!found) {
      alert('Aucun résultat trouvé pour "' + query + '"');
    }
  }
  
  /**
   * Charge les articles depuis l'API
   */
  function loadArticles() {
    const articlesContainer = document.getElementById('articlesContainer');
    if (!articlesContainer) return;
    
    // Afficher un message de chargement
    articlesContainer.innerHTML = '<p class="loading-message">Chargement des articles...</p>';
    
    // URL de l'API (utiliser une approche progressive)
    const apiUrl = getApiBaseUrl() + '/api/articles';
    
    // Utiliser fetch() avec fallback sur le JSON local en cas d'erreur
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors du chargement des articles depuis l\'API');
        return response.json();
      })
      .catch(apiError => {
        console.warn('API indisponible, utilisation des données locales', apiError);
        return fetch('data/articles.json').then(response => response.json());
      })
      .then(data => {
        if (data.length === 0) {
          articlesContainer.innerHTML = '<p class="empty-message">Aucun article disponible pour le moment.</p>';
          return;
        }
        
        // Générer le HTML pour chaque article avec lazyload
        const articlesHTML = data.map(article => `
          <article class="article-card">
            ${article.image_path ? 
              `<div class="article-image-container">
                <img class="lazy article-image" 
                  data-src="${article.image_path.startsWith('http') 
                    ? article.image_path 
                    : article.image_path.startsWith('article_') 
                      ? getApiBaseUrl() + `/uploads/${article.image_path}` 
                      : `${article.image_path}`}" 
                  alt="${article.title}" 
                  width="800" 
                  height="450">
              </div>` : ''}
            <div class="article-content">
              <h3>${article.title}</h3>
              <p class="article-date">${formatDate(article.created_at)}</p>
              <p>${article.excerpt || article.content.substring(0, 150)}...</p>
            </div>
          </article>
        `).join('');
        
        articlesContainer.innerHTML = articlesHTML;
        
        // Initialiser le lazy loading pour les images
        initLazyLoading();
      })
      .catch(error => {
        console.error('Erreur:', error);
        articlesContainer.innerHTML = '<p class="error-message">Impossible de charger les articles. Veuillez réessayer plus tard.</p>';
      });
  }
  
  /**
   * Charge les détails d'un article
   */
  function loadArticleDetails(articleId) {
    const apiUrl = getApiBaseUrl() + '/api/articles/' + articleId;
    
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de l\'article');
        }
        return response.json();
      })
      .then(article => {
        // Créer une modal pour afficher l'article
        createArticleModal(article);
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert('Impossible de charger cet article. Veuillez réessayer plus tard.');
      });
  }
  
  /**
   * Crée une modal pour afficher un article
   */
  function createArticleModal(article) {
    // Créer l'élément modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <article class="full-article">
          <h2>${article.title}</h2>
          ${article.image_path ? 
            `<img src="${getApiBaseUrl()}/uploads/${article.image_path}" 
              alt="${article.title}" class="article-full-image">` : ''}
          <div class="article-date">${formatDate(article.created_at)}</div>
          <div class="article-body">${article.content}</div>
        </article>
      </div>
    `;
    
    // Ajouter la modal au document
    document.body.appendChild(modal);
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    // Afficher la modal avec une animation
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
    
    // Gestionnaire pour fermer la modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
      closeModal(modal);
    });
    
    // Fermer la modal en cliquant en dehors
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
    
    // Fermer avec la touche Echap
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeModal(modal);
      }
    });
  }
  
  /**
   * Ferme une modal
   */
  function closeModal(modal) {
    modal.style.opacity = '0';
    
    // Supprimer la modal après l'animation
    setTimeout(() => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    }, 300);
  }
  
  /**
   * Formate une date
   */
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  }
  
  /**
   * Renvoie l'URL de base de l'API
   */
  function getApiBaseUrl() {
    // En production, utilisez l'URL réelle de votre API
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : 'https://votre-api-production.com';
  }
  
  /**
   * Initialise le lazy loading pour les images
   */
  function initLazyLoading() {
    // Cette fonction est définie dans lazyload.js
    // Elle sera appelée automatiquement grâce au defer
  }