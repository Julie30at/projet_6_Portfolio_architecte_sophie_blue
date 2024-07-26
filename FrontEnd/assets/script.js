document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments dans le DOM
    const url = "http://localhost:5678/api";
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

    // Fonction d'initialisation
    function init() {
        modal.style.display = 'none';
        modal1Content.style.display = 'none';
        modal2Content.style.display = 'none';

        setupEventListeners();
        updateLinks();
        fetchWorks();
        fetchCategories();
    }

    // Fonction asynchrone pour récupérer les projets de l'API
    async function fetchWorks(categoryId = null) {
        try {
            const response = await fetch(`${url}/works`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des projets');
            }
            const projects = await response.json();
            updateGallery(projects, categoryId);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
        }
    }

    // Fonction pour mettre à jour la galerie avec les projets
    function updateGallery(projects, categoryId) {
        gallery.innerHTML = '';
        const modalGallery = document.getElementById("modalGallery");
        modalGallery.innerHTML = '';

        projects.forEach(work => {
            if (categoryId === null || work.categoryId === categoryId) {
                const figure = createFigure(work);
                gallery.appendChild(figure);

                const modalFigure = createFigure(work, true);
                modalFigure.classList.add("modal-figure");
                modalGallery.appendChild(modalFigure);
            }
        });
    }

    // Fonction pour créer une figure pour un projet
    function createFigure(work, isModal = false) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figcaption = document.createElement("figcaption");

        img.src = work.imageUrl;
        img.alt = work.title;
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);

        if (isModal) {
            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener('click', () => {
                console.log(`Projet ${work.title} supprimé avec succès.`);
                deleteProject(work, figure);
            });
            figure.appendChild(deleteButton);
        }

        return figure;
    }

    // Fonction pour supprimer un projet
    async function deleteProject(work, figureElement) {
        const token = localStorage.getItem('token');
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
                figureElement.remove();
                console.log(`Projet ${work.title} supprimé avec succès.`);
            } else {
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
            updateCategoryButtons(categories);
            updateCategoryOptions(categories);
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
        }
    }

    // Fonction pour mettre à jour les boutons de filtre avec les catégories
    function updateCategoryButtons(categories) {
        btnFilter.innerHTML = '';

        const allCategories = [{ id: null, name: "Tous" }, ...categories];
        let selectedButton = null;

        allCategories.forEach(category => {
            const buttonCtg = document.createElement("button");
            buttonCtg.id = category.id;
            buttonCtg.textContent = category.name;
            buttonCtg.classList.add("filter-button");

            btnFilter.appendChild(buttonCtg);

            buttonCtg.addEventListener("click", () => {
                if (selectedButton) {
                    selectedButton.classList.remove('active');
                }
                selectedButton = buttonCtg;
                selectedButton.classList.add('active');

                fetchWorks(category.id);
            });
        });
    }

    // Fonction pour mettre à jour les options du menu déroulant
    function updateCategoryOptions(categories) {
        categoryInput.innerHTML = '';

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "";
        categoryInput.appendChild(defaultOption);

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id; // Utiliser l'ID pour la valeur
            option.textContent = category.name;
            categoryInput.appendChild(option);
        });
    }

    // Fonction pour configurer les écouteurs d'événements
    function setupEventListeners() {
        editLink.addEventListener("click", () => showModal('modal1'));
        addProject.addEventListener("click", () => showModal('modal2'));
        backArrow.addEventListener("click", () => showModal('modal1'));

        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
                console.log("Aperçu photo");
            }
        });

        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (validateForm()) {
                const categoryName = categoryInput.value;
                const categoryId = getCategoryId(categoryName);

                if (categoryId === null) {
                    errorMessage.textContent = 'Catégorie non reconnue.';
                    return;
                }

                const formData = new FormData();
                formData.append('image', fileInput.files[0]);
                formData.append('title', titleInput.value);
                formData.append('category', categoryId);

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

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Projet ajouté:', data);
                        form.reset();
                        previewImage.src = './assets/icons/picture-svgrepo-com.svg';
                        closeModal();
                        fetchWorks();
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

        closeBtn.addEventListener("click", () => closeModal());
        closeBtn2.addEventListener("click", () => closeModal());

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
                console.log("Fermer modals");
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
                console.log("Fermer modal");
            }
        });
    }

    // Fonction pour afficher une modale spécifique
    function showModal(modalType) {
        if (modalType === 'modal1') {
            modal1Content.style.display = 'flex';
            modal2Content.style.display = 'none';
            fetchWorks();
        } else if (modalType === 'modal2') {
            modal1Content.style.display = 'none';
            modal2Content.style.display = 'flex';
        }
        modal.style.display = 'flex';
    }

    // Fonction pour fermer la modale
    function closeModal() {
        modal.style.display = 'none';
        modal1Content.style.display = 'none';
        modal2Content.style.display = 'none';
        console.log("Fermer les modales");
    }

    // Fonction pour valider le formulaire
    function validateForm() {
        const file = fileInput.files[0];
        const title = titleInput.value;
        const category = categoryInput.value;

        if (title.trim() !== '' && category.trim() !== '' && file) {
            return true;
        } else {
            errorMessage.classList.remove('hidden');
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
            loginLink.textContent = 'logout';
            loginLink.addEventListener('click', function(event) {
                event.preventDefault();
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            });

            editLink.style.display = 'inline';
            editBar.style.display = 'flex';
            btnFilter.style.display = 'none';
        } else {
            loginLink.textContent = 'login';
            editLink.style.display = 'none';
            editBar.style.display = 'none';
        }
    }

    // Fonction pour obtenir l'ID de la catégorie à partir du nom
    function getCategoryId(categoryName) {
        const categories = {
            "Objets": 1,
            "Appartements": 2,
            "Hotels & restaurants": 3
        };
        return categories[categoryName] || null;
    }
});
