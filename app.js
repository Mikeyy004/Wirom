// Wait for DOM to be fully loaded before running any code
console.log('JavaScript file loaded, waiting for DOM...');

// JavaScript is working properly

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  console.log('DOMContentLoaded event fired successfully');
  
  // Test if we can access the DOM
  console.log('Body element:', document.body);
  console.log('HTML element:', document.documentElement);
  
// Smoothly reveal elements when they enter the viewport
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); })
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Custom cursor
const cursor = document.getElementById('cursor');
  if (cursor) {
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', e=>{
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
});
// Grow cursor on interactive elements
document.querySelectorAll('a,button,input,textarea,select,summary').forEach(el=>{
  el.addEventListener('mouseenter', ()=> cursor.classList.add('cursor--grow'))
  el.addEventListener('mouseleave', ()=> cursor.classList.remove('cursor--grow'))
});
  } else {
    console.error('Cursor element not found');
  }

// Parallax on hero car card (disabled for reduced motion)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const parallaxCard = document.getElementById('parallaxCard');
const heroEl = document.querySelector('.hero');
if(!prefersReduced && parallaxCard && heroEl){
  heroEl.addEventListener('mousemove', e=>{
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    parallaxCard.style.transform = `translate(${x*18}px, ${y*12}px)`;
  });
  heroEl.addEventListener('mouseleave', ()=>{parallaxCard.style.transform='translate(0,0)'});
}

// Global admin flag
window.isAdmin = false;

// Hero thumbnail switching
const heroImage = document.getElementById('heroImage');
// Remove placeholder fallback images: do not replace on error
function wireHeroThumbs(){
  const thumbs = Array.from(document.querySelectorAll('.hero-thumb'));
  thumbs.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const nextSrc = btn.getAttribute('data-src');
    if(!nextSrc || !heroImage) return;
    heroImage.style.opacity = '0.6';
    const tmp = new Image();
    tmp.onload = ()=>{
      heroImage.src = nextSrc;
      heroImage.style.opacity = '1';
    };
    tmp.onerror = ()=>{
      heroImage.style.opacity = '1';
    };
    tmp.src = nextSrc;
      thumbs.forEach(b=> b.classList.remove('is-active'));
    btn.classList.add('is-active');
      thumbs.forEach(b=> b.setAttribute('aria-selected','false'));
    btn.setAttribute('aria-selected','true');
      // Also update textual labels if present
      const nm = document.getElementById('heroCarName');
      const pr = document.getElementById('heroCarPrice');
      if(nm) nm.textContent = btn.dataset.name || '';
      if(pr) pr.textContent = btn.dataset.price ? `$${Number(btn.dataset.price).toLocaleString()}` : '';
    });
  });
}

// Build hero thumbnails from current inventory cards
function buildHeroFromInventory(maxThumbs = 6){
  const grid = document.getElementById('inventoryGrid');
  const container = document.querySelector('.hero-thumbs');
  if(!grid || !container) return;
  const cards = Array.from(grid.querySelectorAll('.card'));
  container.innerHTML = '';
  let first = null;
  cards.slice(0, maxThumbs).forEach((card, idx)=>{
    const img = card.querySelector('img');
    const name = card.querySelector('h3')?.textContent?.trim() || '';
    const priceText = (card.querySelector('.price')?.textContent || '').replace(/[$,\s]/g,'');
    const price = parseInt(priceText||'0',10);
    if(!img || !img.src) return;
    const thumb = document.createElement('div');
    thumb.className = 'hero-thumb' + (idx===0 ? ' is-active' : '');
    thumb.setAttribute('data-src', img.src);
    thumb.setAttribute('data-name', name);
    thumb.setAttribute('data-price', String(price));
    thumb.innerHTML = `<img src="${img.src}" alt="${name} thumb">`;
    container.appendChild(thumb);
    if(idx===0){
      first = { src: img.src, name, price };
    }
  });
  // Set hero to first card
  if(first && heroImage){
    heroImage.src = first.src;
    const nm = document.getElementById('heroCarName');
    const pr = document.getElementById('heroCarPrice');
    if(nm) nm.textContent = first.name;
    if(pr) pr.textContent = `$${Number(first.price||0).toLocaleString()}`;
  }
  wireHeroThumbs();
  // Start/refresh mobile carousel when thumbnails are (re)built
  setupMobileHeroCarousel();
}

// Mobile-only hero carousel (auto-advance every 4 seconds)
let heroCarouselTimer = null;
function setupMobileHeroCarousel(){
  const mq = window.matchMedia('(max-width: 640px)');
  // clear any existing timer
  if(heroCarouselTimer){ clearInterval(heroCarouselTimer); heroCarouselTimer = null; }
  if(!mq.matches) return; // only enable on mobile
  const thumbs = Array.from(document.querySelectorAll('.hero-thumb'));
  if(thumbs.length === 0) return;
  // derive current index based on active class
  let idx = Math.max(0, thumbs.findIndex(t=> t.classList.contains('is-active')));
  heroCarouselTimer = setInterval(()=>{
    idx = (idx + 1) % thumbs.length;
    thumbs[idx].click();
  }, 4000);
  // If user taps a thumb, update the index so rotation continues from there
  thumbs.forEach((t, i)=> t.addEventListener('click', ()=>{ idx = i; }));
}

// Contact form simple handler (demo)
function handleContact(e){
    console.log('Contact form submitted');
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const info = document.getElementById('contactinfo').value.trim();
  const msg = document.getElementById('message').value.trim();
    
    if (!name || !info || !msg) {
      alert('Please fill in all fields');
      return false;
    }
    
  const subject = encodeURIComponent('Enquiry from website');
  const body = encodeURIComponent(`Name: ${name}\nContact: ${info}\nMessage: ${msg}`);
    window.location.href = `mailto:sales@wirom.co.zw?subject=${subject}&body=${body}`;
  setTimeout(()=> e.target.reset(), 300);
  return false;
}

// Quick WhatsApp action (customize number)
function openWhatsApp(){
    console.log('Opening WhatsApp...');
  const number = '263717313810'; // <- business number (country code, no +)
  const text = encodeURIComponent('Hi Wirom, I\'m interested in a car.');
    const url = `https://wa.me/${number}?text=${text}`;
    console.log('WhatsApp URL:', url);
    window.open(url, '_blank');
}

// Header scroll behavior + back-to-top
const header = document.querySelector('header');
const toTop = document.getElementById('toTop');
  
  if (header && toTop) {
window.addEventListener('scroll', ()=>{
  const s = window.scrollY;
  header.style.boxShadow = s>60 ? '0 8px 30px rgba(10,20,40,0.06)' : 'none';
  if(s>300) toTop.classList.add('visible'); else toTop.classList.remove('visible');
});
toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior: prefersReduced? 'auto':'smooth'}));
  }

// Accessibility: hide custom cursor when keyboard navigation used
  if (cursor) {
window.addEventListener('keydown', (e)=>{ if(e.key==='Tab') cursor.style.display='none' });
  }

// Smooth scroll to contact
  const scrollToContactBtn = document.getElementById('scrollToContact');
  
  if (scrollToContactBtn) {
    scrollToContactBtn.addEventListener('click', ()=>{
      console.log('Scrolling to contact section...');
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({behavior: prefersReduced? 'auto':'smooth'});
      } else {
        console.error('Contact section not found');
      }
    });
  } else {
    console.error('Scroll to contact button not found');
  }

  // Add scroll functionality for inventory links
  document.querySelectorAll('a[href="#inventory"]').forEach(link => {
    link.addEventListener('click', (e) => {
      console.log('Inventory link clicked!');
      e.preventDefault();
      const inventorySection = document.getElementById('inventory');
      if (inventorySection) {
        console.log('Scrolling to inventory section...');
        inventorySection.scrollIntoView({behavior: prefersReduced? 'auto':'smooth'});
      } else {
        console.error('Inventory section not found');
      }
    });
  });

  // Add scroll functionality for about links
  document.querySelectorAll('a[href="#about"]').forEach(link => {
    link.addEventListener('click', (e) => {
      console.log('About link clicked!');
      e.preventDefault();
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        console.log('Scrolling to about section...');
        aboutSection.scrollIntoView({behavior: prefersReduced? 'auto':'smooth'});
      } else {
        console.error('About section not found');
      }
    });
});

// Mobile navigation
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
  
function closeMobileNav(){
    if (mobileNav) {
  mobileNav.hidden = true;
  mobileNav.style.opacity = 0;
  mobileNav.style.transform = 'translateY(-12px)';
    }
    if (navToggle) {
  navToggle.setAttribute('aria-expanded','false');
  navToggle.setAttribute('aria-label','Open menu');
}
  }
  
function openMobileNav(){
    if (mobileNav) {
  mobileNav.hidden = false;
  requestAnimationFrame(()=>{
    mobileNav.style.opacity = 1;
    mobileNav.style.transform = 'translateY(0)';
    mobileNav.classList.add('visible');
  });
    }
    if (navToggle) {
  navToggle.setAttribute('aria-expanded','true');
  navToggle.setAttribute('aria-label','Close menu');
}
  }
  
  if (navToggle) {
navToggle.addEventListener('click', ()=>{
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  if(expanded) closeMobileNav(); else openMobileNav();
});
  }
  
  if (mobileNav) {
mobileNav.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeMobileNav));
  }

// Inventory filters
const searchInput = document.getElementById('searchInput');
const typeSelect = document.getElementById('typeSelect');
const priceSelect = document.getElementById('priceSelect');
const clearFilters = document.getElementById('clearFilters');
const cards = Array.from(document.querySelectorAll('#inventoryGrid .card'));

function applyFilters(){
  const q = searchInput.value.trim().toLowerCase();
  const t = typeSelect.value;
  const p = priceSelect.value ? parseInt(priceSelect.value,10) : Infinity;
  let visibleCount = 0;
  cards.forEach(card=>{
    const name = (card.getAttribute('data-name')||'').toLowerCase();
    const type = card.getAttribute('data-type')||'';
    const price = parseInt(card.getAttribute('data-price')||'0',10);
    const match = (!q || name.includes(q)) && (!t || type===t) && (price <= p);
    card.style.display = match ? '' : 'none';
    if(match) visibleCount++;
  });
  document.getElementById('noResults')?.remove();
  if(visibleCount===0){
    const msg = document.createElement('div');
    msg.id='noResults';
    msg.className='muted';
    msg.style.marginTop='10px';
    msg.textContent='No cars match your filters. Try adjusting your search.';
    document.getElementById('inventory').appendChild(msg);
  }
}
  
  if (searchInput && typeSelect && priceSelect) {
[searchInput,typeSelect,priceSelect].forEach(el=> el.addEventListener('input', applyFilters));
  }
  
  if (clearFilters) {
    clearFilters.addEventListener('click', ()=>{ 
      if (searchInput) searchInput.value=''; 
      if (typeSelect) typeSelect.value=''; 
      if (priceSelect) priceSelect.value=''; 
      applyFilters(); 
    });
  }

// Footer year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

// Floating Import Card interactions
const importFab = document.getElementById('importFab');
const importBackdrop = document.getElementById('importBackdrop');
const importClose = document.getElementById('importClose');

function openImport(){
    if (importBackdrop) {
  importBackdrop.hidden = false;
  requestAnimationFrame(()=> importBackdrop.classList.add('visible'));
}
  }
  
function closeImport(){
    if (importBackdrop) {
  importBackdrop.classList.remove('visible');
  setTimeout(()=> importBackdrop.hidden = true, 150);
}
  }
  
  if (importFab) importFab.addEventListener('click', openImport);
  if (importClose) importClose.addEventListener('click', closeImport);
  if (importBackdrop) {
importBackdrop.addEventListener('click', (e)=>{ if(e.target === importBackdrop) closeImport(); });
  }
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && importBackdrop && !importBackdrop.hidden) closeImport(); });

// Contact popup
const contactOpen = document.getElementById('contactOpen');
const contactOpenMobile = document.getElementById('contactOpenMobile');
const contactBackdrop = document.getElementById('contactBackdrop');
const contactClose = document.getElementById('contactClose');

function openContact(){
    if (contactBackdrop) {
  contactBackdrop.hidden = false;
  requestAnimationFrame(()=> contactBackdrop.classList.add('visible'));
}
  }
  
function closeContact(){
    if (contactBackdrop) {
  contactBackdrop.classList.remove('visible');
  setTimeout(()=> contactBackdrop.hidden = true, 150);
}
  }
  
if(contactOpen) contactOpen.addEventListener('click', (e)=>{ e.preventDefault(); openContact(); });
if(contactOpenMobile) contactOpenMobile.addEventListener('click', (e)=>{ e.preventDefault(); closeMobileNav(); openContact(); });
  if(contactClose) contactClose.addEventListener('click', closeContact);
  if(contactBackdrop) {
contactBackdrop.addEventListener('click', (e)=>{ if(e.target === contactBackdrop) closeContact(); });
  }
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && contactBackdrop && !contactBackdrop.hidden) closeContact(); });

// Email fallback handling
const emailAddress = 'sales@wirom.co.zw';
function tryOpenMailto(url){
  // Attempt to open mailto; if blocked or no handler, show fallback after short delay
  let opened = false;
  try {
    window.location.href = url;
    opened = true; // browsers may still fail silently
  } catch(err){
    opened = false;
  }
  // Show fallback regardless after a tick; harmless if email client did open
  setTimeout(()=>{
    openEmailFallback();
  }, 300);
}

const emailFallbackBackdrop = document.getElementById('emailFallbackBackdrop');
const emailFallbackClose = document.getElementById('emailFallbackClose');
const copyEmailBtn = document.getElementById('copyEmailBtn');
const openGmailBtn = document.getElementById('openGmailBtn');
const openYahooBtn = document.getElementById('openYahooBtn');

function openEmailFallback(){
  if(!emailFallbackBackdrop) return;
  emailFallbackBackdrop.hidden = false;
  requestAnimationFrame(()=> emailFallbackBackdrop.classList.add('visible'));
}
function closeEmailFallback(){
  if(!emailFallbackBackdrop) return;
  emailFallbackBackdrop.classList.remove('visible');
  setTimeout(()=> emailFallbackBackdrop.hidden = true, 150);
}
if(emailFallbackClose) emailFallbackClose.addEventListener('click', closeEmailFallback);
if(emailFallbackBackdrop){
  emailFallbackBackdrop.addEventListener('click', (e)=>{ if(e.target === emailFallbackBackdrop) closeEmailFallback(); });
}
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && emailFallbackBackdrop && !emailFallbackBackdrop.hidden) closeEmailFallback(); });

if(copyEmailBtn){
  copyEmailBtn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(emailAddress);
      copyEmailBtn.textContent = 'Copied';
      setTimeout(()=> copyEmailBtn.textContent = 'Copy', 1500);
    }catch(err){
      alert('Could not copy. Select and copy manually: ' + emailAddress);
    }
  });
}
if(openGmailBtn){
  const subject = encodeURIComponent('Enquiry from website');
  const body = encodeURIComponent('Hi Wirom, I\'m interested in a car.');
  openGmailBtn.href = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(emailAddress)}&su=${subject}&body=${body}`;
}
if(openYahooBtn){
  const subject = encodeURIComponent('Enquiry from website');
  const body = encodeURIComponent('Hi Wirom, I\'m interested in a car.');
  openYahooBtn.href = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(emailAddress)}&subject=${subject}&body=${body}`;
}

// Note: We no longer intercept all mailto links globally to ensure default mail clients/webmail handle them normally on GitHub Pages.

// Theme: automatic by local time (light 06:00–18:00, dark otherwise)
const root = document.documentElement;

function applyTheme(theme){
  if(theme==='light'){
    root.setAttribute('data-theme','light');
  } else {
    root.removeAttribute('data-theme'); // dark is default
  }
}

function getTimeBasedTheme(){
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'light' : 'dark';
}

// Initial apply based on time
applyTheme(getTimeBasedTheme());

// Re-evaluate theme on hour change (check every 5 minutes)
setInterval(()=>{
  applyTheme(getTimeBasedTheme());
}, 5 * 60 * 1000);

  // Duty calculation popup
  function showDutyPopup(){
    alert('Don\'t forget duty. Duty calculation is needed for most vehicles (shipping included).\n\nContact us for accurate duty calculations based on your specific vehicle choice.');
  }

  // Admin Access System
  // Press Ctrl+Shift+A to access admin panel
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      showAdminLogin();
    }
  });

  // Alternative: Double-click the logo to access admin
  const logo = document.querySelector('.logo');
  if (logo) {
    let clickCount = 0;
    let clickTimer = null;
    
    logo.addEventListener('click', function(e) {
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 500);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        showAdminLogin();
      }
    });
  }

  function showAdminLogin() {
    const carManager = document.getElementById('car-manager');
    if (carManager) {
      carManager.style.display = 'block';
      carManager.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Admin functions moved outside DOMContentLoaded to be globally accessible

  // Firebase-powered Car Management System
  let currentCarData = null;

  // Load cars from Firebase on page load
  console.log('DOM loaded, checking for Firebase...');
  // Wait for Firebase to be available
  const checkFirebase = setInterval(() => {
    if (window.firebase) {
      console.log('Firebase is available, loading cars...');
      clearInterval(checkFirebase);
      loadCarsFromFirebase();
      // Build initial hero from current DOM (before Firebase finishes) to ensure correct layout
      buildHeroFromInventory();
    } else {
      console.log('Waiting for Firebase...');
    }
  }, 100);
  
  // Timeout after 10 seconds
  setTimeout(() => {
    if (!window.firebase) {
      console.error('Firebase failed to load after 10 seconds');
      clearInterval(checkFirebase);
    }
  }, 10000);

  async function loadCarsFromFirebase() {
  try {
    console.log('Loading cars from Firebase...');
    const carsSnapshot = await window.firebase.getDocs(window.firebase.collection(window.firebase.db, 'cars'));
    console.log('Cars snapshot received:', carsSnapshot.size, 'cars');
    
    const inventoryGrid = document.getElementById('inventoryGrid');
    
    if (!inventoryGrid) {
      console.error('Inventory grid not found');
      return;
    }
    
    // Clear existing Firebase cars (keep hardcoded ones)
    const existingCards = inventoryGrid.querySelectorAll('.card[data-firebase="true"]');
    console.log('Removing', existingCards.length, 'existing Firebase cars');
    existingCards.forEach(card => card.remove());
    
    carsSnapshot.forEach((doc) => {
      const carData = doc.data();
      // Only show cars from Wirom
      if (carData.source === 'wirom') {
        console.log('Adding car to grid:', carData.make, carData.model);
        addCarToGrid(carData, doc.id);
      }
    });
    
    console.log('Finished loading cars from Firebase');
    // Rebuild hero thumbnails from latest inventory (now includes Firebase cars)
    buildHeroFromInventory();
  } catch (error) {
    console.error('Error loading cars:', error);
    console.error('Error details:', error.message);
  }
}

function addCarToGrid(carData, carId) {
  console.log('addCarToGrid called with:', carData, carId);
  
  const inventoryGrid = document.getElementById('inventoryGrid');
  if (!inventoryGrid) {
    console.error('Inventory grid not found in addCarToGrid');
    return;
  }
  
  console.log('Inventory grid found:', inventoryGrid);
  
  const carName = `${carData.year} ${carData.make} ${carData.model}`;
  const encodedName = encodeURIComponent(carName);
  const encodedPrice = encodeURIComponent(carData.price);
  const encodedImage = encodeURIComponent(carData.image);
  const meta = `${carData.mileage ? carData.mileage + ' km • ' : ''}${carData.fuel}`;
  const encodedMeta = encodeURIComponent(meta);
  
  console.log('Car name:', carName);
  console.log('Encoded values:', { encodedName, encodedPrice, encodedImage, encodedMeta });
  
  // Determine car type based on model name
  let carType = 'sedan'; // default
  const modelLower = carData.model.toLowerCase();
  if (modelLower.includes('hiace') || modelLower.includes('hiace') || modelLower.includes('van')) {
    carType = 'van';
  } else if (modelLower.includes('suv') || modelLower.includes('x1') || modelLower.includes('cross')) {
    carType = 'suv';
  } else if (modelLower.includes('hatch') || modelLower.includes('passo')) {
    carType = 'hatchback';
  } else if (modelLower.includes('pickup') || modelLower.includes('ranger')) {
    carType = 'pickup';
  }
  
  console.log('Determined car type:', carType);
  
  // Generate tags HTML
  let tagsHTML = '';
  if (carData.tags && carData.tags.length > 0) {
    console.log('Processing tags:', carData.tags);
    tagsHTML = '<div class="tags">';
    carData.tags.forEach((tag) => {
      const className = tag.toLowerCase().includes('best') ? 'best' : 'dot';
      tagsHTML += `<span class="badge-pill ${className}">${tag}</span>`;
    });
    tagsHTML += '</div>';
  }
  
  const newCarHTML = `<article class="card reveal visible" data-type="${carType}" data-price="${carData.price}" data-name="${carName}" data-firebase="true" data-car-id="${carId}">
    <div class="car-card-content" onclick="location.href='car.html?name=${encodedName}&price=${encodedPrice}&img=${encodedImage}&meta=${encodedMeta}&id=${encodeURIComponent(carId)}'">
      <img src="${carData.image}" alt="${carData.imageAlt ? carData.imageAlt : carName}" loading="lazy">
      <h3>${carName}</h3>
      ${tagsHTML}
      <div class="price-row"><div class="permo">${carData.fuel}</div><div class="price">$${Number(carData.price).toLocaleString()}</div></div>
    </div>
    <div class="admin-actions" style="display:flex;gap:6px;margin-top:6px">
      <button class="edit-car-btn" data-edit-btn="${carId}" title="Edit car" style="display:none">✏️</button>
      <button class="delete-car-btn" data-delete-btn="${carId}" title="Delete car" style="display:none">🗑️</button>
    </div>
  </article>`;
  
  console.log('Generated HTML:', newCarHTML);
  console.log('Adding to inventory grid...');
  
  inventoryGrid.insertAdjacentHTML('beforeend', newCarHTML);
  
  console.log('Car HTML added to grid successfully');
  
  // Check if the car was actually added
  const addedCard = inventoryGrid.querySelector(`[data-name="${carName}"]`);
  if (addedCard) {
    console.log('Car card found in DOM:', addedCard);
    console.log('Card computed styles:', window.getComputedStyle(addedCard));
    console.log('Card display:', window.getComputedStyle(addedCard).display);
    console.log('Card visibility:', window.getComputedStyle(addedCard).visibility);
    console.log('Card opacity:', window.getComputedStyle(addedCard).opacity);
    console.log('Card position:', addedCard.getBoundingClientRect());
  } else {
    console.error('Car card not found in DOM after insertion');
  }

  // Show delete button for admins only
  if (window.isAdmin) {
    const delBtn = inventoryGrid.querySelector(`button[data-delete-btn="${carId}"]`);
    const editBtn = inventoryGrid.querySelector(`button[data-edit-btn="${carId}"]`);
    if (delBtn) delBtn.style.display = '';
    if (editBtn) editBtn.style.display = '';
  }
}

// Updated form submission handler
document.getElementById('carInputForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  console.log('Form submitted, starting car addition...');
  
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitLoading = document.getElementById('submitLoading');
  const successMessage = document.getElementById('successMessage');
  
  // Show loading state
  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitLoading.style.display = 'inline';
  successMessage.style.display = 'none';
  
  const carData = {
    make: document.getElementById('carMake').value.trim(),
    model: document.getElementById('carModel').value.trim(),
    year: parseInt(document.getElementById('carYear').value),
    price: parseInt(document.getElementById('carPrice').value),
    mileage: document.getElementById('carMileage').value.trim(),
    fuel: document.getElementById('carFuel').value,
    image: document.getElementById('carImage').value.trim(),
    imageAlt: document.getElementById('carImageAlt').value.trim(),
    description: document.getElementById('carDescription').value.trim(),
    tags: document.getElementById('carTags').value.trim().split(',').map(tag => tag.trim()).filter(tag => tag),
    createdAt: new Date(),
    status: 'active',
    source: 'wirom' // Identify as Wirom car
  };
  
  console.log('Car data prepared:', carData);
  
  try {
    // Check if Firebase is available
    if (!window.firebase) {
      throw new Error('Firebase is not available');
    }
    
    console.log('Adding car to Firebase...');
    
    // Add car to Firebase
    const docRef = await window.firebase.addDoc(window.firebase.collection(window.firebase.db, 'cars'), carData);
    
    console.log('Car added to Firebase with ID:', docRef.id);
    
    // Add car to the grid immediately
    addCarToGrid(carData, docRef.id);
    
    console.log('Car added to grid successfully');
    
    // Reset form
    document.getElementById('carInputForm').reset();
    
    // Show success message
    successMessage.style.display = 'block';
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('Error adding car:', error);
    console.error('Error details:', error.message);
    alert('Error adding car: ' + error.message + '\n\nCheck the browser console for more details.');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitText.style.display = 'inline';
    submitLoading.style.display = 'none';
  }
});

// Delete car function
async function deleteCar(carId, carName) {
  if (!confirm(`Are you sure you want to delete "${carName}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    console.log('Deleting car:', carId);
    
    // Delete from Firebase
    await window.firebase.deleteDoc(window.firebase.doc(window.firebase.db, 'cars', carId));
    
    // Remove from DOM
    const carCard = document.querySelector(`[data-car-id="${carId}"]`);
    if (carCard) {
      carCard.remove();
      console.log('Car removed from DOM');
    }
    
    alert(`"${carName}" has been deleted successfully.`);
  } catch (error) {
    console.error('Error deleting car:', error);
    alert('Error deleting car. Please try again.');
  }
}

// Expose globally so inline or delegated handlers can access
window.deleteCar = deleteCar;

// Simple prompt-based editor for admin to update image alt and description
async function promptEditCar(carId, carName, currentAlt){
  try {
    const newAlt = prompt(`Edit image description (alt text) for \"${carName}\"`, currentAlt || '');
    if (newAlt === null) return; // cancelled
    // Optionally extend to edit description later
    if (!window.firebase) throw new Error('Firebase is not available');
    const ref = window.firebase.doc(window.firebase.db, 'cars', carId);
    await window.firebase.updateDoc(ref, { imageAlt: newAlt });
    // Update DOM
    const card = document.querySelector(`[data-car-id="${carId}"]`);
    const imgEl = card ? card.querySelector('img') : null;
    if (imgEl) imgEl.alt = newAlt || card.getAttribute('data-name') || '';
    alert('Image description updated.');
  } catch(err){
    console.error('Error updating car:', err);
    alert('Failed to update. Please try again.');
  }
}
window.editCar = promptEditCar;

// Car modal functions
function showCarDetailsModal(name, price, image, meta) {
  const title = document.getElementById('carModalTitle');
  const nameEl = document.getElementById('carModalName');
  const priceEl = document.getElementById('carModalPrice');
  const metaEl = document.getElementById('carModalMeta');
  const imgEl = document.getElementById('carModalImage');
  const descEl = document.getElementById('carModalDescription');
  const gallery = document.getElementById('carModalGallery');
  const addImgBtn = document.getElementById('carModalAddImageBtn');
  const editDescBtn = document.getElementById('carModalEditDescBtn');

  nameEl.textContent = name;
  priceEl.textContent = `$${Number(price).toLocaleString()}`;
  metaEl.textContent = meta;
  imgEl.src = image;
  title.textContent = name;
  descEl.textContent = '';
  gallery.innerHTML = '';

  // Attempt to locate this car in Firebase for extra details (images[], description, imageAlt)
  // We match by name and image URL currently rendered in cards
  try {
    if (window.firebase) {
      // naive scan of DOM to find card with same name and image
      const card = Array.from(document.querySelectorAll(`[data-name]`))
        .find(el => el.getAttribute('data-name') === name && el.querySelector('img') && el.querySelector('img').src === image);
      const carId = card ? card.getAttribute('data-car-id') : null;
      if (carId) {
        // read doc
        window.firebase.getDoc(window.firebase.doc(window.firebase.db, 'cars', carId)).then(snap=>{
          if (snap.exists()) {
            const data = snap.data();
            if (data.description) descEl.textContent = data.description;
            if (data.images && Array.isArray(data.images)) {
              data.images.forEach((url, idx)=>{
                const thumb = document.createElement('img');
                thumb.src = url;
                thumb.alt = data.imageAlt || `${name} image ${idx+1}`;
                thumb.style.width = '64px';
                thumb.style.height = '64px';
                thumb.style.objectFit = 'cover';
                thumb.style.borderRadius = '6px';
                thumb.addEventListener('click', ()=>{ imgEl.src = url; });
                gallery.appendChild(thumb);
              });
            }
            if (data.imageAlt) imgEl.alt = data.imageAlt;
          }
        });
        // Admin controls
        if (window.isAdmin) {
          if (addImgBtn) addImgBtn.style.display = '';
          if (editDescBtn) editDescBtn.style.display = '';
          addImgBtn.onclick = ()=> adminAddImageToCar(carId, name, gallery, imgEl);
          editDescBtn.onclick = ()=> adminEditDescription(carId, name, descEl);
        } else {
          if (addImgBtn) addImgBtn.style.display = 'none';
          if (editDescBtn) editDescBtn.style.display = 'none';
        }
      } else {
        if (addImgBtn) addImgBtn.style.display = 'none';
        if (editDescBtn) editDescBtn.style.display = 'none';
      }
    }
  } catch(err) {
    console.warn('Could not load extra car details for modal:', err);
  }
  
  const modal = document.getElementById('carModalBackdrop');
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('visible'));
  }

  function closeCarModal() {
    const modal = document.getElementById('carModalBackdrop');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.hidden = true, 300);
    }
  }

  // Hero car switching function
  function switchHeroCar(clickedThumb) {
    // Get car data from the clicked thumbnail
    const carImage = clickedThumb.dataset.src;
    const carName = clickedThumb.dataset.name;
    const carPrice = clickedThumb.dataset.price;
    const carFuel = clickedThumb.dataset.fuel;
    
    // Update main hero image
    const heroImage = document.getElementById('heroImage');
    const heroCarName = document.getElementById('heroCarName');
    const heroCarFuel = document.getElementById('heroCarFuel');
    const heroCarPrice = document.getElementById('heroCarPrice');
    
    if (heroImage && heroCarName && heroCarFuel && heroCarPrice) {
      // Add smooth transition effect
      heroImage.style.opacity = '0.7';
      
      setTimeout(() => {
        heroImage.src = carImage;
        heroImage.alt = carName;
        heroCarName.textContent = carName;
        heroCarFuel.textContent = carFuel;
        heroCarPrice.textContent = `$${Number(carPrice).toLocaleString()}`;
        heroCarPrice.setAttribute('aria-label', `Price ${carPrice} dollars`);
        
        heroImage.style.opacity = '1';
      }, 150);
    }
    
    // Update active thumbnail
    const allThumbs = document.querySelectorAll('.hero-thumb');
    allThumbs.forEach(thumb => {
      thumb.classList.remove('is-active');
      thumb.setAttribute('aria-selected', 'false');
    });
    
    clickedThumb.classList.add('is-active');
    clickedThumb.setAttribute('aria-selected', 'true');
  }

// Delegate delete button clicks on the inventory grid
const inventoryGridEl = document.getElementById('inventoryGrid');
if (inventoryGridEl) {
  inventoryGridEl.addEventListener('click', (e)=>{
    const btn = e.target.closest && e.target.closest('button[data-delete-btn]');
    if (btn) {
      e.stopPropagation();
      const carId = btn.getAttribute('data-delete-btn');
      const card = btn.closest('[data-car-id]');
      const name = card ? card.getAttribute('data-name') : 'this car';
      deleteCar(carId, name);
      return;
    }
    const edit = e.target.closest && e.target.closest('button[data-edit-btn]');
    if (edit) {
      e.stopPropagation();
      const carId = edit.getAttribute('data-edit-btn');
      const card = edit.closest('[data-car-id]');
      if (!card) return;
      const currentName = card.getAttribute('data-name') || '';
      const imgEl = card.querySelector('img');
      const currentAlt = imgEl ? imgEl.alt : '';
      const currentDesc = card.querySelector('h3') ? '' : '';
      promptEditCar(carId, currentName, currentAlt);
    }
  });
  }

  // Event listeners for modal
  document.getElementById('carModalClose')?.addEventListener('click', closeCarModal);
  document.getElementById('carModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('carModalBackdrop')) {
      closeCarModal();
    }
  });
  
  // Ensure all buttons and links work properly
  console.log('Setting up event listeners...');
  
  // Check if all required elements exist
  const requiredElements = [
    'scrollToContact', 'navToggle', 'mobileNav', 'themeToggle',
    'searchInput', 'typeSelect', 'priceSelect', 'clearFilters',
    'contactOpen', 'contactOpenMobile', 'contactBackdrop', 'contactClose',
    'importFab', 'importBackdrop', 'importClose'
  ];
  
  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id "${id}" not found`);
    } else {
      console.log(`Element "${id}" found`);
    }
  });

  // Admin helpers used in modal
  window.adminAddImageToCar = async function(carId, carName, galleryEl, mainImg){
    try {
      if (!window.firebase) throw new Error('Firebase is not available');
      const url = prompt(`Add image URL for "${carName}"`);
      if (!url) return;
      const ref = window.firebase.doc(window.firebase.db, 'cars', carId);
      await window.firebase.updateDoc(ref, { images: window.firebase.arrayUnion(url) });
      const thumb = document.createElement('img');
      thumb.src = url;
      thumb.alt = `${carName} image`;
      thumb.style.width = '64px';
      thumb.style.height = '64px';
      thumb.style.objectFit = 'cover';
      thumb.style.borderRadius = '6px';
      thumb.addEventListener('click', ()=>{ mainImg.src = url; });
      galleryEl.appendChild(thumb);
      alert('Image added');
    } catch(err){
      console.error('Failed adding image:', err);
      alert('Failed to add image');
    }
  }

  window.adminEditDescription = async function(carId, carName, descEl){
    try {
      if (!window.firebase) throw new Error('Firebase is not available');
      const current = descEl?.textContent || '';
      const next = prompt(`Edit description for "${carName}"`, current);
      if (next === null) return;
      const ref = window.firebase.doc(window.firebase.db, 'cars', carId);
      await window.firebase.updateDoc(ref, { description: next });
      if (descEl) descEl.textContent = next;
      alert('Description updated');
    } catch(err){
      console.error('Failed updating description:', err);
      alert('Failed to update description');
    }
  }

  // Basic click functionality is working - debugging code removed for cleaner console

}); // End of DOMContentLoaded

// Admin functions - globally accessible
function checkPassword() {
  const password = document.getElementById('adminPassword').value;
  // Change this password to whatever you want
  const correctPassword = 'wirom2024'; // You can change this
  
  if (password === correctPassword) {
    const loginSection = document.getElementById('loginSection');
    const carManagementSection = document.getElementById('carManagementSection');
    const adminPassword = document.getElementById('adminPassword');
    
    if (loginSection) loginSection.style.display = 'none';
    if (carManagementSection) carManagementSection.style.display = 'block';
    if (adminPassword) adminPassword.value = '';
    window.isAdmin = true;
    toggleAdminControls(true);
  } else {
    alert('Incorrect password. Please try again.');
    const adminPassword = document.getElementById('adminPassword');
    if (adminPassword) adminPassword.value = '';
  }
}

function logout() {
  const loginSection = document.getElementById('loginSection');
  const carManagementSection = document.getElementById('carManagementSection');
  const successMessage = document.getElementById('successMessage');
  const carManager = document.getElementById('car-manager');
  const carInputForm = document.getElementById('carInputForm');
  
  if (loginSection) loginSection.style.display = 'block';
  if (carManagementSection) carManagementSection.style.display = 'none';
  if (successMessage) successMessage.style.display = 'none';
  if (carManager) carManager.style.display = 'none';
  if (carInputForm) carInputForm.reset();
  window.isAdmin = false;
  toggleAdminControls(false);
}

// Toggle delete buttons visibility across the grid
function toggleAdminControls(isAdmin){
  const delBtns = document.querySelectorAll('button[data-delete-btn]');
  const editBtns = document.querySelectorAll('button[data-edit-btn]');
  delBtns.forEach(btn=>{ btn.style.display = isAdmin ? '' : 'none'; });
  editBtns.forEach(btn=>{ btn.style.display = isAdmin ? '' : 'none'; });
}

// Expose deleteCar globally so inline handlers can call it
window.deleteCar = deleteCar;
