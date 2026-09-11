/**
 * RentWheels — Centralized API Client Module
 * Communicates with Spring Boot REST backend on http://localhost:8080/api
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.RENTWHEELS_API_URL)
  ? window.RENTWHEELS_API_URL
  : (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1'))
    ? 'http://localhost:8080/api'
    : '/api';

const api = {
  // --- Vehicles ---
  async getVehicles() {
    return this.fetchJson(`${API_BASE_URL}/vehicles`);
  },

  async getAvailableVehicles() {
    return this.fetchJson(`${API_BASE_URL}/vehicles/available`);
  },

  async getVehicleById(id) {
    return this.fetchJson(`${API_BASE_URL}/vehicles/${id}`);
  },

  async addVehicle(vehicleData) {
    return this.fetchJson(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },

  async updateVehicle(id, vehicleData) {
    return this.fetchJson(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    });
  },

  async deleteVehicle(id) {
    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete vehicle');
    }
    return true;
  },

  // --- Users ---
  async getUsers() {
    return this.fetchJson(`${API_BASE_URL}/users`);
  },

  async getUserById(id) {
    return this.fetchJson(`${API_BASE_URL}/users/${id}`);
  },

  async registerUser(userData) {
    return this.fetchJson(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // --- Rentals ---
  async rentVehicle(userId, vehicleId) {
    return this.fetchJson(`${API_BASE_URL}/rentals`, {
      method: 'POST',
      body: JSON.stringify({ userId, vehicleId })
    });
  },

  async returnVehicle(rentalId) {
    return this.fetchJson(`${API_BASE_URL}/rentals/${rentalId}/return`, {
      method: 'POST'
    });
  },

  async getCurrentBill(rentalId) {
    return this.fetchJson(`${API_BASE_URL}/rentals/${rentalId}/current-bill`);
  },

  async getFinalBill(rentalId) {
    return this.fetchJson(`${API_BASE_URL}/rentals/${rentalId}/bill`);
  },

  async getAllRentals() {
    return this.fetchJson(`${API_BASE_URL}/rentals`);
  },

  async getUserRentals(userId) {
    return this.fetchJson(`${API_BASE_URL}/users/${userId}/rentals`);
  },

  async getVehicleRentals(vehicleId) {
    return this.fetchJson(`${API_BASE_URL}/vehicles/${vehicleId}/rentals`);
  },

  // --- Core Fetch Helper ---
  async fetchJson(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data && data.message ? data.message : `HTTP Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  }
};

// --- Active Rental & User Session Storage ---
const storage = {
  getActiveRentalId() {
    return localStorage.getItem('rentwheels_active_rental');
  },
  setActiveRentalId(id) {
    localStorage.setItem('rentwheels_active_rental', id);
  },
  clearActiveRentalId() {
    localStorage.removeItem('rentwheels_active_rental');
  },

  getSelectedUserId() {
    return localStorage.getItem('rentwheels_selected_user');
  },
  setSelectedUserId(id) {
    localStorage.setItem('rentwheels_selected_user', id);
  }
};

// --- Toast Alert Helper ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <span style="font-weight: 700; font-size: 1.1rem;">${icon}</span>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global Nav active badge updater
function updateNavBadge() {
  const activeRentalId = storage.getActiveRentalId();
  const badge = document.getElementById('nav-active-rental-badge');
  if (badge) {
    if (activeRentalId) {
      badge.style.display = 'inline-block';
      badge.textContent = 'Active Trip';
    } else {
      badge.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', updateNavBadge);
