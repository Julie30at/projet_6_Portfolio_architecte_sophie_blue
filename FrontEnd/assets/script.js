document.addEventListener('DOMContentLoaded', function() {
    // Définition de l'URL de l'API
    const url = "http://localhost:5678/api";

    // Récupération des éléments du DOM nécessaires
    const gallery = document.querySelector(".gallery");
    const btnFilter = document.getElementById("btnFilter");
    const modal = document.querySelector('#modals');
    const modal1Content = document.querySelector('.modalContent1');
    const modal2Content = document.querySelector('.modalContent2');
    const closeBtn = document.querySelector('.closeBtn');
    const closeBtn2 = document.querySelector('.closeBtn2');
    const backArrow = document.querySelector('.backArrow');
    const addProject = document.querySelector('.addProject');
    const loginLink = document.getElementById('infoLog');
    const editLink = document.getElementById('editLink');
    const editBar = document.getElementById('editionMode');
    const fileInput = document.getElementById('image');
    const previewImage = document.getElementById('previewImage');
    const form = document.getElementById('addNewProject');
    const titleInput = document.getElementById('title');
    const categoryInput = document.getElementById('category');
    const errorMessage = document.getElementById('error-message');

    // Initialisation de l'application
    init();

    // Fonction d'initialisation : configure l'état initial de l'application
    function init() {
        // Cacher les modales au chargement initial
        modal.style.display = 'none';
        modal1Content.style.display = 'none';
        modal2Content.style.display = 'none';

        setupEventListeners();  // Configurer les écouteurs d'événements
        updateLinks();          // Mettre à jour les liens de connexion et d'édition
        fetchWorks();           // Récupérer les projets et mettre à jour la galerie
        fetchCategories();      // Récupérer les catégories pour les filtres et le formulaire
    }

    // Fonction asynchrone pour récupérer les projets de l'API
    async function fetchWorks(categoryId = null) {
        try {
            const response = await fetch(`${url}/works`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des projets');
            }
            const projects = await response.json();
            updateGallery(projects, categoryId); // Met à jour la galerie avec les projets récupérés
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
        }
    }

    // Fonction pour mettre à jour la galerie avec les projets
    function updateGallery(projects, categoryId) {
        gallery.innerHTML = ''; // Réinitialiser le contenu de la galerie
        const modalGallery = document.getElementById("modalGallery");
        modalGallery.innerHTML = ''; // Réinitialiser le contenu de la galerie dans la modale

        // Ajouter chaque projet à la galerie et à la galerie de la modale
        projects.forEach(work => {
            if (categoryId === null || work.categoryId === categoryId) {
                const figure = createFigure(work);
                gallery.appendChild(figure); // Ajouter la figure à la galerie principale

                const modalFigure = createFigure(work, true);
                modalFigure.classList.add("modal-figure");
                modalGallery.appendChild(modalFigure); // Ajouter la figure à la galerie de la modale
            }
        });
    }

    // Fonction pour créer une figure pour un projet
    function createFigure(work, isModal = false) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figcaption = document.createElement("figcaption");

        img.src = work.imageUrl; // Définir l'URL de l'image du projet
        img.alt = work.title; // Définir le texte alternatif de l'image
        figcaption.textContent = work.title; // Définir le texte de la légende

        figure.appendChild(img); // Ajouter l'image à la figure
        figure.appendChild(figcaption); // Ajouter la légende à la figure

        if (isModal) {
            // Ajouter un bouton de suppression si dans la modale
            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener('click', () => {
                console.log(`Projet ${work.title} supprimé avec succès.`);
                deleteProject(work, figure); // Appeler la fonction pour supprimer le projet
            });
            figure.appendChild(deleteButton); // Ajouter le bouton de suppression à la figure
        }

        return figure; // Retourner la figure créée
    }

    // Fonction pour supprimer un projet
    async function deleteProject(work, figureElement) {
        const token = localStorage.getItem('token'); // Récupérer le token d'authentification
        if (!token) {
            alert('Vous devez être connecté pour supprimer un projet.');
            return;
        }

        try {
            const response = await fetch(`${url}/works/${work.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                figureElement.remove(); // Supprimer l'élément de la galerie
            } else {
                // Gérer les erreurs en fonction du code de statut HTTP
                if (response.status === 401) {
                    alert('Vous n\'êtes pas autorisé à supprimer ce projet. Assurez-vous que vous êtes connecté.');
                } else {
                    console.error('Erreur lors de la suppression du projet:', response.statusText);
                    alert('Erreur lors de la suppression du projet.');
                }
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            alert('Erreur lors de la suppression du projet.');
        }
    }

    // Fonction asynchrone pour récupérer les catégories des projets de l'API
    async function fetchCategories() {
        try {
            const response = await fetch(`${url}/categories`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des catégories');
            }
            const categories = await response.json();
            updateCategoryButtons(categories); // Met à jour les boutons de filtre avec les catégories
            updateCategoryOptions(categories); // Met à jour les options du menu déroulant
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
        }
    }

    // Fonction pour mettre à jour les boutons de filtre avec les catégories
    function updateCategoryButtons(categories) {
        btnFilter.innerHTML = ''; // Réinitialiser le contenu des boutons de filtre

        // Ajouter un bouton "Tous" en plus des catégories récupérées
        const allCategories = [{ id: null, name: "Tous" }, ...categories];
        let selectedButton = null;

        allCategories.forEach(category => {
            const buttonCtg = document.createElement("button");
            buttonCtg.id = category.id;
            buttonCtg.textContent = category.name;
            buttonCtg.classList.add("filter-button");

            btnFilter.appendChild(buttonCtg); // Ajouter le bouton au conteneur des filtres

            // Ajouter un gestionnaire d'événement pour filtrer les projets par catégorie
            buttonCtg.addEventListener("click", () => {
                if (selectedButton) {
                    selectedButton.classList.remove('active');
                }
                selectedButton = buttonCtg;
                selectedButton.classList.add('active');

                fetchWorks(category.id); // Recharger les projets avec le filtre sélectionné
            });
        });
    }

    // Fonction pour mettre à jour les options du menu déroulant
    function updateCategoryOptions(categories) {
        categoryInput.innerHTML = ''; // Réinitialiser le contenu des options du menu

        // Ajouter une option par défaut (vide)
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "";
        categoryInput.appendChild(defaultOption);

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id; // Utiliser l'ID comme valeur de l'option
            option.textContent = category.name; // Définir le texte de l'option
            categoryInput.appendChild(option); // Ajouter l'option au menu déroulant
        });
    }

    // Fonction pour configurer les écouteurs d'événements
    function setupEventListeners() {
        // Configurer les événements pour afficher les modales
        editLink.addEventListener("click", () => showModal('modal1'));
        addProject.addEventListener("click", () => showModal('modal2'));
        backArrow.addEventListener("click", () => showModal('modal1'));

        // Configurer l'événement pour l'aperçu de l'image sélectionnée
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const btnValidate = document.getElementById('btnValidate');
                const addPictureBackground = document.getElementById('addPictureBackground');
                const addPictureBtn = document.getElementById('addPicture');
                const addPictureTxt = document.getElementById('addPictureTxt');
                const reader = new FileReader();
                reader.onload = function(e) {
                previewImage.src = e.target.result;
                addPictureBtn.style.display = 'none';
                addPictureTxt.style.display = 'none';
                previewImage.style.margin = '0';
                addPictureBackground.style.padding = '0'
                btnValidate.style.backgroundColor ='#1D6154'
                };
                reader.readAsDataURL(file);
            }
        });

        // Configurer l'événement pour la soumission du formulaire
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); // Empêcher la soumission par défaut du formulaire

            if (validateForm()) {
                const formData = new FormData();
                formData.append('image', fileInput.files[0]);
                formData.append('title', titleInput.value);
                formData.append('category', categoryInput.value);

                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Vous devez être connecté pour ajouter un projet.');
                    return;
                }

                try {
                    const response = await fetch(`${url}/works`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        },
                        body: formData
                    });

                    const data = await response.json();

                    if (response.ok) {
                        form.reset(); // Réinitialiser le formulaire
                        previewImage.src = './assets/icons/picture-svgrepo-com.svg'; // Réinitialiser l'image de prévisualisation
                        closeModal(); // Fermer la modale
                        fetchWorks(); // Mettre à jour la galerie avec le nouveau projet
                    } else if (response.status === 400) {
                        errorMessage.textContent = 'Les données envoyées sont incorrectes. Veuillez vérifier les champs.';
                    } else if (response.status === 401) {
                        alert('Non autorisé. Veuillez vous connecter.');
                    } else if (response.status === 500) {
                        alert('Erreur interne. Veuillez réessayer plus tard.');
                    } else {
                        alert('Erreur lors de l\'envoi des données.');
                    }
                } catch (error) {
                    console.error('Erreur réseau:', error);
                    alert('Erreur de réseau. Veuillez réessayer plus tard.');
                }
            } else {
                errorMessage.textContent = 'Veuillez remplir tous les champs correctement.';
            }
        });

        // Configurer les événements pour fermer les modales
        closeBtn.addEventListener("click", () => closeModal());
        closeBtn2.addEventListener("click", () => closeModal());

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(); // Fermer la modale si l'utilisateur clique à l'extérieur
            }
        });

        // Configurer l'événement pour fermer les modales avec la touche Échap
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    }

    // Fonction pour afficher une modale spécifique
    function showModal(modalType) {
        if (modalType === 'modal1') {
            modal1Content.style.display = 'flex';
            modal2Content.style.display = 'none';
            fetchWorks(); // Charger les projets pour la modale 1
        } else if (modalType === 'modal2') {
            modal1Content.style.display = 'none';
            modal2Content.style.display = 'flex';
        }
        modal.style.display = 'flex'; // Afficher la modale
    }

    // Fonction pour fermer la modale
    function closeModal() {
        modal.style.display = 'none'; // Cacher la modale
        modal1Content.style.display = 'none';
        modal2Content.style.display = 'none';
    }

    // Fonction pour valider le formulaire avant envoi
    function validateForm() {
        const file = fileInput.files[0];
        const title = titleInput.value;
        const category = categoryInput.value;

        // Vérifier que tous les champs requis sont remplis
        if (title.trim() !== '' && category.trim() !== '' && file) {
            return true;
        } else {
            errorMessage.classList.remove('hidden'); // Afficher les messages d'erreur
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

    // Fonction pour mettre à jour les liens de connexion et d'édition
    function updateLinks() {
        if (localStorage.getItem('token')) {
            loginLink.textContent = 'logout'; // Afficher 'logout' si connecté
            loginLink.addEventListener('click', function(event) {
                event.preventDefault();
                localStorage.removeItem('token'); // Déconnexion de l'utilisateur
                window.location.href = 'index.html'; // Redirection vers la page d'accueil
            });

            editLink.style.display = 'inline'; // Afficher le lien d'édition
            editBar.style.display = 'flex'; // Afficher la barre d'édition
            btnFilter.style.display = 'none'; // Cacher les filtres si connecté
        } else {
            loginLink.textContent = 'login'; // Afficher 'login' si non connecté
            editLink.style.display = 'none'; // Cacher le lien d'édition
            editBar.style.display = 'none'; // Cacher la barre d'édition
        }
    }
});
