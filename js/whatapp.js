
  // ⚙️ CAMBIÁ ESTE NÚMERO por el tuyo (formato: código país + número, sin + ni espacios)
  const WP_NUMBER = "5491126621868";

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
