document.addEventListener("DOMContentLoaded", function () {
  // URL de l'API
  const url = "http://localhost:5678/api";

  // Récupération des éléments du DOM
  const gallery = document.querySelector(".gallery");
  const btnFilter = document.getElementById("btnFilter");
  const loginLink = document.getElementById("infoLog");
  const editLink = document.getElementById("editLink");
  const editBar = document.getElementById("editionMode");

  // Création dynamique des modales
  createModalsSection();

  // Récupération des éléments du DOM pour les modales
  const modal = document.querySelector("#modals");
  const modal1Content = document.querySelector(".modalContent1");
  const modal2Content = document.querySelector(".modalContent2");
  const closeBtn = document.querySelector(".closeBtn");
  const closeBtn2 = document.querySelector(".closeBtn2");
  const backArrow = document.querySelector(".backArrow");
  const addProject = document.querySelector(".addProject");
  const form = document.getElementById("addNewProject");
  const fileInput = document.getElementById("image");
  const previewImage = document.getElementById("previewImage");
  const titleInput = document.getElementById("title");
  const categoryInput = document.getElementById("category");
  const errorMessage = document.getElementById("error-message");

  // Initialisation de l'application
  init();

  // Fonction d'initialisation de l'application
  function init() {
    
    setupEventListeners(); // Configure les écouteurs d'événements
    updateLinks(); // Met à jour les liens de connexion et d'édition
    fetchWorks(); // Récupère les projets et met à jour la galerie
    fetchCategories(); // Récupère les catégories pour les filtres et le formulaire
  }

  // Fonction asynchrone pour récupérer les projets de l'API
  async function fetchWorks(categoryId = null) {
    try {
      const response = await fetch(`${url}/works`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des projets");
      }
      const projects = await response.json();
      updateGallery(projects, categoryId); // Met à jour la galerie avec les projets récupérés
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
    }
  }

  // Fonction pour mettre à jour la galerie avec les projets
  function updateGallery(projects, categoryId) {
    gallery.innerHTML = ""; // Réinitialise le contenu de la galerie
    const modalGallery = document.getElementById("modalGallery");
    modalGallery.innerHTML = ""; // Réinitialise le contenu de la galerie dans la modale

    // Ajoute chaque projet à la galerie et à la galerie de la modale
    projects.forEach((work) => {
      if (categoryId === null || work.categoryId === categoryId) {
        const figure = createFigure(work);
        gallery.appendChild(figure); // Ajoute la figure à la galerie principale

        const modalFigure = createFigure(work, true);
        modalFigure.classList.add("modal-figure");
        modalGallery.appendChild(modalFigure); // Ajoute la figure à la galerie de la modale
      }
    });
  }

  // Fonction pour créer une figure pour un projet
  function createFigure(work, isModal = false) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src = work.imageUrl; // Défini l'URL de l'image du projet
    img.alt = work.title; // Défini le texte alternatif de l'image
    figcaption.textContent = work.title; // Défini le texte de la légende

    figure.appendChild(img); // Ajoute l'image à la figure
    figure.appendChild(figcaption); // Ajoute la légende à la figure

    if (isModal) {
      // Ajoute un bouton de suppression si dans la modale
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", () => {
        console.log(`Projet ${work.title} supprimé avec succès.`);
        deleteProject(work, figure); // Appel de la fonction pour supprimer le projet
      });
      figure.appendChild(deleteButton); // Ajoute le bouton de suppression à la figure
    }

    return figure; // Retourne la figure créée
  }

  // Fonction asynchrone pour récupérer les catégories des projets de l'API
  async function fetchCategories() {
    try {
      const response = await fetch(`${url}/categories`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des catégories");
      }
      const categories = await response.json();
      updateCategoryButtons(categories); // Met à jour les boutons de filtre avec les catégories
      updateCategoryOptions(categories); // Met à jour les options du menu déroulant
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    }
  }

  // Fonction pour mettre à jour les boutons de filtre avec les catégories
  function updateCategoryButtons(categories) {
    btnFilter.innerHTML = ""; // Réinitialise le contenu des boutons de filtre

    // Ajoute un bouton "Tous" en plus des catégories récupérées
    const allCategories = [{ id: null, name: "Tous" }, ...categories];
    let selectedButton = null;

    allCategories.forEach((category, index) => {
      const buttonCtg = document.createElement("button");
      buttonCtg.id = category.id;
      buttonCtg.textContent = category.name;
      buttonCtg.classList.add("filter-button");

       // Initialise le bouton "Tous" comme actif
    if (index === 0) {
      buttonCtg.classList.add("active");
      selectedButton = buttonCtg;
    }

      btnFilter.appendChild(buttonCtg); // Ajoute le bouton au conteneur des filtres

      // gestionnaire d'événement pour filtrer les projets par catégorie
      buttonCtg.addEventListener("click", () => {
        if (selectedButton) {
          selectedButton.classList.remove("active");
        }
        selectedButton = buttonCtg;
        selectedButton.classList.add("active");

        fetchWorks(category.id); // Recharge les projets avec le filtre sélectionné
      });
    });
  }

  // Fonction pour mettre à jour les options du menu déroulant
  function updateCategoryOptions(categories) {
    categoryInput.innerHTML = ""; // Réinitialise le contenu des options du menu

    // Ajoute une option par défaut (vide)
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "";
    categoryInput.appendChild(defaultOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id; // Utilise l'ID comme valeur de l'option
      option.textContent = category.name; // Défini le texte de l'option
      categoryInput.appendChild(option); // Ajoute l'option au menu déroulant
    });
  }

  // Fonction pour configurer les écouteurs d'événements
  function setupEventListeners() {
    // Configure les événements pour afficher les modales
    editLink.addEventListener("click", () => showModal("modal1"));
    addProject.addEventListener("click", () => showModal("modal2"));
    backArrow.addEventListener("click", () => showModal("modal1"));

    // Configure l'événement pour l'aperçu de l'image sélectionnée
    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const btnValidate = document.getElementById("btnValidate");
        const addPictureBackground = document.getElementById(
          "addPictureBackground"
        );
        const addPictureBtn = document.getElementById("addPicture");
        const addPictureTxt = document.getElementById("addPictureTxt");
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          addPictureBtn.style.display = "none";
          addPictureTxt.style.display = "none";
          previewImage.style.margin = "0";
          addPictureBackground.style.padding = "0";
          btnValidate.style.backgroundColor = "#1D6154";
        };
        reader.readAsDataURL(file);
      }
    });

    // Configure l'événement pour la soumission du formulaire
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Empêche la soumission par défaut du formulaire

      if (validateForm()) {
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", titleInput.value);
        formData.append("category", categoryInput.value);

        const token = localStorage.getItem("token");
        if (!token) {
          alert("Vous devez être connecté pour ajouter un projet.");
          return;
        }

        try {
          const response = await fetch(`${url}/works`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            form.reset(); // Réinitialise le formulaire
            previewImage.src = "./assets/icons/picture-svgrepo-com.svg"; // Réinitialise l'image de prévisualisation
            closeModal(); // Ferme la modale
            fetchWorks(); // Met à jour la galerie avec le nouveau projet
          } else if (response.status === 400) {
            errorMessage.textContent =
              "Les données envoyées sont incorrectes. Veuillez vérifier les champs.";
          } else if (response.status === 401) {
            alert("Non autorisé. Veuillez vous connecter.");
          } else if (response.status === 500) {
            alert("Erreur interne. Veuillez réessayer plus tard.");
          } else {
            alert("Erreur lors de l'envoi des données.");
          }
        } catch (error) {
          console.error("Erreur réseau:", error);
          alert("Erreur de réseau. Veuillez réessayer plus tard.");
        }
      } else {
        errorMessage.textContent =
          "Veuillez remplir tous les champs correctement.";
      }
    });

    // Configure les événements pour fermer les modales
    closeBtn.addEventListener("click", () => closeModal());
    closeBtn2.addEventListener("click", () => closeModal());

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(); // Ferme la modale si l'utilisateur clique à l'extérieur
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal(); //ferme les modales avec la touche Échap
      }
    });
  }

    //fonction pour créer la modale
  function createModalsSection() {
    const modalsHtml = `
      <section id="modals" class="modals" aria-modal="true" role="dialog" style="display: none;">
        <div class="modalContent1" style="display: none;">
          <span class="closeBtn">
            <img src="./assets/icons/Vector.svg" alt="bouton fermer"/>
          </span>
          <h3 class="titleModal">Galerie photo</h3>
          <div id="modalGallery"></div>
          <div class="greyBar1"></div>
          <button class="addProject">Ajouter une photo</button>
        </div>

        <div class="modalContent2" style="display: none;">
          <div class="modalHeader2">
            <div class="backArrow">
              <img src="./assets/icons/arrow-left.svg" alt="flèche de retour"/>
            </div>
            <span class="closeBtn2">
              <img src="./assets/icons/Vector.svg" alt="bouton fermer"/>
            </span>
          </div>
          <h3 class="titleModal2">Ajout photo</h3>
          <form id="addNewProject" action="http://localhost:5678/api/users/works" method="post" enctype="multipart/form-data">
            <div id="addPictureBackground" class="addPictureBackground">
              <img id="previewImage" src="./assets/icons/picture-svgrepo-com.svg" alt="exemple de photo"/>
              <label>
                <span id="addPicture" class="addPicture">+ Ajouter photo</span>
                <input type="file" id="image" name="image" accept="image/jpeg, image/png" hidden/>
              </label>
              <p id="addPictureTxt" class="addPictureTxt">jpg, png : 4mo max</p>
            </div>
            <label class="addNewProjectLabel" for="title">Titre</label>
            <input type="text" name="title" id="title" required/>
            <label class="addNewProjectLabel" for="category">Catégorie</label>
            <select name="category" id="category"></select>
            <div class="greyBar2"></div>
            <div id="error-message" class="error-message hidden"></div>
            <div class="btnValidate">
              <input id="btnValidate" type="submit" value="Valider"/>
            </div>
          </form>
        </div>
      </section>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHtml);
  }

  // Fonction pour afficher une modale spécifique
  function showModal(modalType) {
    if (modalType === "modal1") {
      modal1Content.style.display = "flex";
      modal2Content.style.display = "none";
      fetchWorks(); // Charge les projets pour la modale 1
    } else if (modalType === "modal2") {
      modal1Content.style.display = "none";
      modal2Content.style.display = "flex";
    }
    modal.style.display = "flex"; // Affiche la modale
  }

  // Fonction pour fermer la modale
  function closeModal() {
    modal.style.display = "none"; // Cache la modale
    modal1Content.style.display = "none";
    modal2Content.style.display = "none";
  }

    // Fonction pour supprimer un projet
  async function deleteProject(work, figureElement) {
    const token = localStorage.getItem("token"); // Récupère le token d'authentification
    if (!token) {
      alert("Vous devez être connecté pour supprimer un projet.");
      return;
    }

    try {
      const response = await fetch(`${url}/works/${work.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        figureElement.remove(); // Supprime l'élément de la galerie
      } else {
        // Gére les erreurs en fonction du code de statut HTTP
        if (response.status === 401) {
          alert(
            "Vous n'êtes pas autorisé à supprimer ce projet. Assurez-vous que vous êtes connecté."
          );
        } else {
          console.error(
            "Erreur lors de la suppression du projet:",
            response.statusText
          );
          alert("Erreur lors de la suppression du projet.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      alert("Erreur lors de la suppression du projet.");
    }
  }

  // Fonction pour valider le formulaire avant envoi
  function validateForm() {
    const file = fileInput.files[0];
    const title = titleInput.value;
    const category = categoryInput.value;

    // Vérifie que tous les champs requis sont remplis
    if (title.trim() !== "" && category.trim() !== "" && file) {
      return true;
    } else {
      errorMessage.classList.remove("hidden"); // Affiche les messages d'erreur
      if (title.trim() === "") {
        errorMessage.textContent = "Le titre est requis.";
      } else if (category.trim() === "") {
        errorMessage.textContent = "La catégorie est requise.";
      } else if (!file) {
        errorMessage.textContent = "Une image est requise.";
      }
      return false;
    }
  }

  // Fonction pour mettre à jour les liens de connexion et d'édition
  function updateLinks() {
    if (localStorage.getItem("token")) {
      loginLink.textContent = "logout"; // Affiche 'logout' si connecté
      loginLink.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("token"); // Déconnexion de l'utilisateur
        window.location.href = "index.html"; // Redirection vers la page d'accueil
      });

      editLink.style.display = "inline"; // Affiche le lien d'édition
      editBar.style.display = "flex"; // Affiche la barre d'édition
      btnFilter.style.display = "none"; // Cache les filtres si connecté
    } else {
      loginLink.textContent = "login"; // Affiche 'login' si non connecté
      editLink.style.display = "none"; // Cache le lien d'édition
      editBar.style.display = "none"; // Cache la barre d'édition
    }
  }
});
