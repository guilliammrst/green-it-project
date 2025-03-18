/**
 * Lazy loading des images pour réduire le chargement initial
 * Utilise l'Intersection Observer API pour une performance optimale
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le lazy loading
    initLazyLoading();
  });
  
  function initLazyLoading() {
    // Vérifier si le navigateur supporte IntersectionObserver
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('.lazy');
      
      // Aucune image à charger paresseusement
      if (lazyImages.length === 0) return;
      
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          // Charger l'image uniquement quand elle devient visible
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Utiliser le dataset pour récupérer la source
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            
            // Ajouter une classe pour l'animation de fondu
            img.classList.add('loaded');
            img.classList.remove('lazy');
            
            // Arrêter d'observer une fois l'image chargée
            imageObserver.unobserve(img);
          }
        });
      }, {
        // Options de l'observateur: déclencher le chargement quand l'image est à 200px du viewport
        rootMargin: '200px 0px',
        threshold: 0.01 // Déclencher dès que 1% de l'image est visible
      });
      
      // Observer chaque image
      lazyImages.forEach(function(img) {
        imageObserver.observe(img);
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
      // Charger toutes les images directement
      const lazyImages = document.querySelectorAll('.lazy');
      lazyImages.forEach(function(img) {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute('data-srcset');
        }
        
        img.classList.add('loaded');
        img.classList.remove('lazy');
      });
    }
  }