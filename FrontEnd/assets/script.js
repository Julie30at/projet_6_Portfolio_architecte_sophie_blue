// Récupération des éléments dans le DOM
const gallery = document.querySelector(".gallery"); // Sélectionne l'élément avec la classe "gallery"
const btnFilter = document.getElementById("btnFilter"); // Sélectionne l'élément avec l'id "btnFilter"

// Fonction asynchrone pour récupérer les projets de l'API
async function fetchWorks(categoryId = null) {
    const response = await fetch("http://localhost:5678/api/works"); // Envoie une requête GET à l'API pour obtenir les projets
    const projects = await response.json(); // Convertit la réponse en format JSON

    // Efface les projets existants dans la galerie
    gallery.innerHTML = ''; // Vide le contenu actuel de l'élément galerie

    // Efface les projets existants dans la galerie de la modal
    const modalGallery = document.getElementById("modal-gallery");
    modalGallery.innerHTML = '';

    // Parcours chaque projet retourné par l'API
    projects.forEach(work => {
        if (categoryId === null || work.categoryId === categoryId) {
            // Si aucune catégorie n'est sélectionnée ou si le projet appartient à la catégorie sélectionnée
            const figure = createFigure(work); // Crée une figure pour le projet
            gallery.appendChild(figure); // Ajoute la figure à la galerie
            modalGallery.appendChild(figure.cloneNode(true)); // Clone pour la modal
        }
    });
}

// Fonction pour créer une figure pour un projet
function createFigure(work) {
    const figure = document.createElement("figure"); // Crée un élément figure
    const img = document.createElement("img"); // Crée un élément img
    const figcaption = document.createElement("figcaption"); // Crée un élément figcaption

    img.src = work.imageUrl; // Définit la source de l'image
    img.alt = work.title; // Définit le texte alternatif de l'image
    figcaption.textContent = work.title; // Définit le texte du figcaption

    figure.appendChild(img); // Ajoute l'image à la figure
    figure.appendChild(figcaption); // Ajoute le figcaption à la figure

    return figure; // Retourne la figure créée
}

// Fonction asynchrone pour récupérer les catégories des projets de l'API
async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories"); // Envoie une requête GET à l'API pour obtenir les catégories
    const categories = await response.json(); // Convertit la réponse en format JSON

    // Nettoyage des anciens boutons et de leurs écouteurs d'événements
    btnFilter.innerHTML = ''; // Vide le contenu actuel du conteneur des filtres

    // Création d'un Set pour stocker les catégories de manière unique
    const categorySet = new Set([{ id: null, name: "Tous" }, ...categories]); // Ajoute une catégorie "Tous" et les catégories obtenues de l'API au Set

    // Variable pour stocker le bouton actuellement sélectionné
    let selectedButton = null; // Initialisation de la variable

    // Création des boutons de filtres
    categorySet.forEach(category => {
        const buttonCtg = document.createElement("button"); // Crée un élément bouton

        buttonCtg.id = category.id; // Définit l'id du bouton
        buttonCtg.textContent = category.name; // Définit le texte du bouton
        buttonCtg.classList.add("filter-button"); // Ajoute une classe pour le style

        btnFilter.appendChild(buttonCtg); // Ajoute le bouton au conteneur des filtres

        // Ajout d'un écouteur d'événement pour le clic sur chaque bouton de catégorie
        buttonCtg.addEventListener("click", () => {
            console.log(`Projets de la catégorie : ${category.name}`); // Affiche un message dans la console

            // Mise à jour du style des boutons
            if (selectedButton) {
                selectedButton.style.color = ''; // Réinitialise la couleur du texte du bouton précédemment sélectionné
                selectedButton.style.background = ''; // Réinitialise la couleur de fond du bouton précédemment sélectionné
            }
            selectedButton = buttonCtg; // Met à jour le bouton actuellement sélectionné
            selectedButton.style.color = 'white'; // Change la couleur du texte du bouton sélectionné
            selectedButton.style.background = '#1D6154'; // Change la couleur de fond du bouton sélectionné

            // Afficher les projets de la catégorie sélectionnée
            fetchWorks(category.id); // Appelle la fonction fetchWorks avec l'id de la catégorie sélectionnée
        });
    });
}

// Gestion de l'interface utilisateur après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    const loginLink = document.getElementById('infoLog'); // Sélectionne l'élément avec l'id "infoLog"
    const editLink = document.getElementById('editLink'); // Sélectionne l'élément avec l'id "editLink"
    const editBar = document.getElementById('editionMode'); // Sélectionne l'élément avec l'id "editionMode"
    const modal = document.getElementById('modal'); // Sélectionne l'élément avec l'id "modal"
    const closeBtn = document.querySelector('.closeBtn'); // Sélectionne le premier élément avec la classe "closeBtn"

    // Masque la modale par défaut
    modal.style.display = 'none'; // Définit le style d'affichage de la modale à "none"

    // Afficher la modale
    editLink.addEventListener("click", () => {
        modal.style.display = 'block'; // Change le style d'affichage de la modale à "visible"
        fetchWorks(); // Recharge les projets pour la modal
        console.log("Afficher modal"); // Affiche un message dans la console
    });

    // Fermer la modale
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none'; // Change le style d'affichage de la modale à "none"
    });

     // Fermer la modal en cliquant à l'extérieur
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

     // Fermer la modal avec Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none'; // Ferme la modal si Échap est pressée
        }
    });

    // Met à jour les liens en fonction de l'état de connexion
    function updateLinks() {
        if (localStorage.getItem('token')) { // Vérifie si un token est stocké dans le localStorage
            loginLink.textContent = 'logout'; // Change le texte du lien de connexion à "logout"
            loginLink.addEventListener('click', function(event) {
                event.preventDefault(); // Empêche le comportement par défaut du lien
                localStorage.removeItem('token'); // Supprime le token du localStorage
                window.location.href = 'index.html'; // Redirige vers la page d'accueil
            });

            // Afficher les éléments de modification
            editLink.style.display = 'visible'; // Affiche le lien de modification
            editBar.style.display = 'visible'; // Affiche la barre d'édition
            btnFilter.style.display = 'none'; // Masque les boutons de filtre
        } else {
            loginLink.textContent = 'login'; // Change le texte du lien de connexion à "login"

            // Masquer les éléments de modification
            editLink.style.display = 'none'; // Masque le lien de modification
            editBar.style.display = 'none'; // Masque la barre d'édition
        }
    }

    // Met à jour les liens lors du chargement de la page
    updateLinks(); // Appelle la fonction pour mettre à jour les liens

    // Appel initial des fonctions pour afficher les projets et les catégories
    fetchWorks(); // Appelle la fonction pour afficher les projets
    fetchCategories(); // Appelle la fonction pour afficher les catégories
});