document.addEventListener("DOMContentLoaded", function () {
  // Sélection de l'élément formulaire de connexion
  const loginForm = document.getElementById("loginForm");

  // Vérifier si le formulaire de connexion est présent dans le DOM
  if (loginForm) {
    // Création d'un élément <div> pour afficher les messages de statut (succès ou erreur)
    const messageDiv = document.createElement("div");
    loginForm.appendChild(messageDiv); // Ajouter l'élément <div> au formulaire

    // Ajouter un écouteur d'événement pour la soumission du formulaire
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault(); // Empêcher la soumission par défaut du formulaire

      // Récupérer les valeurs des champs email et mot de passe
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        // Envoyer une requête POST à l'API pour tenter de se connecter
        const response = await fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Indiquer que les données sont en JSON
          },
          body: JSON.stringify({ email, password }), // Envoyer les données du formulaire sous forme de JSON
        });

        // Vérifier la réponse de l'API
        if (response.ok) {
          // Si la réponse est OK, extraire les données JSON
          const data = await response.json();
          if (data.token) {
            // Si un token est reçu, le stocker dans le stockage local
            localStorage.setItem("token", data.token);
            messageDiv.textContent = "Connexion réussie !"; // Afficher un message de succès
            messageDiv.style.color = "green"; // Changer la couleur du texte en vert
            window.location.href = "index.html"; // Rediriger l'utilisateur vers la page d'accueil
          }
        } else if (response.status === 401) {
          // Si le statut est 401, l'email ou le mot de passe est incorrect
          throw new Error("Email ou mot de passe incorrect.");
        } else if (response.status === 404) {
          // Si le statut est 404, l'utilisateur n'a pas été trouvé
          throw new Error("Utilisateur non trouvé.");
        } else {
          // Autres erreurs HTTP
          throw new Error("Erreur : " + response.statusText);
        }
      } catch (error) {
        // En cas d'erreur, afficher un message d'erreur
        messageDiv.textContent = "Erreur : " + error.message;
        messageDiv.style.color = "red"; // Changer la couleur du texte en rouge
      }
    });
  }
});
