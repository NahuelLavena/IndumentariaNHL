const storeConfig = {
  apiKey: "AIzaSyAdf2ae0d3a778c97b3002d",
  authDomain: "panel-turnos.firebaseapp.com",
  projectId: "panel-turnos",
  storageBucket: "panel-turnos.firebasestorage.app",
  messagingSenderId: "592642048600",
  appId: "1:592642048600:web:adf2ae0d3a778c97b3002d"
};

let storeDb;
let loadedProducts = [];

async function initStore() {
  try {
    firebase.initializeApp(storeConfig);
    storeDb = firebase.firestore();
    await loadStoreProducts();
  } catch (error) {
    console.log('Store init error:', error);
  }
}

async function loadStoreProducts() {
  try {
    const snapshot = await storeDb.collection('productos').get();
    
    loadedProducts = [];
    snapshot.forEach(doc => {
      loadedProducts.push({ id: doc.id, ...doc.data() });
    });
    
    renderStoreProducts();
  } catch (error) {
    console.log('No products loaded or Firestore not available:', error);
  }
}

function renderStoreProducts() {
  const categories = {
    'remera-oversize': document.getElementById('remeras'),
    'remera-clasico': document.getElementById('remeras-clasico'),
    'buzo': document.getElementById('buzos'),
    'pantalon': document.getElementById('pantalones')
  };
  
  const categoryCounts = {
    'remera-oversize': 0,
    'remera-clasico': 0,
    'buzo': 0,
    'pantalon': 0
  };
  
  Object.keys(categories).forEach(cat => {
    const section = categories[cat];
    if (!section) return;
    
    const grid = section.querySelector('.grid');
    if (!grid) return;
    
    const products = loadedProducts.filter(p => p.categoria === cat);
    categoryCounts[cat] = products.length;
    
    if (products.length > 0) {
      grid.innerHTML = products.map(p => createProductCard(p)).join('');
    }
  });
  
  updateCategoryCounts(categoryCounts);
}

function createProductCard(p) {
  const imgUrl = p.imagenes && p.imagenes[0] 
    ? p.imagenes[0] 
    : '';
  
  const imgHtml = imgUrl 
    ? `<img class="card-media" src="${imgUrl}" alt="${p.nombre}">`
    : `<div class="placeholder-img"><span class="icon">👕</span><span>Producto</span></div>`;
  
  const statusClass = p.disponible ? '' : 'card--disabled';
  const statusAria = p.disponible ? '' : 'aria-disabled="true"';
  const detailText = p.talles ? `· ${p.talles} ·` : '· CONSULTAR TALLES ·';
  
  return `
    <div class="card ${statusClass}" ${statusAria}>
      <input type="checkbox" class="card-checkbox" data-name="${p.nombre}" data-img="${imgUrl}" onchange="updateCart()">
      <div class="card-hit" role="button" tabindex="0" onkeydown="handleCardKey(event)" onclick="openModal('${p.nombre}','${getCategoryLabel(p.categoria)}','${escapeHtml(p.descripcion)}','${imgUrl}','👕')">
        ${imgHtml}
        <div class="card-body">
          <div class="card-name">${p.nombre}</div>
          <div class="card-detail">${detailText}</div>
        </div>
        <div class="card-overlay"><button class="card-overlay-btn" type="button">Ver prenda</button></div>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, ' ');
}

function getCategoryLabel(cat) {
  const labels = {
    'remera-oversize': 'Remeras Oversize',
    'remera-clasico': 'Remeras Clásico',
    'buzo': 'Buzos',
    'pantalon': 'Pantalones'
  };
  return labels[cat] || cat;
}

function updateCategoryCounts(counts) {
  const sections = {
    'remera-oversize': document.querySelector('#remeras .section-count'),
    'remera-clasico': document.querySelector('#remeras-clasico .section-count'),
    'buzo': document.querySelector('#buzos .section-count'),
    'pantalon': document.querySelector('#pantalones .section-count')
  };
  
  Object.keys(sections).forEach(cat => {
    const countEl = sections[cat];
    if (countEl) {
      const count = counts[cat] || 0;
      const unit = count === 1 ? 'prenda' : 'prendas';
      countEl.textContent = `0${count} ${unit}`;
    }
  });
}

document.addEventListener('DOMContentLoaded', initStore);
