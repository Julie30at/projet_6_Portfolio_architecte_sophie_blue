// Récupération de la galerie dans le DOM du HTML
const gallery = document.querySelector(".gallery");

// Récupération de l'élément btnFilter dans le DOM du HTML
const btnFilter = document.getElementById("btnFilter");

// Fonction asynchrone pour récupérer les projets de l'API
async function fetchWorks(categoryId = null) {
    // Envoie une requête HTTP GET à l'API pour récupérer les projets
    const response = await fetch("http://localhost:5678/api/works");
    // Récupération de la réponse au format JSON
    const projects = await response.json();

    // Efface les projets existants dans la galerie
    gallery.innerHTML = '';

    // Parcours chaque projet retourné par l'API
    projects.forEach(work => {
        // Vérifie si le projet appartient à la catégorie sélectionnée (ou toutes les catégories si categoryId est null)
        if (categoryId === null || work.categoryId === categoryId) {
            // Crée un élément figure pour le projet
            const figure = document.createElement("figure");
            // Crée un élément img pour l'image du projet
            const img = document.createElement("img");
            // Crée un élément figcaption pour le titre du projet
            const figcaption = document.createElement("figcaption");

            // Définit la source de l'image et le texte alternatif
            img.src = work.imageUrl;
            img.alt = work.title;
            // Définit le texte du figcaption comme étant le titre du projet
            figcaption.textContent = work.title;

            // Ajoute l'image et le figcaption à la figure
            figure.appendChild(img);
            figure.appendChild(figcaption);
            // Ajoute la figure à la galerie
            gallery.appendChild(figure);
        }
    });
}

// Fonction asynchrone pour récupérer les catégories des projets de l'API
async function fetchCategories() {
    // Envoie une requête HTTP GET à l'API pour récupérer les catégories
    const response = await fetch("http://localhost:5678/api/categories");
    // Récupération de la réponse au format JSON
    const categories = await response.json();

    // Nettoyage des anciens boutons et de leurs écouteurs d'événements
    btnFilter.innerHTML = '';

    // Création d'un Set pour stocker les catégories de manière unique
    const categorySet = new Set();

    // Ajout de la catégorie "Tous" au Set
    categorySet.add({ id: null, name: "Tous" });

    // Ajout des catégories de l'API au Set
    categories.forEach(category => categorySet.add(category));

    // Variable pour stocker le bouton actuellement sélectionné
    let selectedButton = null;

    // Création des boutons de filtres
    categorySet.forEach(category => {
        const buttonCtg = document.createElement("button");

        buttonCtg.id = category.id;
        buttonCtg.textContent = category.name;
        buttonCtg.classList.add("filter-button"); // Ajout d'une classe pour le style ou autres manipulations

        // Ajoute le bouton au conteneur des filtres
        btnFilter.appendChild(buttonCtg);

        // Ajout d'un écouteur d'événement pour le clic sur chaque bouton de catégorie
        buttonCtg.addEventListener("click", () => {
            console.log(`Projets de la catégorie : ${category.name}`);

            // Réinitialise le style du bouton précédemment sélectionné
            if (selectedButton) {
                selectedButton.style.color = ''; // Réinitialise la couleur du texte
                selectedButton.style.background = ''; // Réinitialise la couleur de fond
            }

            // Met à jour le bouton actuellement sélectionné
            selectedButton = buttonCtg;
            selectedButton.style.color = 'white';
            selectedButton.style.background = '#1D6154';

            // Appel de la fonction pour afficher les projets de la catégorie sélectionnée
            fetchWorks(category.id);
        });
    });
}

// Appel initial de la fonction pour afficher tous les projets
fetchWorks();

// Appel de la fonction pour récupérer et afficher les catégories
fetchCategories();

//gestion de l'interface utilisateur après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    const loginLink = document.getElementById('infoLog'); // Sélection du lien "login"
    const editLink = document.getElementById('editLink'); // Sélection du lien "modifier"
    const editBar = document.getElementById('editionMode');

    // Fonction pour mettre à jour les liens en fonction de l'état de connexion
    function updateLinks() {
        if (localStorage.getItem('token')) {
            loginLink.textContent = 'logout'; // Mettre à jour le texte en "logout"
            loginLink.addEventListener('click', function(event) {
                event.preventDefault();
                localStorage.removeItem('token'); // Supprime le token du localStorage pour simuler la déconnexion
                window.location.href = 'index.html'; // Redirige vers la page d'accueil
            });

            // Afficher le lien "modifier"
            editLink.style.display = 'visible'; // lien visible
            //logique du lien "modifier" 
            editLink.setAttribute('href', '#'); // URL appropriée pour la modification des projets

            editBar.style.display ='visible'; // barre d'édition visible

            btnFilter.style.display ='none'; // masquer les boutons filtres
        } else {
            loginLink.textContent = 'login'; // Mettre à jour le texte en "login" si l'utilisateur n'est pas connecté
            loginLink.setAttribute('href', '/FrontEnd/login.html'); // Défini l'attribut href pour la connexion

            // Masque le lien "modifier"
            editLink.style.display = 'none'; //lien masqué

            editBar.style.display = 'none'; // barre d'édition masquée
        }
    }

    // fonction pour mettre à jour les liens lors du chargement de la page
    updateLinks();
});