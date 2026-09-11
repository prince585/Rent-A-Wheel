/**
 * RentWheels — Rental History & Analytics Controller
 */

let allRentals = [];
let vehiclesMap = new Map();
let usersMap = new Map();

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupHistoryControls();
  setupReceiptModal();
});

async function loadData() {
  const tbody = document.getElementById('history-table-body');
  try {
    const [rentals, vehicles, users] = await Promise.all([
      api.getAllRentals(),
      api.getVehicles(),
      api.getUsers()
    ]);

    allRentals = rentals || [];
    vehiclesMap = new Map((vehicles || []).map(v => [v.vehicleId, v]));
    usersMap = new Map((users || []).map(u => [u.userId, u]));

    updateMetrics();
    renderHistoryTable();
  } catch (err) {
    console.error('Failed to load history:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; color: var(--accent-red); padding: 3rem;">
          Failed to load rental history: ${err.message}
        </td>
      </tr>
    `;
  }
}

function updateMetrics() {
  const total = allRentals.length;
  const activeRentals = allRentals.filter(r => r.status === 'ACTIVE');
  const completedRentals = allRentals.filter(r => r.status === 'COMPLETED');
  
  const completedRevenue = completedRentals.reduce((sum, r) => sum + (r.finalAmount || 0), 0);
  const activeLiveRevenue = activeRentals.reduce((sum, r) => {
    const elapsedSec = Math.max(60, Math.floor((Date.now() - new Date(r.startTime).getTime()) / 1000));
    return sum + ((elapsedSec / 3600.0) * r.hourlyRateAtBooking);
  }, 0);
  const totalRevenue = completedRevenue + activeLiveRevenue;

  const totalMinutes = completedRentals.reduce((sum, r) => sum + (r.durationInMinutes || 0), 0);
  const avgDuration = completedRentals.length > 0 ? Math.round(totalMinutes / completedRentals.length) : 0;

  document.getElementById('stat-total-rentals').textContent = total;
  document.getElementById('stat-active-rentals').textContent = activeRentals.length;
  document.getElementById('stat-total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
  document.getElementById('stat-avg-duration').textContent = `${avgDuration} min`;
}

function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  const query = (document.getElementById('history-search').value || '').toLowerCase();
  const statusFilter = document.getElementById('status-filter').value;

  let filtered = [...allRentals];

  if (statusFilter !== 'ALL') {
    filtered = filtered.filter(r => r.status === statusFilter);
  }

  if (query) {
    filtered = filtered.filter(r => {
      const v = vehiclesMap.get(r.vehicleId);
      const u = usersMap.get(r.userId);
      const vName = v ? `${v.brand} ${v.model}`.toLowerCase() : '';
      const uName = u ? u.name.toLowerCase() : '';
      const rId = (r.rentalId || '').toLowerCase();
      return rId.includes(query) || vName.includes(query) || uName.includes(query);
    });
  }

  filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 3rem;">
          No rental records match the filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const vehicle = vehiclesMap.get(r.vehicleId);
    const user = usersMap.get(r.userId);
    const isActive = r.status === 'ACTIVE';

    const vImg = vehicle && vehicle.imageUrl ? vehicle.imageUrl : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';
    const vName = vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${r.vehicleId.slice(-6)}`;
    const uName = user ? user.name : `User #${r.userId.slice(-6)}`;

    const startDate = new Date(r.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const endDate = r.endTime ? new Date(r.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—';
    
    let durationText = `${r.durationInMinutes || 1} min(s)`;
    let amountText = `₹${(r.finalAmount || 0).toFixed(2)}`;

    if (isActive) {
      const elapsedSec = Math.max(60, Math.floor((Date.now() - new Date(r.startTime).getTime()) / 1000));
      const activeMin = Math.ceil(elapsedSec / 60.0);
      const liveEst = (elapsedSec / 3600.0) * r.hourlyRateAtBooking;
      durationText = `${activeMin} min(s) (Live)`;
      amountText = `₹${liveEst.toFixed(2)}`;
    }

    const statusBadge = isActive
      ? `<span class="status-tag active">Active</span>`
      : `<span class="status-tag completed">Completed</span>`;

    const actionBtn = isActive
      ? `<button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="openCockpit('${r.rentalId}')">Cockpit</button>`
      : `<button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="viewReceipt('${r.rentalId}')">Receipt</button>`;

    return `
      <tr>
        <td>
          <code style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-meter);" title="${r.rentalId}">
            #${r.rentalId.slice(-8)}
          </code>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <img src="${vImg}" alt="${vName}" style="width: 45px; height: 32px; border-radius: 0.25rem; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';">
            <div>
              <strong style="color: var(--text-primary); font-size: 0.85rem;">${vName}</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${vehicle ? (vehicle.vehicleType === 'CAR' ? 'Car' : 'Motorcycle') : ''}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 500; color: var(--text-primary); font-size: 0.85rem;">${uName}</span>
        </td>
        <td style="white-space: nowrap; font-size: 0.8rem;">${startDate}</td>
        <td style="white-space: nowrap; font-size: 0.8rem;">${endDate}</td>
        <td style="font-size: 0.85rem;">${durationText}</td>
        <td style="font-size: 0.85rem;">₹${r.hourlyRateAtBooking.toFixed(0)}/hr</td>
        <td>${statusBadge}</td>
        <td>
          <strong style="color: ${isActive ? 'var(--accent-amber)' : '#3fb950'}; font-family: var(--font-meter); font-size: 0.95rem;">
            ${amountText}
          </strong>
        </td>
        <td style="text-align: right;">${actionBtn}</td>
      </tr>
    `;
  }).join('');
}

function setupHistoryControls() {
  document.getElementById('history-search').addEventListener('input', renderHistoryTable);
  document.getElementById('status-filter').addEventListener('change', renderHistoryTable);
  document.getElementById('refresh-history-btn').addEventListener('click', async () => {
    showToast('Refreshing history...', 'info');
    await loadData();
  });
}

window.openCockpit = function(rentalId) {
  storage.setActiveRentalId(rentalId);
  window.location.href = `rental.html?id=${rentalId}`;
};

window.viewReceipt = function(rentalId) {
  const rental = allRentals.find(r => r.rentalId === rentalId);
  if (!rental) return;

  const vehicle = vehiclesMap.get(rental.vehicleId);
  const user = usersMap.get(rental.userId);
  const modal = document.getElementById('history-receipt-modal');
  const body = document.getElementById('history-modal-body');

  const startDate = new Date(rental.startTime).toLocaleString();
  const endDate = rental.endTime ? new Date(rental.endTime).toLocaleString() : 'Active';
  const vName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle';
  const uName = user ? user.name : 'Renter Account';

  body.innerHTML = `
    <div style="background: var(--bg-main); border: 1px solid var(--border-subtle); border-radius: 0.35rem; padding: 1.25rem; margin-bottom: 1.25rem;">
      <div style="display: flex; gap: 0.85rem; align-items: center; margin-bottom: 1rem; padding-bottom: 0.85rem; border-bottom: 1px solid var(--border-subtle);">
        ${vehicle && vehicle.imageUrl ? `<img src="${vehicle.imageUrl}" alt="${vName}" style="width: 75px; height: 50px; object-fit: cover; border-radius: 0.25rem;">` : ''}
        <div>
          <h3 style="font-size: 1.1rem; color: var(--text-primary);">${vName}</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">Renter: <strong>${uName}</strong></p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
        <span style="color: var(--text-muted);">Rental ID:</span>
        <code style="font-family: var(--font-meter); color: var(--text-primary);">${rental.rentalId}</code>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
        <span style="color: var(--text-muted);">Pickup Time:</span>
        <span style="color: var(--text-primary);">${startDate}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
        <span style="color: var(--text-muted);">Return Time:</span>
        <span style="color: var(--text-primary);">${endDate}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
        <span style="color: var(--text-muted);">Billed Duration:</span>
        <span style="color: var(--text-primary); font-weight: 600;">${rental.durationInMinutes || 1} min(s)</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.75rem;">
        <span style="color: var(--text-muted);">Hourly Rate:</span>
        <span style="color: var(--text-primary);">₹${rental.hourlyRateAtBooking.toFixed(2)} / hr (₹${(rental.hourlyRateAtBooking / 60).toFixed(2)}/min)</span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
        <span style="font-weight: 700; color: var(--text-primary);">Final Billed Amount:</span>
        <span style="font-family: var(--font-meter); font-size: 1.5rem; font-weight: 700; color: #3fb950;">
          ₹${(rental.finalAmount || 0).toFixed(2)}
        </span>
      </div>
    </div>

    <div style="text-align: right;">
      <button class="btn btn-secondary" onclick="document.getElementById('history-receipt-modal').classList.remove('open')">Close</button>
    </div>
  `;

  modal.classList.add('open');
};

function setupReceiptModal() {
  const modal = document.getElementById('history-receipt-modal');
  const closeBtn = document.getElementById('close-history-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
}
