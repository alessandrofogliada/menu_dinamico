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

  langSelector.addEventListener('change', (e) => {
    loadLanguage(e.target.value);
  });

  const menuUrl = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgYI-d9NpG0e3C4qBMV6i3WQSA1c9oSZ_DleGHXXI9p8ro6czr5xeU6RnTfsZ7cNu1BTfVG8cUTC0IAEzEBiw371vIw7qnwXHgs-d3pbwMOLYlILH334DhPYeiAxY6aYIlb0Uh6sfRYrSI_9VqmHZWcapPa0o2bd6jhoPGRuFMQAUtY--UEeiVGPqOiToj1yQrGNmxW3c2xaBg6IxmQL-QbCyd3gnLYYrS5QDO0T2v9C8nrxjtoJ0D2bAtbWh7Vuhpo7_mNfgZDUtQ14HQ9-MgU3wBCMA&lib=MPqJJs0z37qA-qGw-bJBepz3FZZAEnAtP";

  let menuData = {};
  let currentLang = localStorage.getItem("lang") || "it";
  let langData = {};

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
    document.getElementById("btnAntipasti").textContent = langData.antipasti;
    document.getElementById("btnPrimi").textContent = langData.primi;
    document.getElementById("btnSecondi").textContent = langData.secondi;
    document.getElementById("btnDolci").textContent = langData.dolci;
    document.getElementById("btnResetFiltri").textContent = langData.reset;

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
      menuContainer.innerHTML = `<p style="color:red;">Nessun piatto trovato per ${sezione}</p>`;
      hideLoader();
      return;
    }

    menuContainer.innerHTML = `<h2 class="text-center my-4">${sezione}</h2>`;
    document.getElementById("filtri-container").style.display = "flex";

    piatti.forEach(item => {
      const menuItem = document.createElement("div");
      menuItem.classList.add("menu-item", "mb-4", "p-3", "rounded", "carta");

      const categoria = item["Categoria"]?.toLowerCase();
      if (categoria === "vegano") menuItem.classList.add("vegano");
      else if (categoria === "vegetariano") menuItem.classList.add("vegetariano");

      menuItem.innerHTML = `
        <h4>${item["Nome piatto"] || "Senza nome"}</h4>
        ${
          item["Immagine"]
            ? `<div class="image-wrapper">
                 <div class="img-loader"></div>
                 <img src="img/${item["Immagine"]}" alt="${item["Nome piatto"]}" class="img-fluid my-2 menu-img" style="max-width: 300px;">
               </div>`
            : ""
        }
        <p><strong>Ingredienti:</strong> ${item["Ingredienti"] || "-"}</p>
        <p><strong>Prezzo:</strong> ${item["Prezzo"] + '€' || "-"}</p>
        ${
          item["Categoria"]?.toLowerCase() === "vegano"
            ? `<span class="badge bg-success">${langData.vegano}</span>`
            : item["Categoria"]?.toLowerCase() === "vegetariano"
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

  btnAntipasti.addEventListener("click", () => fetchMenuData("Antipasti"));
  btnPrimi.addEventListener("click", () => fetchMenuData("Primi"));
  btnSecondi.addEventListener("click", () => fetchMenuData("Secondi"));
  btnDolci.addEventListener("click", () => fetchMenuData("Dolci"));

  btnResetFiltri.addEventListener('click', () => {
    document.getElementById('chkVegetariano').checked = false;
    document.getElementById('chkVegano').checked = false;
    applyFilters();
  });

  loadLanguage(currentLang);
});