// Attend que le contenu du DOM soit complètement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', function() {
    
    // Sélectionne le formulaire de connexion par son ID
    const loginForm = document.getElementById('loginForm');
    
    // Crée un élément <div> pour afficher les messages de succès ou d'erreur
    const messageDiv = document.createElement('div');
    
    // Ajoute le messageDiv à la fin du formulaire de connexion
    loginForm.appendChild(messageDiv);

    // Ajoute un écouteur d'événement pour la soumission du formulaire
    loginForm.addEventListener('submit', async function(event) {
        // Empêche l'action par défaut du formulaire (rechargement de la page)
        event.preventDefault();

        // Récupère les valeurs des champs email et password
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Envoie une requête POST à l'API de connexion
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST', // méthode de requête
                headers: {
                    'Content-Type': 'application/json', // Définit le type de contenu comme JSON
                },
                body: JSON.stringify({ email, password }), // Convertit les données de connexion en JSON
            });

            // Vérifie si la réponse est correcte (statut 200-299)
            if (response.ok) { // Utilisation de response.ok pour vérifier les statuts 200-299
                // Convertit la réponse en JSON si le statut est OK
                const data = await response.json();
                
                // Vérifie si la réponse contient un token
                if (data.token) {
                    // Stocke le token dans le local storage
                    localStorage.setItem('token', data.token);
                    
                    // Affiche un message de succès et change la couleur du texte en vert
                    messageDiv.textContent = 'Connexion réussie !';
                    messageDiv.style.color = 'green';

                    // Redirection après la connexion
                    window.location.href = 'index.html';
                }
            } else if (response.status === 401) {
                // Si la réponse a un statut 401, lève une erreur d'authentification
                throw new Error('Email ou mot de passe incorrect.');
            } else if (response.status === 404) {
                // Si la réponse a un statut 404, lève une erreur utilisateur non trouvé
                throw new Error('Utilisateur non trouvé.');
            } else {
                // Pour d'autres statuts d'erreur, lève une erreur inconnue
                throw new Error('Erreur : ' + response.statusText);
            }
        } catch (error) {
            // En cas d'erreur, affiche le message d'erreur et change la couleur du texte en rouge
            messageDiv.textContent = 'Erreur : ' + error.message;
            messageDiv.style.color = 'red';
        }
    });
});