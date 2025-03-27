document.addEventListener("DOMContentLoaded", function () {
  const btnAntipasti = document.getElementById("btnAntipasti");
  const btnPrimi = document.getElementById("btnPrimi");
  const btnSecondi = document.getElementById("btnSecondi");
  const btnDolci = document.getElementById("btnDolci");
  const menuContainer = document.getElementById("menu");
  const loaderWrapper = document.getElementById("loader-wrapper");
  const btnResetFiltri = document.getElementById('btnResetFiltri');

 


  document.getElementById('chkVegetariano').addEventListener('change', applyFilters);
  document.getElementById('chkVegano').addEventListener('change', applyFilters);


  // URL della tua Google Apps Script Web App
  const menuUrl = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgYI-d9NpG0e3C4qBMV6i3WQSA1c9oSZ_DleGHXXI9p8ro6czr5xeU6RnTfsZ7cNu1BTfVG8cUTC0IAEzEBiw371vIw7qnwXHgs-d3pbwMOLYlILH334DhPYeiAxY6aYIlb0Uh6sfRYrSI_9VqmHZWcapPa0o2bd6jhoPGRuFMQAUtY--UEeiVGPqOiToj1yQrGNmxW3c2xaBg6IxmQL-QbCyd3gnLYYrS5QDO0T2v9C8nrxjtoJ0D2bAtbWh7Vuhpo7_mNfgZDUtQ14HQ9-MgU3wBCMA&lib=MPqJJs0z37qA-qGw-bJBepz3FZZAEnAtP";

  let menuData = {};

  function showLoader() {
    loaderWrapper.style.display = "block";
    menuContainer.style.display = "none";
  }

  function hideLoader() {
    loaderWrapper.style.display = "none";
    menuContainer.style.display = "block";
  }

  function applyFilters() {
    const chkVegetariano = document.getElementById('chkVegetariano');
    const chkVegano = document.getElementById('chkVegano');
    const msgBox = document.getElementById('filtro-messaggio');
  
    const showVegetariano = chkVegetariano.checked;
    const showVegano = chkVegano.checked;
  
    const dishes = document.querySelectorAll('.menu-item');
    let visibleCount = 0;
  
    dishes.forEach(dish => {
      const isVegetariano = dish.classList.contains('vegetariano');
      const isVegano = dish.classList.contains('vegano');
  
      let show = false;
  
      if (!showVegetariano && !showVegano) {
        show = true; // Nessun filtro → mostra tutto
      } else {
        // Mostra solo se corrisponde almeno a uno dei filtri attivi
        if (showVegetariano && isVegetariano) show = true;
        if (showVegano && isVegano) show = true;
      }
  
      if (show) {
        dish.classList.remove('hidden');
        visibleCount++;
      } else {
        dish.classList.add('hidden');
      }
    });
  
    if (visibleCount === 0) {
      msgBox.textContent = "Nessun piatto disponibile per i filtri selezionati. Seleziona prima la categoria";
    } else {
      msgBox.textContent = "";
    }
  }
    
  
  function renderMenu(sezione) {
    const piatti = menuData[sezione];

    if (!piatti) {
      menuContainer.innerHTML = `<p style="color:red;">Nessun piatto trovato per ${sezione}</p>`;
      hideLoader();
      return;
    }

    menuContainer.innerHTML = `<h2 class="text-center my-4">${sezione}</h2>`;

    piatti.forEach(item => {
      const menuItem = document.createElement("div");
      menuItem.classList.add("menu-item", "mb-4", "p-3", "rounded", "carta");

      // Aggiunge classe in base alla categoria
      const categoria = item["Categoria"]?.toLowerCase();
      if (categoria === "vegano") {
        menuItem.classList.add("vegano");
      } else if (categoria === "vegetariano") {
        menuItem.classList.add("vegetariano");
      }

      menuItem.innerHTML = `
      
          <h4>${item["Nome piatto"] || "Senza nome"}</h4>
          ${
            item["Immagine"]
              ? `
              <div class="image-wrapper">
                <div class="img-loader"></div>
                <img src="${item["Immagine"]}" alt="${item["Nome piatto"]}" class="img-fluid my-2 menu-img" style="max-width: 300px;">
              </div>`
              : ""
          }        
          <p><strong>Ingredienti:</strong> ${item["Ingredienti"] || "-"}</p>
          <p><strong>Prezzo:</strong> ${item["Prezzo"] || "-"}</p>

          ${
            item["Categoria"] === "Vegano"
              ? `<span class="badge bg-success">Vegano</span>`
              : item["Categoria"] === "Vegetariano"
              ? `<span class="badge bg-warning text-dark">Vegetariano</span>`
              : ""
          }
          `;

      menuContainer.appendChild(menuItem);

      // Gestione caricamento immagine
      const img = menuItem.querySelector("img");
      if (img) {
        img.addEventListener("load", () => {
          img.classList.add("loaded");
          const loader = menuItem.querySelector(".img-loader");
          if (loader) loader.remove();
        });
      }
    });

    // Reset checkbox
// document.getElementById('chkVegetariano').checked = false;
// document.getElementById('chkVegano').checked = false;

// Applica filtro (nessuno attivo = mostra tutto)

    applyFilters();


    hideLoader();
  }

  function fetchMenuData(sezione) {
    showLoader();
    if (Object.keys(menuData).length === 0) {
      fetch(menuUrl)
        .then(res => res.json())
        .then(data => {
          menuData = data;
          renderMenu(sezione);
        })
        .catch(err => {
          console.error("Errore nel caricamento:", err);
          menuContainer.innerHTML = "<p style='color:red;'>Errore nel caricamento del menu.</p>";
          hideLoader();
        });
    } else {
      renderMenu(sezione); // se già in cache
    }
  }

  // Eventi dei bottoni
  btnAntipasti.addEventListener("click", () => fetchMenuData("Antipasti"));
  btnPrimi.addEventListener("click", () => fetchMenuData("Primi"));
  btnSecondi.addEventListener("click", () => fetchMenuData("Secondi"));
  btnDolci.addEventListener("click", () => fetchMenuData("Dolci")); btnResetFiltri.addEventListener('click', () => {
    document.getElementById('chkVegetariano').checked = false;
    document.getElementById('chkVegano').checked = false;
    applyFilters();
  });
});

// 🔍 Funzione di filtro accessibile globalmente
function filterByCategory(category) {
  const dishes = document.querySelectorAll('.menu-item');

  dishes.forEach(dish => {
    if (category === 'all') {
      dish.classList.remove('hidden');
    } else if (dish.classList.contains(category)) {
      dish.classList.remove('hidden');
    } else {
      dish.classList.add('hidden');
    }
  });
}

