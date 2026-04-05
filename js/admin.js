// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAdf2ae0d3a778c97b3002d",
  authDomain: "panel-turnos.firebaseapp.com",
  projectId: "panel-turnos",
  storageBucket: "panel-turnos.firebasestorage.app",
  messagingSenderId: "592642048600",
  appId: "1:592642048600:web:adf2ae0d3a778c97b3002d"
};

// Firebase Services
let auth, db, storage;
let currentUser = null;
let selectedImages = [];
let currentEditId = null;
let currentViewId = null;

// Initialize Firebase
function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Auth State
function onAuthStateChange(user) {
  console.log('Auth state changed:', user);
  currentUser = user;
  if (user && user.email === 'nahuel.lavena@gmail.com') {
    console.log('User authenticated, showing dashboard');
    showDashboard();
    loadProducts();
  } else {
    console.log('No user or different email, showing login');
    if (user) {
      console.log('User email:', user.email);
    }
    showLogin();
  }
}

// Login
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  
  auth.onAuthStateChanged(onAuthStateChange);
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPass').value;
      const errorEl = document.getElementById('loginError');
      
      try {
        errorEl.textContent = '';
        const userCredential = await auth.signInWithEmailAndPassword(email, pass);
        currentUser = userCredential.user;
      } catch (error) {
        console.error('Login error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
          errorEl.textContent = 'Email no válido';
        } else if (error.code === 'auth/wrong-password') {
          errorEl.textContent = 'Contraseña incorrecta';
        } else if (error.code === 'auth/invalid-credential') {
          errorEl.textContent = 'Credenciales incorrectas';
        } else if (error.code === 'auth/user-disabled') {
          errorEl.textContent = 'Usuario deshabilitado';
        } else if (error.code === 'auth/network-request-failed') {
          errorEl.textContent = 'Error de red. Verificá tu conexión.';
        } else {
          errorEl.textContent = 'Error: ' + error.message;
        }
      }
    });
  }
});

function showLogin() {
  document.getElementById('loginView').style.display = 'flex';
  document.getElementById('dashboardView').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('dashboardView').style.display = 'block';
}

async function logout() {
  try {
    await auth.signOut();
    currentUser = null;
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Products CRUD
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const filter = document.getElementById('filterCategory').value;
  
  grid.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Cargando productos...</div>';
  
  try {
    let query = db.collection('productos');
    
    const snapshot = await query.get();
    let products = [];
    
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    if (filter !== 'todos') {
      products = products.filter(p => p.categoria === filter);
    }
    
    if (products.length === 0) {
      grid.innerHTML = '<div class="empty-state"><h3>No hay productos</h3><p>Agregá tu primer producto</p></div>';
      return;
    }
    
    grid.innerHTML = products.map(p => `
      <div class="product-card" onclick="viewProduct('${p.id}')">
        <img class="product-card-img" src="${p.imagenes?.[0] || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%232a2a2a%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2214%22>Sin imagen</text></svg>'}" alt="${p.nombre}">
        <div class="product-card-body">
          <div class="product-card-name">${p.nombre}</div>
          <div class="product-card-cat">${getCategoryLabel(p.categoria)}</div>
          <span class="product-card-status ${p.disponible ? 'disponible' : 'no-disponible'}">${p.disponible ? 'Disponible' : 'No disponible'}</span>
          <div class="product-card-actions" onclick="event.stopPropagation()">
            <button class="btn btn-ghost" onclick="editProduct('${p.id}')">Editar</button>
            <button class="btn btn-ghost" onclick="deleteProduct('${p.id}')">Eliminar</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = '<div class="empty-state"><h3>Error</h3><p>No se pudieron cargar los productos</p></div>';
  }
}

function getCategoryLabel(cat) {
  const labels = {
    'remera-oversize': 'Remera Oversize',
    'remera-clasico': 'Remera Clásico',
    'buzo': 'Buzo',
    'pantalon': 'Pantalón'
  };
  return labels[cat] || cat;
}

// Modal Functions
function openAddModal() {
  currentEditId = null;
  selectedImages = [];
  document.getElementById('modalTitle').textContent = 'Agregar Producto';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('imagePreviews').innerHTML = '';
  document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  selectedImages = [];
  currentEditId = null;
}

function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
  currentViewId = null;
}

function closeConfirmModal() {
  document.getElementById('confirmModal').style.display = 'none';
}

// Image Handling
function handleImageSelect(event) {
  const files = event.target.files;
  const maxImages = 4 - selectedImages.length;
  
  for (let i = 0; i < Math.min(files.length, maxImages); i++) {
    selectedImages.push(files[i]);
  }
  
  renderImagePreviews();
  event.target.value = '';
}

function renderImagePreviews() {
  const container = document.getElementById('imagePreviews');
  
  container.innerHTML = selectedImages.map((file, idx) => `
    <div class="image-preview">
      <img src="${URL.createObjectURL(file)}" alt="Preview ${idx + 1}">
      <button type="button" class="remove-img" onclick="removeImage(${idx})">×</button>
    </div>
  `).join('');
}

function removeImage(idx) {
  selectedImages.splice(idx, 1);
  renderImagePreviews();
}

// Save Product
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nombre = document.getElementById('productName').value.trim();
  const categoria = document.getElementById('productCategory').value;
  const descripcion = document.getElementById('productDesc').value.trim();
  const precio = document.getElementById('productPrice').value.trim();
  const talles = document.getElementById('productTalles').value.trim();
  const disponible = document.getElementById('productAvailable').checked;
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Guardando...';
  submitBtn.disabled = true;
  
  try {
    let imagenesUrls = [];
    
    if (currentEditId) {
      const doc = await db.collection('productos').doc(currentEditId).get();
      imagenesUrls = doc.data().imagenes || [];
    }
    
    if (selectedImages.length > 0) {
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const filename = `${Date.now()}_${i}_${file.name}`;
        const ref = storage.ref(`productos/${filename}`);
        const snapshot = await ref.put(file);
        const url = await snapshot.ref.getDownloadURL();
        imagenesUrls.push(url);
      }
    }
    
    const productData = {
      nombre,
      categoria,
      descripcion,
      precio,
      talles,
      disponible,
      imagenes: imagenesUrls,
      updatedAt: new Date()
    };
    
    if (currentEditId) {
      await db.collection('productos').doc(currentEditId).update(productData);
    } else {
      productData.createdAt = new Date();
      await db.collection('productos').add(productData);
    }
    
    closeProductModal();
    loadProducts();
    
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error al guardar el producto');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// View Product
async function viewProduct(id) {
  currentViewId = id;
  
  try {
    const doc = await db.collection('productos').doc(id).get();
    const p = doc.data();
    
    const imgContainer = document.getElementById('viewModalImg');
    if (p.imagenes && p.imagenes.length > 0) {
      imgContainer.innerHTML = p.imagenes.map(url => `<img src="${url}" alt="${p.nombre}">`).join('');
    } else {
      imgContainer.innerHTML = '<div class="placeholder-img"><span class="icon">👕</span></div>';
    }
    
    document.getElementById('viewModalCat').textContent = getCategoryLabel(p.categoria);
    document.getElementById('viewModalName').textContent = p.nombre;
    document.getElementById('viewModalDesc').textContent = p.descripcion || 'Sin descripción';
    document.getElementById('viewModalPrice').textContent = p.precio || '';
    document.getElementById('viewModalTalles').textContent = p.talles ? `Talles: ${p.talles}` : '';
    
    document.getElementById('viewModal').style.display = 'flex';
  } catch (error) {
    console.error('Error viewing product:', error);
  }
}

function editFromView() {
  closeViewModal();
  if (currentViewId) editProduct(currentViewId);
}

function deleteFromView() {
  closeViewModal();
  if (currentViewId) deleteProduct(currentViewId);
}

// Edit Product
async function editProduct(id) {
  currentEditId = id;
  selectedImages = [];
  
  try {
    const doc = await db.collection('productos').doc(id).get();
    const p = doc.data();
    
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = p.nombre || '';
    document.getElementById('productCategory').value = p.categoria || 'remera-oversize';
    document.getElementById('productDesc').value = p.descripcion || '';
    document.getElementById('productPrice').value = p.precio || '';
    document.getElementById('productTalles').value = p.talles || '';
    document.getElementById('productAvailable').checked = p.disponible !== false;
    
    const previewsContainer = document.getElementById('imagePreviews');
    if (p.imagenes && p.imagenes.length > 0) {
      previewsContainer.innerHTML = p.imagenes.map((url, idx) => `
        <div class="image-preview">
          <img src="${url}" alt="Imagen ${idx + 1}">
          <button type="button" class="remove-img" onclick="removeExistingImage('${id}', ${idx})">×</button>
        </div>
      `).join('');
    } else {
      previewsContainer.innerHTML = '';
    }
    
    document.getElementById('productModal').style.display = 'flex';
  } catch (error) {
    console.error('Error editing product:', error);
  }
}

async function removeExistingImage(docId, imgIdx) {
  try {
    const doc = await db.collection('productos').doc(docId).get();
    const imagenes = doc.data().imagenes || [];
    imagenes.splice(imgIdx, 1);
    await db.collection('productos').doc(docId).update({ imagenes });
    editProduct(docId);
  } catch (error) {
    console.error('Error removing image:', error);
  }
}

// Delete Product
let deleteId = null;

function deleteProduct(id) {
  deleteId = id;
  document.getElementById('confirmModal').style.display = 'flex';
}

async function confirmDelete() {
  if (!deleteId) return;
  
  try {
    const doc = await db.collection('productos').doc(deleteId).get();
    const p = doc.data();
    
    if (p.imagenes) {
      for (const url of p.imagenes) {
        try {
          const ref = storage.refFromURL(url);
          await ref.delete();
        } catch (e) {
          console.log('Image already deleted');
        }
      }
    }
    
    await db.collection('productos').doc(deleteId).delete();
    
    closeConfirmModal();
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error al eliminar el producto');
  }
  
  deleteId = null;
}
