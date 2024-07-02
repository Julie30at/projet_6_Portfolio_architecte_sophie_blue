//récupération de la gallerie dans le DOM du HTML
          const gallery = document.querySelector(".gallery");

//récupération de btnFilter dans le DOM du HTML
          const btnFilter = document.getElementById("btnFilter");

//récupération des projets de l'API
async function fetchProjects() {

          const response = await fetch("http://localhost:5678/api/works");
          const projects = await response.json();
          console.log(projects);
          
          //modification du DOM pour chaque projet
          projects.forEach(project => {
              const figure = document.createElement("figure");
              const img = document.createElement("img");
              const figcaption = document.createElement("figcaption");

              img.src = project.imageUrl; 
              img.alt = project.title; 
              figcaption.textContent = project.title;

              figure.appendChild(img);
              figure.appendChild(figcaption);
              gallery.appendChild(figure);

            });
}

//appel de la fonction
fetchProjects();

//récupération des catégories des projets sur l'API
async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    console.log(categories, "catégories");

    //création du bouton "tous"
        const allButton = document.createElement("button");
        allButton.id = "all";
        allButton.textContent = "Tous";
        allButton.classList.add("filter-button"); // Ajout d'une classe pour le style ou autres manipulations
        btnFilter.appendChild(allButton);

    //écoute du clic    

        allButton.addEventListener("click", () => {
            console.log ("tous les projets")
        fetchProjects();
        });

    //création boutons des catégories

    categories.forEach(category => {
        const buttonCtg = document.createElement("button");

        buttonCtg.id = category.id;
        buttonCtg.textContent = category.name;
        buttonCtg.classList.add("filter-button"); // Ajout d'une classe pour le style ou autres manipulations

        btnFilter.appendChild(buttonCtg);
   

    buttonCtg.addEventListener("click", () => {
    });
  });
}

//appel de la fonction
fetchCategories();



