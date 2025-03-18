/**
 * Carousel natif et éco-responsable
 * Développé sans dépendances externes pour minimiser l'empreinte
 * Avec animation de transition fluide mais légère
 */

document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(function(carousel) {
      initCarousel(carousel);
    });
  });
  
  function initCarousel(carousel) {
    if (!carousel) return;
    
    const items = carousel.querySelectorAll('.carousel-item');
    if (items.length <= 1) return; // Pas besoin de carousel s'il n'y a qu'un seul élément
    
    // Correction des sélecteurs pour les boutons de navigation
    const prevBtn = carousel.parentElement.querySelector('.carousel-controls .prev');
    const nextBtn = carousel.parentElement.querySelector('.carousel-controls .next');
    const indicators = document.createElement('div');
    
    // Ajouter la classe "active" au premier élément
    items[0].classList.add('active');
    
    // Initialiser l'index courant
    let currentIndex = 0;
    let isAnimating = false; // Empêcher les clics multiples pendant l'animation
    
    // Définir la direction de l'animation
    let direction = 'next';
    
    // Préparer les transitions CSS pour tous les éléments
    items.forEach(item => {
      item.style.transition = 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out';
      item.style.position = 'absolute';
      item.style.width = '100%';
      item.style.backfaceVisibility = 'hidden'; // Optimisation pour la performance
    });
    
    // Créer les indicateurs
    indicators.className = 'carousel-indicators';
    items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Aller à l'élément ${index + 1}`);
      dot.dataset.index = index;
      if (index === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        if (isAnimating) return;
        
        direction = index > currentIndex ? 'next' : 'prev';
        showItem(index);
      });
      
      indicators.appendChild(dot);
    });
    
    // Ajouter les indicateurs directement dans le conteneur du carousel
    carousel.parentElement.appendChild(indicators);
    
    // Fonction pour afficher un élément spécifique avec animation
    function showItem(index) {
      if (isAnimating || index === currentIndex) return;
      isAnimating = true;
      
      // Élément actuel et prochain élément
      const currentItem = items[currentIndex];
      const nextItem = items[index];
      
      // Préparer l'animation selon la direction
      if (direction === 'next') {
        // Animation vers la gauche
        nextItem.style.transform = 'translateX(100%)';
        nextItem.style.opacity = '0';
        nextItem.classList.add('active');
        
        // Forcer un reflow pour appliquer le style initial
        nextItem.offsetWidth;
        
        // Animer la sortie de l'élément actuel et l'entrée du prochain
        currentItem.style.transform = 'translateX(-100%)';
        currentItem.style.opacity = '0';
        nextItem.style.transform = 'translateX(0)';
        nextItem.style.opacity = '1';
      } else {
        // Animation vers la droite
        nextItem.style.transform = 'translateX(-100%)';
        nextItem.style.opacity = '0';
        nextItem.classList.add('active');
        
        // Forcer un reflow
        nextItem.offsetWidth;
        
        // Animer
        currentItem.style.transform = 'translateX(100%)';
        currentItem.style.opacity = '0';
        nextItem.style.transform = 'translateX(0)';
        nextItem.style.opacity = '1';
      }
      
      // Désactiver l'indicateur actif
      const dots = indicators.querySelectorAll('button');
      dots[currentIndex].classList.remove('active');
      
      // Après l'animation
      setTimeout(() => {
        // Nettoyer les styles après animation
        currentItem.classList.remove('active');
        currentItem.style.transform = '';
        nextItem.style.transform = '';
        
        // Mettre à jour l'index
        currentIndex = index;
        
        // Activer le nouvel indicateur
        dots[currentIndex].classList.add('active');
        
        // Autoriser à nouveau les animations
        isAnimating = false;
      }, 400); // Temps égal à la durée de transition CSS
    }
    
    // Gestion des clics sur les boutons
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (isAnimating) return;
        
        direction = 'prev';
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = items.length - 1;
        showItem(newIndex);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (isAnimating) return;
        
        direction = 'next';
        let newIndex = currentIndex + 1;
        if (newIndex >= items.length) newIndex = 0;
        showItem(newIndex);
      });
    }
    
    // Gestion du swipe sur mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    carousel.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);
    
    function handleSwipe() {
      if (isAnimating) return;
      
      // Seuil minimum pour considérer qu'il y a eu un swipe
      const threshold = 50;
      
      if (touchEndX + threshold < touchStartX) {
        // Swipe gauche -> élément suivant
        direction = 'next';
        let newIndex = currentIndex + 1;
        if (newIndex >= items.length) newIndex = 0;
        showItem(newIndex);
      } else if (touchEndX > touchStartX + threshold) {
        // Swipe droit -> élément précédent
        direction = 'prev';
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = items.length - 1;
        showItem(newIndex);
      }
    }
  }