/**
 * RentWheels — Active Rental Odometer Cockpit Logic
 * Live ticking stopwatch + exact per-second cost calculation matching backend
 */

let activeRentalId = null;
let currentRentalData = null;
let timerInterval = null;
let syncInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');

  if (paramId) {
    activeRentalId = paramId;
    storage.setActiveRentalId(paramId);
  } else {
    activeRentalId = storage.getActiveRentalId();
  }

  setupManualRentalLoader();
  setupReturnButton();

  if (activeRentalId) {
    await initializeCockpit(activeRentalId);
  } else {
    showEmptyView();
  }
});

function showEmptyView() {
  document.getElementById('active-cockpit-view').style.display = 'none';
  document.getElementById('empty-cockpit-view').style.display = 'block';
  updateNavBadge();
}

function showActiveView() {
  document.getElementById('empty-cockpit-view').style.display = 'none';
  document.getElementById('active-cockpit-view').style.display = 'block';
  updateNavBadge();
}

async function initializeCockpit(rentalId) {
  try {
    currentRentalData = await api.getCurrentBill(rentalId);

    // If already completed, inform user and clear
    const rentalRecord = await api.getFinalBill(rentalId);
    if (rentalRecord.status === 'COMPLETED') {
      showToast('This rental has already been completed.', 'info');
      storage.clearActiveRentalId();
      showEmptyView();
      return;
    }

    showActiveView();
    renderRentalDetails(currentRentalData);
    startLiveTimer(currentRentalData.startTime, currentRentalData.hourlyRate);

    // Background sync with backend authoritative bill every 10 seconds
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(async () => {
      try {
        const syncData = await api.getCurrentBill(rentalId);
        if (syncData) {
          currentRentalData = syncData;
        }
      } catch (e) {
        console.warn('Sync failed:', e);
      }
    }, 10000);

  } catch (err) {
    console.error('Failed to load active rental:', err);
    showToast(err.message || 'Could not load rental record', 'error');
    storage.clearActiveRentalId();
    showEmptyView();
  }
}

function renderRentalDetails(data) {
  document.getElementById('cockpit-rental-id').textContent = `Rental ID: ${data.rentalId}`;
  document.getElementById('cockpit-renter-name').textContent = data.userName || 'Renter Account';

  const startDate = new Date(data.startTime);
  document.getElementById('cockpit-start-time').textContent = startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  document.getElementById('cockpit-rate-display').textContent = `₹${data.hourlyRate.toFixed(2)}/hr`;
  document.getElementById('cockpit-per-min').textContent = `₹${(data.hourlyRate / 60.0).toFixed(2)}/min`;

  document.getElementById('cockpit-vehicle-brand').textContent = data.vehicleBrand;
  document.getElementById('cockpit-vehicle-model').textContent = data.vehicleModel;
  document.getElementById('cockpit-vehicle-specs').textContent = `${data.vehicleType === 'CAR' ? 'Car' : 'Motorcycle'} • Standard Rate`;

  const imgEl = document.getElementById('cockpit-vehicle-img');
  if (imgEl && data.imageUrl) {
    imgEl.src = data.imageUrl;
  }
}

function startLiveTimer(startTimeStr, hourlyRate) {
  if (timerInterval) clearInterval(timerInterval);

  const timerEl = document.getElementById('cockpit-timer');
  const billEl = document.getElementById('cockpit-bill');
  const startMs = new Date(startTimeStr).getTime();

  function tick() {
    const nowMs = Date.now();
    const elapsedMs = Math.max(0, nowMs - startMs);
    const totalSeconds = Math.floor(elapsedMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');

    timerEl.textContent = formattedTime;

    // Exact per-second billing formula matching backend (minimum 60s floor)
    const activeSeconds = Math.max(60, totalSeconds);
    const liveBill = (activeSeconds / 3600.0) * hourlyRate;

    billEl.textContent = `₹${liveBill.toFixed(2)}`;
  }

  tick();
  timerInterval = setInterval(tick, 1000);
}

function setupReturnButton() {
  const returnBtn = document.getElementById('return-vehicle-btn');
  if (!returnBtn) return;

  returnBtn.addEventListener('click', async () => {
    if (!activeRentalId) return;

    const confirmReturn = confirm('Are you sure you want to return the vehicle and stop the meter?');
    if (!confirmReturn) return;

    returnBtn.disabled = true;
    returnBtn.innerHTML = '<span>Stopping Meter &amp; Calculating Bill...</span>';

    try {
      const finalRental = await api.returnVehicle(activeRentalId);

      if (timerInterval) clearInterval(timerInterval);
      if (syncInterval) clearInterval(syncInterval);

      storage.clearActiveRentalId();
      updateNavBadge();

      showReceiptModal(finalRental);
    } catch (err) {
      showToast(err.message || 'Failed to return vehicle', 'error');
      returnBtn.disabled = false;
      returnBtn.innerHTML = '<span>Return Vehicle &amp; Stop Meter</span>';
    }
  });
}

function showReceiptModal(rental) {
  const modal = document.getElementById('receipt-modal');
  document.getElementById('receipt-rental-id').textContent = rental.rentalId;
  document.getElementById('receipt-duration').textContent = `${rental.durationInMinutes || 1} min(s)`;
  document.getElementById('receipt-rate').textContent = `₹${rental.hourlyRateAtBooking.toFixed(2)} / hr`;
  document.getElementById('receipt-total').textContent = `₹${(rental.finalAmount || 0).toFixed(2)}`;

  modal.classList.add('open');
}

function setupManualRentalLoader() {
  const loadBtn = document.getElementById('load-manual-rental-btn');
  const input = document.getElementById('manual-rental-id');

  if (loadBtn && input) {
    loadBtn.addEventListener('click', () => {
      const id = input.value.trim();
      if (!id) {
        showToast('Please enter a valid Rental ID', 'info');
        return;
      }
      activeRentalId = id;
      storage.setActiveRentalId(id);
      initializeCockpit(id);
    });
  }
}
