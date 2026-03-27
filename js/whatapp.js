
  // ⚙️ CAMBIÁ ESTE NÚMERO por el tuyo (formato: código país + número, sin + ni espacios)
  const WP_NUMBER = "5491126621868";

  // Sistema de carrito
  let cart = [];

  function updateCart() {
    const checkboxes = document.querySelectorAll('.card-checkbox:checked');
    cart = Array.from(checkboxes).map(cb => cb.dataset.name);
    
    const cartCount = document.getElementById('cartCount');
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    
    updateCartPanel();
  }

  function updateCartPanel() {
    const cartItems = document.getElementById('cartItems');
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">No hay prendas seleccionadas</p>';
    } else {
      cartItems.innerHTML = cart.map((item, idx) => 
        `<div class="cart-item">
          <span>${item}</span>
          <button onclick="removeFromCart(${idx})" class="remove-item">×</button>
        </div>`
      ).join('');
    }
  }

  function removeFromCart(index) {
    const checkboxes = document.querySelectorAll('.card-checkbox');
    checkboxes.forEach(cb => {
      if (cb.dataset.name === cart[index]) {
        cb.checked = false;
      }
    });
    updateCart();
  }

  function toggleCart() {
    const cartPanel = document.getElementById('cartPanel');
    cartPanel.style.display = cartPanel.style.display === 'none' ? 'block' : 'none';
  }

  function consultarCarrito() {
    if (cart.length === 0) {
      alert('Selecciona al menos una prenda');
      return;
    }
    
    const prendas = cart.join(', ');
    const msg = encodeURIComponent(`Hola! Quiero consultar disponibilidad de estas prendas: ${prendas}`);
    window.open(`https://wa.me/${WP_NUMBER}?text=${msg}`, '_blank');
  }

  function openModal(name, cat, desc, imgUrl, emoji) {
    document.getElementById('modalCat').textContent = cat;
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDesc').textContent = desc;

    const imgContainer = document.getElementById('modalImg');
    if (imgUrl) {
      imgContainer.innerHTML = `<img src="${imgUrl}" alt="${name}">`;
    } else {
      imgContainer.innerHTML = `<div class="placeholder-img"><span class="icon">${emoji}</span></div>`;
    }

    const msg = encodeURIComponent(`Hola! Vi la prenda "${name}" en la web y quería consultar si está disponible. ¿Me podés dar más info?`);
    document.getElementById('wspLink').href = `https://wa.me/${WP_NUMBER}?text=${msg}`;

    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleBackdropClick(e) {
    if (e.target === document.getElementById('modal')) closeModal();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Hamburger
  function toggleMenu() {
    const h = document.getElementById('hamburger');
    const m = document.getElementById('mobileMenu');
    h.classList.toggle('open');
    m.classList.toggle('open');
    document.body.style.overflow = m.classList.contains('open') ? 'hidden' : '';
  }
  function closeMenu() {
    document.getElementById('hamburger').classList.remove('open');
    document.getElementById('mobileMenu').classList.remove('open');
    document.body.style.overflow = '';
  }

  // Nav + bottom nav active on scroll
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  const bnLinks = { remeras: document.getElementById('bn-remeras'), buzos: document.getElementById('bn-buzos'), pantalones: document.getElementById('bn-pantalones') };
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
    Object.entries(bnLinks).forEach(([id, el]) => { if (el) el.classList.toggle('active', id === cur); });
  });
