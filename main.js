document.addEventListener("DOMContentLoaded", function () {
  const btnAntipasti = document.getElementById("btnAntipasti");
  const btnPrimi = document.getElementById("btnPrimi");
  const btnSecondi = document.getElementById("btnSecondi");
  const btnDolci = document.getElementById("btnDolci");
  const menuContainer = document.getElementById("menu");
  const loaderWrapper = document.getElementById("loader-wrapper");
  const btnResetFiltri = document.getElementById('btnResetFiltri');
  const langSelector = document.getElementById('langSelector');

  document.getElementById('chkVegetariano').addEventListener('change', applyFilters);
  document.getElementById('chkVegano').addEventListener('change', applyFilters);

 
  langSelector.addEventListener('click', (e) => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.lang) {
      const newLang = e.target.dataset.lang;
      loadLanguage(newLang);
      if (typeof ultimaSezione !== 'undefined') {
        renderMenu(ultimaSezione);
      }
    }
  });
  
  

  const menuUrl = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgYI-d9NpG0e3C4qBMV6i3WQSA1c9oSZ_DleGHXXI9p8ro6czr5xeU6RnTfsZ7cNu1BTfVG8cUTC0IAEzEBiw371vIw7qnwXHgs-d3pbwMOLYlILH334DhPYeiAxY6aYIlb0Uh6sfRYrSI_9VqmHZWcapPa0o2bd6jhoPGRuFMQAUtY--UEeiVGPqOiToj1yQrGNmxW3c2xaBg6IxmQL-QbCyd3gnLYYrS5QDO0T2v9C8nrxjtoJ0D2bAtbWh7Vuhpo7_mNfgZDUtQ14HQ9-MgU3wBCMA&lib=MPqJJs0z37qA-qGw-bJBepz3FZZAEnAtP";

  let menuData = {};
  let currentLang = localStorage.getItem("lang") || "it";
  let langData = {};
  let ultimaSezione = null;

  const sezioniTradotte = {
    it: {
      Antipasti: "Antipasti",
      Primi: "Primi",
      Secondi: "Secondi",
      Dolci: "Dolci"
    },
    en: {
      Antipasti: "Starters",
      Primi: "First Courses",
      Secondi: "Main Courses",
      Dolci: "Desserts"
    }
  };
  

  function loadLanguage(lang) {
    fetch('lang.json')
      .then(res => res.json())
      .then(data => {
        langData = data[lang];
        currentLang = lang;
        localStorage.setItem("lang", lang);
        langSelector.value = lang;
        translateUI();
      });
  }

  
  function translateUI() {
    console.log("LANG DATA:", langData);
  
    document.getElementById("btnAntipasti").querySelector(".bottone-testo").textContent = langData.antipasti;
    document.getElementById("btnPrimi").querySelector(".bottone-testo").textContent = langData.primi;
    document.getElementById("btnSecondi").querySelector(".bottone-testo").textContent = langData.secondi;
    document.getElementById("btnDolci").querySelector(".bottone-testo").textContent = langData.dolci;
    document.getElementById("btnResetFiltri").textContent = langData.reset;
    document.getElementById("benvenuto").textContent = langData.scopriMenu;
  
    const labels = document.querySelectorAll("#filtri-container label");
    if (labels.length >= 2) {
      labels[0].childNodes[1].textContent = " " + langData.vegetariano;
      labels[1].childNodes[1].textContent = " " + langData.vegano;
    }
  }
  

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
        show = true;
      } else {
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

    msgBox.textContent = visibleCount === 0 ? langData.nessunPiatto : "";
  }

  function renderMenu(sezione) {
    const piatti = menuData[sezione];

    if (!piatti) {
      menuContainer.innerHTML = `<p style="color:red; ">Nessun piatto trovato per ${sezione}</p>`;
      hideLoader();
      return;
    }

    const titoloSezione = sezioniTradotte[currentLang]?.[sezione] || sezione;
    menuContainer.innerHTML = `<h2 class="text-center my-4">${titoloSezione}</h2>`;

    document.getElementById("filtri-container").style.display = "flex";

    console.log("PIATTI:", piatti);


    piatti.forEach(item => {
      const menuItem = document.createElement("div");
      menuItem.classList.add("menu-item", "mb-4", "p-3", "rounded", "carta");

      const categoria = item["Categoria"]?.toLowerCase();
      if (categoria === "vegano") menuItem.classList.add("vegano");
      else if (categoria === "vegetariano") menuItem.classList.add("vegetariano");

      const nome = item[`Nome piatto (${currentLang})`] || item["Nome piatto"] || item["Nome piatto (it)"] || "Senza nome";
      const ingredienti = item[`Ingredienti (${currentLang})`] || item["Ingredienti"] || item["Ingredienti (it)"] || "-";
      const prezzo = item["Prezzo"] || "-";
      menuItem.innerHTML = `
        <h4>${nome}</h4>
      ${
        item["Immagine"]
          ? `<div class="image-wrapper">
              <div class="img-loader"></div>
              <img src="img/${item["Immagine"]}" alt="${nome}" class="img-fluid my-2 menu-img" style="max-width: 300px;">
            </div>`
          : ""
      }
      <p><strong>${langData.ingredienti}:</strong> ${ingredienti}</p>  
      <p><strong>${langData.prezzo}:</strong> ${prezzo}€</p>

      ${
        categoria === "vegano"
          ? `<span class="badge bg-success">${langData.vegano}</span>`
          : categoria === "vegetariano"
          ? `<span class="badge bg-warning text-dark">${langData.vegetariano}</span>`
          : ""
      }
    `;


      menuContainer.appendChild(menuItem);

      const img = menuItem.querySelector("img");
      if (img) {
        img.addEventListener("load", () => {
          img.classList.add("loaded");
          const loader = menuItem.querySelector(".img-loader");
          if (loader) loader.remove();
        });
      }
    });

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
      renderMenu(sezione);
    }
  }

  btnAntipasti.addEventListener("click", () => {
    ultimaSezione = "Antipasti";
    fetchMenuData("Antipasti");
  });

  btnPrimi.addEventListener("click", () => {
    ultimaSezione = "Primi";
    fetchMenuData("Primi");
  });

  btnSecondi.addEventListener("click", () => {
    ultimaSezione = "Secondi";
    fetchMenuData("Secondi");
  });

  btnDolci.addEventListener("click", () => {
    ultimaSezione = "Dolci";
    fetchMenuData("Dolci");
  });
  
  // btnPrimi.addEventListener("click", () => fetchMenuData("Primi"));
  // btnSecondi.addEventListener("click", () => fetchMenuData("Secondi"));
  // btnDolci.addEventListener("click", () => fetchMenuData("Dolci"));

  btnResetFiltri.addEventListener('click', () => {
    document.getElementById('chkVegetariano').checked = false;
    document.getElementById('chkVegano').checked = false;
    applyFilters();
  });

  loadLanguage(currentLang);
});