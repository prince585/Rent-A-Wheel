/**
 * RentWheels — Vehicles Display & Rent Action Handler
 */

let allVehicles = [];
let activeFilter = 'all';
let currentSearchTerm = '';
let selectedVehicleForRent = null;
let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadUsers();
  await loadVehicles();
  setupFilterListeners();
  setupModalListeners();
});

// Fetch and load users into header & modal dropdowns
async function loadUsers() {
  try {
    allUsers = await api.getUsers();
    const globalSelect = document.getElementById('global-user-select');
    const modalSelect = document.getElementById('modal-user-select');

    if (!allUsers || allUsers.length === 0) {
      if (globalSelect) globalSelect.innerHTML = '<option value="">No users found</option>';
      return;
    }

    const optionsHtml = allUsers.map(u => `
      <option value="${u.userId}">${u.name} (${u.email})</option>
    `).join('');

    if (globalSelect) {
      globalSelect.innerHTML = optionsHtml;
      const savedUserId = storage.getSelectedUserId();
      if (savedUserId && allUsers.some(u => u.userId === savedUserId)) {
        globalSelect.value = savedUserId;
      } else {
        storage.setSelectedUserId(allUsers[0].userId);
      }

      globalSelect.addEventListener('change', (e) => {
        storage.setSelectedUserId(e.target.value);
        if (modalSelect) modalSelect.value = e.target.value;
      });
    }

    if (modalSelect) {
      modalSelect.innerHTML = optionsHtml;
      const savedUserId = storage.getSelectedUserId();
      if (savedUserId) modalSelect.value = savedUserId;
    }
  } catch (err) {
    console.error('Failed to load users:', err);
    showToast('Could not load user profiles. Make sure backend is running.', 'error');
  }
}

// Fetch all available vehicles
async function loadVehicles() {
  const grid = document.getElementById('vehicle-grid');
  try {
    allVehicles = await api.getAvailableVehicles();
    renderVehicles();
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--accent-red);">
        <h3>Failed to connect to RentWheels API</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
        <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="loadVehicles()">Retry</button>
      </div>
    `;
  }
}

// Filter and render vehicles in grid
function renderVehicles() {
  const grid = document.getElementById('vehicle-grid');
  let filtered = [...allVehicles];

  // Apply category filter
  if (activeFilter === 'CAR') {
    filtered = filtered.filter(v => v.vehicleType === 'CAR');
  } else if (activeFilter === 'BIKE') {
    filtered = filtered.filter(v => v.vehicleType === 'BIKE');
  } else if (activeFilter === 'electric') {
    filtered = filtered.filter(v => (v.fuelType && v.fuelType.toLowerCase() === 'electric') || (v.model && v.model.toLowerCase().includes('ev')));
  } else if (activeFilter === 'budget') {
    filtered = filtered.filter(v => v.hourlyRate <= 150);
  }

  // Apply search query
  if (currentSearchTerm.trim()) {
    const q = currentSearchTerm.toLowerCase();
    filtered = filtered.filter(v =>
      (v.brand && v.brand.toLowerCase().includes(q)) ||
      (v.model && v.model.toLowerCase().includes(q)) ||
      (v.vehicleType && v.vehicleType.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
        <h3>No vehicles matched your filter criteria</h3>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try clearing search term or switching filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(v => createVehicleCardHtml(v)).join('');

  // Attach Rent button listeners
  grid.querySelectorAll('.rent-trigger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const vehicleId = e.currentTarget.getAttribute('data-id');
      openRentModal(vehicleId);
    });
  });
}

// Generate single vehicle card HTML with distinct Car vs Bike layouts & SVG icons
function createVehicleCardHtml(v) {
  const isCar = v.vehicleType === 'CAR';
  const cardClass = isCar ? 'car-type' : 'bike-type';
  const perMinRate = (v.hourlyRate / 60.0).toFixed(2);
  const actionText = isCar ? `Rent ${v.model}` : `Book ${v.model}`;

  const carIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>`;
  const bikeIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h2.5l2 4.5M12 17.5V14l-3-3 4-3 2 3h3"></path></svg>`;

  // Specs pills
  let specPills = '';
  if (isCar) {
    specPills = `
      <div class="spec-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        ${v.numberOfSeats || 5} Seats
      </div>
      <div class="spec-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18"></path><path d="M13 13h4a2 2 0 0 1 2 2v7"></path></svg>
        ${v.fuelType || 'Petrol'}
      </div>
    `;
  } else {
    specPills = `
      <div class="spec-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        ${v.engineCapacity || 150} cc
      </div>
      <div class="spec-pill">
        ${v.bikeType || 'Standard'}
      </div>
    `;
  }

  return `
    <article class="vehicle-card ${cardClass}" id="card-${v.vehicleId}">
      <div class="vehicle-media">
        <img 
          src="${v.imageUrl || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'}" 
          alt="${v.brand} ${v.model}" 
          class="vehicle-img"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';"
        >
        <div class="media-badges">
          <span class="badge-type">${isCar ? carIcon : bikeIcon} ${isCar ? 'Car' : 'Motorcycle'}</span>
          <span class="badge-status available">Available</span>
        </div>
      </div>

      <div class="vehicle-content">
        <div class="vehicle-header">
          <span class="vehicle-brand">${v.brand}</span>
          <h3 class="vehicle-title">${v.model}</h3>
        </div>

        <div class="vehicle-specs">
          ${specPills}
        </div>

        <div class="vehicle-footer">
          <div class="rate-box">
            <div class="rate-amount">₹${Math.round(v.hourlyRate)} <span>/ hr</span></div>
            <div class="per-min-rate">₹${perMinRate}/min</div>
          </div>

          <button class="btn btn-primary rent-trigger-btn" data-id="${v.vehicleId}">
            <span>${actionText}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

// Setup filter tabs and search input
function setupFilterListeners() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderVehicles();
    });
  });

  const searchInput = document.getElementById('vehicle-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value;
      renderVehicles();
    });
  }
}

// Open Rent Modal for a specific vehicle
function openRentModal(vehicleId) {
  selectedVehicleForRent = allVehicles.find(v => v.vehicleId === vehicleId);
  if (!selectedVehicleForRent) return;

  const modal = document.getElementById('rent-modal');
  const preview = document.getElementById('rent-modal-vehicle-preview');
  const hiddenId = document.getElementById('modal-vehicle-id');
  const rateText = document.getElementById('modal-rate-text');
  const modalSelect = document.getElementById('modal-user-select');

  hiddenId.value = selectedVehicleForRent.vehicleId;
  const perMin = (selectedVehicleForRent.hourlyRate / 60.0).toFixed(2);
  rateText.textContent = `₹${selectedVehicleForRent.hourlyRate.toFixed(2)} / hr (₹${perMin} / min)`;

  // Match selected user
  const savedUserId = storage.getSelectedUserId();
  if (savedUserId && modalSelect) {
    modalSelect.value = savedUserId;
  }

  preview.innerHTML = `
    <div style="display: flex; gap: 0.85rem; align-items: center; background: var(--bg-main); padding: 0.75rem; border-radius: 0.35rem; border: 1px solid var(--border-subtle);">
      <img src="${selectedVehicleForRent.imageUrl}" alt="${selectedVehicleForRent.model}" style="width: 85px; height: 60px; border-radius: 0.25rem; object-fit: cover;">
      <div>
        <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">${selectedVehicleForRent.brand}</div>
        <h4 style="font-size: 1.05rem; color: var(--text-primary);">${selectedVehicleForRent.model}</h4>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${selectedVehicleForRent.vehicleType === 'CAR' ? 'Car' : 'Motorcycle'}</div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

// Setup Modal event handlers
function setupModalListeners() {
  const modal = document.getElementById('rent-modal');
  const closeBtn = document.getElementById('close-rent-modal');
  const cancelBtn = document.getElementById('cancel-rent-btn');
  const form = document.getElementById('rent-form');

  const closeModal = () => modal.classList.remove('open');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const vehicleId = document.getElementById('modal-vehicle-id').value;
      const userId = document.getElementById('modal-user-select').value;
      const confirmBtn = document.getElementById('confirm-rent-btn');

      if (!userId) {
        showToast('Please select a renter profile.', 'error');
        return;
      }

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span>Starting Ride...</span>';

      try {
        const rental = await api.rentVehicle(userId, vehicleId);
        storage.setActiveRentalId(rental.rentalId);
        storage.setSelectedUserId(userId);
        showToast(`Rental confirmed for ${selectedVehicleForRent.brand} ${selectedVehicleForRent.model}!`, 'success');
        closeModal();

        // Redirect to active rental cockpit
        setTimeout(() => {
          window.location.href = 'rental.html';
        }, 500);
      } catch (err) {
        showToast(err.message || 'Failed to rent vehicle', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<span>Start Ride &amp; Turn Key</span>';
      }
    });
  }
}
