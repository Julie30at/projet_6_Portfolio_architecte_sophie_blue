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
            const response = await fetch("http://localhost:5678/api/works");
            const projects = await response.json();
            updateGallery(projects, categoryId);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
        }
    }

    // Fonction pour mettre à jour la galerie avec les projets
    function updateGallery(projects, categoryId) {
        gallery.innerHTML = '';
        const modalGallery = document.getElementById("modal-gallery");
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
            const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
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
            const response = await fetch("http://localhost:5678/api/categories");
            const categories = await response.json();
            updateCategoryButtons(categories);
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

    // Fonction pour configurer les écouteurs d'événements
    function setupEventListeners() {
        editLink.addEventListener("click", showModal);
        addProject.addEventListener("click", () => {
            closeModal();
            showModal2();
        });

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
                // Conversion de la catégorie en ID numérique
                const categoryName = categoryInput.value;
                const categoryId = getCategoryId(categoryName);

                if (categoryId === null) {
                    errorMessage.textContent = 'Catégorie non reconnue.';
                    return;
                }

                // Création du FormData pour l'envoi
                const formData = new FormData();
                formData.append('image', fileInput.files[0]);
                formData.append('title', titleInput.value);
                formData.append('category', categoryId);

                // Récupération du token d'authentification
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Vous devez être connecté pour ajouter un projet.');
                    return;
                }

                // Envoi de la requête POST
                try {
                    const response = await fetch("http://localhost:5678/api/works", {
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
                        closeModal2(); 
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
        
        closeBtn.addEventListener("click", closeModal);
        closeBtn2.addEventListener("click", closeModal2);
        backArrow.addEventListener("click", () => {
            closeModal2();
            showModal();
            console.log("Retour modal");
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
                console.log("Fermer modal");
            }
        });

        modal2.addEventListener('click', (event) => {
            if (event.target === modal2) {
                closeModal2();
                console.log("Fermer modal");
            }
        });

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

    // Fonction pour valider le formulaire
    function validateForm() {
        const file = fileInput.files[0];
        const title = titleInput.value;
        const category = categoryInput.value;

        console.log("Validation Form: ", {
        file: file,
        title: title,
        category: category
    });

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

    // Fonction pour fermer la deuxième modal
    function closeModal2() {
        modal2.style.display = 'none';
        console.log("Fermer modal2");
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
            editBar.style.display = 'block';
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