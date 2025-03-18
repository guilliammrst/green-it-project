/**
 * Accordéon natif et léger
 * Implémentation optimisée pour la performance
 */

document.addEventListener('DOMContentLoaded', function() {
    initAccordions();
  });
  
  function initAccordions() {
    // Pour les accordéons de type details/summary (HTML natif)
    const accordionDetails = document.querySelectorAll('details.accordion');
    
    // Pour les accordéons personnalisés
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // Gestion des accordéons de type details (HTML natif)
    accordionDetails.forEach(detail => {
      detail.addEventListener('toggle', function() {
        // Optionnel: fermer les autres accordéons
        if (this.open) {
          accordionDetails.forEach(otherDetail => {
            if (otherDetail !== this) otherDetail.open = false;
          });
        }
      });
    });
    
    // Gestion des accordéons personnalisés
    accordionHeaders.forEach(header => {
      header.addEventListener('click', function() {
        // Vérifier si l'accordéon est déjà ouvert
        const isActive = this.classList.contains('active');
        
        // Fermer tous les accordéons
        accordionHeaders.forEach(otherHeader => {
          otherHeader.classList.remove('active');
          const content = otherHeader.nextElementSibling;
          if (content && content.classList.contains('accordion-content')) {
            content.classList.remove('active');
            
            // Animation de fermeture
            content.style.maxHeight = '0px';
          }
        });
        
        // Si l'accordéon n'était pas déjà ouvert, l'ouvrir
        if (!isActive) {
          this.classList.add('active');
          const content = this.nextElementSibling;
          
          if (content && content.classList.contains('accordion-content')) {
            content.classList.add('active');
            
            // Animation d'ouverture
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        }
      });
    });
    
    // Si le hash de l'URL correspond à un accordéon, l'ouvrir automatiquement
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetAccordion = document.getElementById(targetId);
      
      if (targetAccordion) {
        const header = targetAccordion.querySelector('.accordion-header');
        if (header) {
          setTimeout(() => {
            header.click();
            targetAccordion.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }