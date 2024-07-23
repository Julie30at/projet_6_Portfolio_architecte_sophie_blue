// Écouteur d'événements pour exécuter le code une fois que le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments dans le DOM
    const url = "http://localhost:5678/api";
    const gallery = document.querySelector(".gallery"); // Sélection de l'élément avec la classe "gallery"
    const btnFilter = document.getElementById("btnFilter"); // Sélection de l'élément avec l'ID "btnFilter"
    const modal = document.querySelector('.modal'); // Sélection de l'élément avec la classe "modal"
    const modal2 = document.getElementById('modal2'); // Sélection de l'élément avec l'ID "modal2"
    const closeBtn = modal.querySelector('.closeBtn'); // Sélection du bouton de fermeture dans la modal
    const closeBtn2 = modal2.querySelector('.closeBtn2'); // Sélection du bouton de fermeture dans la modal2
    const backArrow = modal2.querySelector('.backArrow'); // Sélection de la flèche de retour dans la modal2
    const addProject = document.querySelector('.addProject'); // Sélection de l'élément avec la classe "addProject"
    const loginLink = document.getElementById('infoLog'); // Sélection de l'élément avec l'ID "infoLog"
    const editLink = document.getElementById('editLink'); // Sélection de l'élément avec l'ID "editLink"
    const editBar = document.getElementById('editionMode'); // Sélection de l'élément avec l'ID "editionMode"
    const fileInput = document.getElementById('image'); // Sélection de l'élément avec l'ID "image"
    const previewImage = document.getElementById('previewImage'); // Sélection de l'élément avec l'ID "previewImage"
    const form = document.getElementById('addNewProject'); // Sélection de l'élément avec l'ID "addNewProject"
    const titleInput = document.getElementById('title'); // Sélection de l'élément avec l'ID "title"
    const categoryInput = document.getElementById('category'); // Sélection de l'élément avec l'ID "category"
    const errorMessage = document.getElementById('error-message'); // Sélection de l'élément avec l'ID "error-message"

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
    }

    // Fonction asynchrone pour récupérer les projets de l'API
    async function fetchWorks(categoryId = null) {
        try {
            const response = await fetch(`${url}/works`); // Requête pour obtenir les projets
            const projects = await response.json(); // Conversion de la réponse en JSON
            updateGallery(projects, categoryId); // Mise à jour de la galerie avec les projets
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error); // Affichage de l'erreur en cas d'échec
        }
    }

    // Fonction pour mettre à jour la galerie avec les projets
    function updateGallery(projects, categoryId) {
        gallery.innerHTML = ''; // Réinitialise le contenu de la galerie
        const modalGallery = document.getElementById("modal-gallery"); // Sélection de la galerie modale
        modalGallery.innerHTML = ''; // Réinitialise le contenu de la galerie modale

        projects.forEach(work => { // Parcours de chaque projet
            if (categoryId === null || work.categoryId === categoryId) { // Filtre les projets par catégorie
                const figure = createFigure(work); // Création d'une figure pour le projet
                gallery.appendChild(figure); // Ajout de la figure à la galerie

                const modalFigure = createFigure(work, true); // Création d'une figure pour la modale
                modalFigure.classList.add("modal-figure"); // Ajout d'une classe spécifique pour la modale
                modalGallery.appendChild(modalFigure); // Ajout de la figure à la galerie modale
            }
        });
    }

    // Fonction pour créer une figure pour un projet
    function createFigure(work, isModal = false) {
        const figure = document.createElement("figure"); // Création de l'élément figure
        const img = document.createElement("img"); // Création de l'élément image
        const figcaption = document.createElement("figcaption"); // Création de l'élément figcaption

        img.src = work.imageUrl; // Définition de la source de l'image
        img.alt = work.title; // Définition de l'attribut alt de l'image
        figcaption.textContent = work.title; // Définition du texte de la légende

        figure.appendChild(img); // Ajout de l'image à la figure
        figure.appendChild(figcaption); // Ajout de la légende à la figure

        if (isModal) { // Si la figure est pour une modale
            const deleteButton = document.createElement("button"); // Création d'un bouton de suppression
            deleteButton.innerHTML = '<i class="fa fa-trash"></i>'; // Définition de l'icône du bouton
            deleteButton.classList.add("delete-button"); // Ajout d'une classe au bouton
            deleteButton.addEventListener('click', () => { // Ajout d'un écouteur d'événement pour la suppression
                console.log(`Projet ${work.title} supprimé avec succès.`);
                deleteProject(work, figure); // Appel de la fonction de suppression du projet
            });
            figure.appendChild(deleteButton); // Ajout du bouton à la figure
        }

        return figure; // Retourne la figure créée
    }

    // Fonction pour supprimer un projet
    async function deleteProject(work, figureElement) {
        const token = localStorage.getItem('token'); // Récupère le token d'authentification
        if (!token) {
            alert('Vous devez être connecté pour supprimer un projet.');
            return;
        }

        try {
            const response = await fetch(`${url}/works/${work.id}`,  {
                method: 'DELETE', // Méthode HTTP DELETE
                headers: {
                    'Authorization': `Bearer ${token}` // En-tête d'autorisation
                }
            });

            if (response.ok) { // Si la réponse est OK
                figureElement.remove(); // Suppression de l'élément figure du DOM
                console.log(`Projet ${work.title} supprimé avec succès.`);
            } else {
                if (response.status === 401) { // Si l'utilisateur n'est pas autorisé
                    alert('Vous n\'êtes pas autorisé à supprimer ce projet. Assurez-vous que vous êtes connecté.');
                } else {
                    console.error('Erreur lors de la suppression du projet:', response.statusText);
                    alert('Erreur lors de la suppression du projet.');
                }
            }
        } catch (error) { // En cas d'erreur de réseau ou autre
            console.error('Erreur lors de la suppression du projet:', error);
            alert('Erreur lors de la suppression du projet.');
        }
    }

    // Fonction asynchrone pour récupérer les catégories des projets de l'API
    async function fetchCategories() {
        try {
            const response = await fetch(`${url}/categories`); // Requête pour obtenir les catégories
            const categories = await response.json(); // Conversion de la réponse en JSON
            updateCategoryButtons(categories); // Mise à jour des boutons de catégories
            updateCategoryOptions(categories);
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error); // Affichage de l'erreur en cas d'échec
        }
    }

    // Fonction pour mettre à jour les boutons de filtre avec les catégories
    function updateCategoryButtons(categories) {
        btnFilter.innerHTML = ''; // Réinitialise le contenu du conteneur de filtres

        const allCategories = [{ id: null, name: "Tous" }, ...categories]; // Ajoute l'option "Tous" à la liste des catégories
        let selectedButton = null; // Variable pour garder trace du bouton sélectionné

        allCategories.forEach(category => { // Parcours de chaque catégorie
            const buttonCtg = document.createElement("button"); // Création d'un bouton pour la catégorie
            buttonCtg.id = category.id; // Définition de l'ID du bouton
            buttonCtg.textContent = category.name; // Définition du texte du bouton
            buttonCtg.classList.add("filter-button"); // Ajout d'une classe au bouton

            btnFilter.appendChild(buttonCtg); // Ajout du bouton au conteneur de filtres

            buttonCtg.addEventListener("click", () => { // Ajout d'un écouteur d'événement pour le clic
                if (selectedButton) {
                    selectedButton.classList.remove('active'); // Retire la classe active du bouton précédemment sélectionné
                }
                selectedButton = buttonCtg; // Met à jour le bouton sélectionné
                selectedButton.classList.add('active'); // Ajoute la classe active au bouton sélectionné

                fetchWorks(category.id); // Appel de la fonction pour récupérer les projets de la catégorie sélectionnée
            });
        });
    }

     // Fonction pour mettre à jour les options du menu déroulant
    function updateCategoryOptions(categories) {
        categoryInput.innerHTML = '';

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Sélectionner une catégorie";
        categoryInput.appendChild(defaultOption);

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            categoryInput.appendChild(option);
        });
    }


    // Fonction pour configurer les écouteurs d'événements
    function setupEventListeners() {
        editLink.addEventListener("click", showModal); // Affiche la première modale au clic sur le lien d'édition
        addProject.addEventListener("click", () => {
            closeModal(); // Ferme la première modale
            showModal2(); // Affiche la deuxième modale
        });

        fileInput.addEventListener('change', function(event) { // Écouteur pour la modification de l'entrée de fichier
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result; // Met à jour l'image de prévisualisation
                };
                reader.readAsDataURL(file); // Lit le fichier comme URL de données
                console.log("Aperçu photo");
            }
        });

        form.addEventListener('submit', async function(event) { // Écouteur pour la soumission du formulaire
            event.preventDefault();

            if (validateForm()) { // Si le formulaire est valide
                const categoryName = categoryInput.value; // Récupère le nom de la catégorie
                const categoryId = getCategoryId(categoryName); // Convertit le nom de la catégorie en ID

                if (categoryId === null) { // Si la catégorie n'est pas reconnue
                    errorMessage.textContent = 'Catégorie non reconnue.';
                    return;
                }

                const formData = new FormData(); // Création de l'objet FormData pour l'envoi des données
                formData.append('image', fileInput.files[0]);
                formData.append('title', titleInput.value);
                formData.append('category', categoryId);

                const token = localStorage.getItem('token'); // Récupère le token d'authentification
                if (!token) {
                    alert('Vous devez être connecté pour ajouter un projet.');
                    return;
                }

                try {
                    const response = await fetch(`${url}/works`, {
                        method: 'POST', // Méthode HTTP POST
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        },
                        body: formData // Envoie des données du formulaire
                    });

                    if (response.ok) { // Si la réponse est OK
                        const data = await response.json();
                        console.log('Projet ajouté:', data);
                        form.reset(); // Réinitialise le formulaire
                        previewImage.src = './assets/icons/picture-svgrepo-com.svg'; // Réinitialise l'image de prévisualisation
                        closeModal2(); // Ferme la deuxième modale
                        fetchWorks(); // Récupère et met à jour les projets
                    } else if (response.status === 400) { // Si les données envoyées sont incorrectes
                        errorMessage.textContent = 'Les données envoyées sont incorrectes. Veuillez vérifier les champs.';
                    } else if (response.status === 401) { // Si l'utilisateur n'est pas autorisé
                        alert('Non autorisé. Veuillez vous connecter.');
                    } else if (response.status === 500) { // Si une erreur interne se produit
                        alert('Erreur interne. Veuillez réessayer plus tard.');
                    } else {
                        alert('Erreur lors de l\'envoi des données.');
                    }
                } catch (error) { // En cas d'erreur de réseau ou autre
                    console.error('Erreur réseau:', error);
                    alert('Erreur de réseau. Veuillez réessayer plus tard.');
                }
            } else {
                errorMessage.textContent = 'Veuillez remplir tous les champs correctement.'; // Message d'erreur si le formulaire est invalide
            }
        });

        closeBtn.addEventListener("click", closeModal); // Ferme la première modale au clic sur le bouton de fermeture
        closeBtn2.addEventListener("click", closeModal2); // Ferme la deuxième modale au clic sur le bouton de fermeture
        backArrow.addEventListener("click", () => {
            closeModal2(); // Ferme la deuxième modale
            showModal(); // Affiche la première modale
            console.log("Retour modal");
        });

        modal.addEventListener('click', (event) => { // Ferme la première modale si l'utilisateur clique à l'extérieur
            if (event.target === modal) {
                closeModal();
                console.log("Fermer modal");
            }
        });

        modal2.addEventListener('click', (event) => { // Ferme la deuxième modale si l'utilisateur clique à l'extérieur
            if (event.target === modal2) {
                closeModal2();
                console.log("Fermer modal");
            }
        });

        document.addEventListener('keydown', (event) => { // Ferme les modales si l'utilisateur appuie sur la touche Échap
            if (event.key === 'Escape') {
                closeModal();
                closeModal2();
                console.log("Fermer modal");
            }
        });
    }

    // Fonction pour afficher la première modal
    function showModal() {
        modal.style.display = 'block'; // Affiche la première modale
        fetchWorks(); // Récupère et met à jour les projets
        console.log("Afficher modal");
    }

    // Fonction pour fermer la première modal
    function closeModal() {
        modal.style.display = 'none'; // Masque la première modale
        console.log("Fermer modal");
    }

    // Fonction pour afficher la deuxième modal
    function showModal2() {
        modal2.style.display = 'block'; // Affiche la deuxième modale
        console.log("Afficher modal2");
    }

    // Fonction pour valider le formulaire
    function validateForm() {
        const file = fileInput.files[0];
        const title = titleInput.value;
        const category = categoryInput.value;

        if (title.trim() !== '' && category.trim() !== '' && file) { // Si tous les champs sont remplis correctement
            return true;
        } else {
            errorMessage.classList.remove('hidden'); // Affiche le message d'erreur
            if (title.trim() === '') {
                errorMessage.textContent = 'Le titre est requis.';
            } else if (category.trim() === '') {
                errorMessage.textContent = 'La catégorie est requise.';
            } else if (!file) {
                errorMessage.textContent = 'Une image est requise.';
            }
            return false;
        }
    }

    // Fonction pour fermer la deuxième modal
    function closeModal2() {
        modal2.style.display = 'none'; // Masque la deuxième modale
        console.log("Fermer modal2");
    }

    // Fonction pour mettre à jour les liens de connexion et d'édition
    function updateLinks() {
        if (localStorage.getItem('token')) { // Si l'utilisateur est connecté
            loginLink.textContent = 'logout'; // Change le texte du lien de connexion en "logout"
            loginLink.addEventListener('click', function(event) { // Écouteur d'événement pour déconnexion
                event.preventDefault();
                localStorage.removeItem('token'); // Supprime le token
                window.location.href = 'index.html'; // Redirige vers la page d'accueil
            });

            editLink.style.display = 'inline'; // Affiche le lien d'édition
            editBar.style.display = 'block'; // Affiche la barre d'édition
            btnFilter.style.display = 'none'; // Masque les boutons de filtre
        } else {
            loginLink.textContent = 'login'; // Change le texte du lien de connexion en "login"
            editLink.style.display = 'none'; // Masque le lien d'édition
            editBar.style.display = 'none'; // Masque la barre d'édition
        }
    }

    // Fonction pour obtenir l'ID de la catégorie à partir du nom
    function getCategoryId(categoryName) {
        const categories = {
            "Objets": 1,
            "Appartements": 2,
            "Hotels & restaurants": 3
        };
        return categories[categoryName] || null; // Retourne l'ID de la catégorie ou null si non trouvée
    }
});
