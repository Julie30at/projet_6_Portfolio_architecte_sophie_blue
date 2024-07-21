// Écouteur d'événements pour exécuter le code une fois que le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments dans le DOM
    const gallery = document.querySelector(".gallery");
    const btnFilter = document.getElementById("btnFilter");
    const modal = document.querySelector('.modal');
    const modal2 = document.getElementById('modal2');
    const closeBtn = modal.querySelector('.closeBtn');
    const closeBtn2 = modal2.querySelector('.closeBtn2');
    const backArrow = modal2.querySelector('.backArrow');
    const addProject = document.querySelector('.addProject');
    const loginLink = document.getElementById('infoLog');
    const editLink = document.getElementById('editLink');
    const editBar = document.getElementById('editionMode');
    const addNewProjectForm = document.getElementById('addNewProject');
    const addPicture = document.querySelector('.addPicture');
    const previewImage = document.getElementById('previewImage');
    const validateNewProject = document.getElementById('btnValidate');
   
    // Initialisation de l'application
    init();

    // Fonction d'initialisation
    function init() {
        // Masque les modales par défaut
        modal.style.display = 'none';
        modal2.style.display = 'none';

        // Configuration des écouteurs d'événements
        setupEventListeners();
        // Mise à jour des liens d'édition et de connexion
        updateLinks();
        // Récupère et affiche les projets
        fetchWorks();
        // Récupère et affiche les catégories
        fetchCategories();

         // Supprime le token du localStorage à la fermeture de la page
        window.addEventListener('beforeunload', () => {
            localStorage.removeItem('token');
        });
    }

    // Fonction asynchrone pour récupérer les projets de l'API
    async function fetchWorks(categoryId = null) {
        try {
            // Appel API pour récupérer les projets
            const response = await fetch("http://localhost:5678/api/works");
            // Conversion de la réponse en JSON
            const projects = await response.json();
            // Mise à jour de la galerie avec les projets récupérés
            updateGallery(projects, categoryId);
        } catch (error) {
            // Affichage d'un message d'erreur en cas d'échec de l'appel API
            console.error('Erreur lors de la récupération des projets:', error);
        }
    }

    // Fonction pour mettre à jour la galerie avec les projets
    function updateGallery(projects, categoryId) {
        // Efface le contenu actuel de la galerie
        gallery.innerHTML = '';
        // Récupération de l'élément galerie dans la modal
        const modalGallery = document.getElementById("modal-gallery");
        // Efface le contenu actuel de la galerie de la modal
        modalGallery.innerHTML = '';

        // Parcours chaque projet
        projects.forEach(work => {
            // Filtre les projets par catégorie si nécessaire
            if (categoryId === null || work.categoryId === categoryId) {
                // Crée une figure pour chaque projet et l'ajoute à la galerie
                const figure = createFigure(work);
                gallery.appendChild(figure);

                // Crée une figure pour chaque projet et l'ajoute à la galerie de la modal
                const modalFigure = createFigure(work, true);
                modalFigure.classList.add("modal-figure");
                modalGallery.appendChild(modalFigure);
            }
        });
    }

   // Fonction pour créer une figure pour un projet
function createFigure(work, isModal = false) {
    // Crée les éléments nécessaires (figure, img, figcaption)
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    // Défini les propriétés de l'image et du texte
    img.src = work.imageUrl;
    img.alt = work.title;
    figcaption.textContent = work.title;

    // Ajoute l'image et la légende à la figure
    figure.appendChild(img);
    figure.appendChild(figcaption);

    if (isModal) {
        // Ajoute un bouton de suppression pour chaque figure dans la modal
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="fa fa-trash"></i>'; //icône de suppression
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener('click', () => {
            console.log(`Projet ${work.title} supprimé avec succès.`);
            //deleteProject(work, figureElement);
        });
        figure.appendChild(deleteButton);
    }

    // Retourne la figure créée
    return figure;
}

// Fonction pour supprimer un projet
async function deleteProject(work, figureElement) {
    // Récupère le token d'authentification depuis le localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        // Si aucun token n'est trouvé, alerte l'utilisateur qu'il doit être connecté
        alert('Vous devez être connecté pour supprimer un projet.');
        return;
    }

    try {
        // Appel API pour supprimer le projet
        const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Vérifie si la réponse de l'API est correcte
        if (response.ok) {
            // Si la réponse est OK (200), supprime la figure du DOM
            figureElement.remove();
            console.log(`Projet ${work.title} supprimé avec succès.`);
        } else {
            // Si la réponse n'est pas OK, affiche un message d'erreur
            if (response.status === 401) {
                alert('Vous n\'êtes pas autorisé à supprimer ce projet. Assurez-vous que vous êtes connecté.');
            } else {
                console.error('Erreur lors de la suppression du projet:', response.statusText);
                alert('Erreur lors de la suppression du projet.');
            }
        }
    } catch (error) {
        // En cas d'erreur avec l'appel API, affiche un message d'erreur
        console.error('Erreur lors de la suppression du projet:', error);
        alert('Erreur lors de la suppression du projet.');
    }
}

    // Fonction asynchrone pour récupérer les catégories des projets de l'API
    async function fetchCategories() {
        try {
            // Appel API pour récupérer les catégories
            const response = await fetch("http://localhost:5678/api/categories");
            // Conversion de la réponse en JSON
            const categories = await response.json();
            // Mise à jour des boutons de catégorie avec les catégories récupérées
            updateCategoryButtons(categories);
        } catch (error) {
            // Affichage d'un message d'erreur en cas d'échec de l'appel API
            console.error('Erreur lors de la récupération des catégories:', error);
        }
    }

    // Fonction pour mettre à jour les boutons de filtre avec les catégories
    function updateCategoryButtons(categories) {
        // Efface le contenu actuel des boutons de filtre
        btnFilter.innerHTML = '';

        // Crée un ensemble de catégories unique avec une catégorie "Tous" par défaut
        const categorySet = new Set([{ id: null, name: "Tous" }, ...categories]);
        let selectedButton = null;

        // Parcours chaque catégorie
        categorySet.forEach(category => {
            // Crée un bouton pour chaque catégorie
            const buttonCtg = document.createElement("button");
            buttonCtg.id = category.id;
            buttonCtg.textContent = category.name;
            buttonCtg.classList.add("filter-button");

            // Ajoute le bouton de catégorie au conteneur de filtres
            btnFilter.appendChild(buttonCtg);

            // Ajoute un écouteur d'événements pour filtrer les projets par catégorie lorsque le bouton est cliqué
            buttonCtg.addEventListener("click", () => {
                console.log(`Projets de la catégorie : ${category.name}`);

                // Réinitialise les styles du bouton sélectionné précédemment
                if (selectedButton) {
                    selectedButton.classList.remove('active');
                }
                // Met à jour le bouton sélectionné
                selectedButton = buttonCtg;
                selectedButton.classList.add('active');

                // Récupère et affiche les projets de la catégorie sélectionnée
                fetchWorks(category.id);
            });
        });
    }

    // Fonction pour configurer les écouteurs d'événements
    function setupEventListeners() {
        // Affiche la modal principale lors du clic sur le lien d'édition
        editLink.addEventListener("click", showModal);
        // Ferme la modal principale et affiche la deuxième modal lors du clic sur le bouton "addProject"
        addProject.addEventListener("click", () => {
            closeModal();
            showModal2();
        });
        // Ferme la modal principale lors du clic sur le bouton de fermeture
        closeBtn.addEventListener("click", closeModal);
        // Ferme la deuxième modal lors du clic sur le bouton de fermeture
        closeBtn2.addEventListener("click", closeModal2);
        // Ferme la deuxième modal et affiche la modal principale lors du clic sur la flèche de retour
        backArrow.addEventListener("click", () => {
            closeModal2();
            showModal();
            console.log("retour modal");
        });

        // Ferme la modal principale lors du clic en dehors du contenu de la modal
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
                console.log("Fermer modal");
            }
        });

        // Ferme la deuxième modal lors du clic en dehors du contenu de la modal
        modal2.addEventListener('click', (event) => {
            if (event.target === modal2) {
                closeModal2();
                console.log("Fermer modal");
            }
        });

        // Ferme les modales lors de l'appui sur la touche Échap
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
                closeModal2();
                console.log("Fermer modal");
            }
        });
    }

    // Fonction pour afficher la première modal
    function showModal() {
        modal.style.display = 'block';
        fetchWorks();
        console.log("Afficher modal");
    }

    // Fonction pour fermer la première modal
    function closeModal() {
        modal.style.display = 'none';
        console.log("Fermer modal");
    }

    // Fonction pour afficher la deuxième modal
    function showModal2() {
        modal2.style.display = 'block';
        console.log("Afficher modal2");
    }

    // Fonction pour fermer la deuxième modal
    function closeModal2() {
        modal2.style.display = 'none';
        console.log("Fermer modal2");
    }

    // Fonction pour mettre à jour les liens de connexion et d'édition
    function updateLinks() {
        // Vérifie si un token est présent dans le localStorage
        if (localStorage.getItem('token')) {
            // Change le texte du lien de connexion en "logout"
            loginLink.textContent = 'logout';
            // Ajoute un écouteur d'événements pour gérer la déconnexion
            loginLink.addEventListener('click', function(event) {
                event.preventDefault();
                // Supprime le token du localStorage
                localStorage.removeItem('token');
                // Redirige vers la page d'accueil
                window.location.href = 'index.html';
            });

            // Affiche les éléments d'édition si l'utilisateur est connecté
            editLink.style.display = 'visible';
            editBar.style.display = 'visible';
            // Masque les boutons de filtre
            btnFilter.style.display = 'none';
        } else {
            // Change le texte du lien de connexion en "login"
            loginLink.textContent = 'login';
            // Masque les éléments d'édition si l'utilisateur n'est pas connecté
            editLink.style.display = 'none';
            editBar.style.display = 'none';
        }
    }
});