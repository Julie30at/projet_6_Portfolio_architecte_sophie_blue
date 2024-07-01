//récupération des projets de l'API
async function ArchitectProjects() {

          const response = await fetch("http://localhost:5678/api/works");
          const projects = await response.json();
          console.log(projects);

          //récupération de la gallerie dans le DOM du HTML
          const gallery = document.querySelector(".gallery");
          
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
ArchitectProjects();