/**
 * Gestion du formulaire de contact
 * Version connectée à l'API Python
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const formStatus = document.getElementById('formStatus');
    
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Réinitialiser le statut
      formStatus.textContent = '';
      formStatus.className = 'form-status';
      
      // Récupérer les valeurs du formulaire
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Validation simple
      if (!name || !email || !message) {
        formStatus.textContent = 'Tous les champs sont obligatoires.';
        formStatus.classList.add('error');
        return;
      }
      
      // Validation de l'email
      if (!isValidEmail(email)) {
        formStatus.textContent = 'Veuillez entrer une adresse email valide.';
        formStatus.classList.add('error');
        return;
      }
      
      // Simuler un envoi (dans une application réelle, ceci enverrait à un serveur)
      const submitButton = contactForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      formStatus.textContent = 'Envoi en cours...';
      formStatus.classList.add('sending');
      
      // Données à envoyer à l'API
      const formData = {
        name,
        email,
        message
      };
      
      // Envoyer les données à l'API
      fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi du message');
        }
        return response.json();
      })
      .then(data => {
        // Succès
        formStatus.textContent = 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.';
        formStatus.classList.add('success');
        formStatus.style.display = 'block';
        
        // Réinitialiser le formulaire
        contactForm.reset();
      })
      .catch(error => {
        console.error('Erreur:', error);
        formStatus.textContent = 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.';
        formStatus.classList.add('error');
        formStatus.style.display = 'block';
      })
      .finally(() => {
        submitButton.disabled = false;
      });
    });
    
    // Fonction de validation d'email
    function isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
  });