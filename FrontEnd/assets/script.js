// Récupération de la galerie dans le DOM du HTML
const gallery = document.querySelector(".gallery");

// Récupération de l'élément btnFilter dans le DOM du HTML
const btnFilter = document.getElementById("btnFilter");

// Fonction asynchrone pour récupérer les projets de l'API
async function fetchProjects(categoryId = null) {
    // Envoie une requête HTTP GET à l'API pour récupérer les projets
    const response = await fetch("http://localhost:5678/api/works");
    //réponse en format JSON
    const projects = await response.json();
    console.log(projects);

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

// Appel initial de la fonction pour afficher tous les projets
fetchProjects();

// Fonction asynchrone pour récupérer les catégories des projets de l'API
async function fetchCategories() {
    // Envoie une requête HTTP GET à l'API pour récupérer les catégories
    const response = await fetch("http://localhost:5678/api/categories");
    //réponse en format JSON
    const categories = await response.json();
    console.log(categories, "catégories");

    // Création du bouton "Tous" pour afficher tous les projets
    const allButton = document.createElement("button");
    allButton.id = "all";
    allButton.textContent = "Tous";
    allButton.classList.add("filter-button"); // Ajout d'une classe pour le style ou autres manipulations
    // Ajoute le bouton au conteneur des filtres
    btnFilter.appendChild(allButton);

    // Ajout d'un écouteur d'événement pour le clic sur le bouton "Tous"
    allButton.addEventListener("click", () => {
        console.log("Tous les projets");
        // Appel de la fonction pour afficher tous les projets
        fetchProjects();
    });

    // Parcours chaque catégorie retournée par l'API
    categories.forEach(category => {
        // Crée un bouton pour chaque catégorie
        const buttonCtg = document.createElement("button");

        buttonCtg.id = category.id;
        buttonCtg.textContent = category.name;
        buttonCtg.classList.add("filter-button"); // Ajout d'une classe pour le style ou autres manipulations

        // Ajoute le bouton au conteneur des filtres
        btnFilter.appendChild(buttonCtg);

        // Ajout d'un écouteur d'événement pour le clic sur chaque bouton de catégorie
        buttonCtg.addEventListener("click", () => {
            console.log(`Projets de la catégorie : ${category.name}`);
            // Appel de la fonction pour afficher les projets de la catégorie sélectionnée
            fetchProjects(category.id);
        });
    });
}

// Appel de la fonction pour récupérer et afficher les catégories
fetchCategories();