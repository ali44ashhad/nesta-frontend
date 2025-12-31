/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api"; // Use the new api instance

const API_URL = "/api/auth/";

// Helper function to get location data from localStorage
const getLocationData = (): { 
  latitude: number; 
  longitude: number; 
  country: string | null; 
  city: string | null;
} | null => {
  try {
    const locationData = localStorage.getItem("locationData");
    if (locationData) {
      const data = JSON.parse(locationData);
      // Check if data is less than 24 hours old
      const hoursSinceUpdate = (Date.now() - data.timestamp) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 24 && data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.country || null,
          city: data.city || null,
        };
      }
    }
  } catch {
    // Invalid data or error reading
  }
  return null;
};

class AuthService {
  isAuthenticated = false;
  user: any = null;

  async login(username: string, password: string) {
    const location = getLocationData();
    const response = await api.post(API_URL + "signin", {
      username,
      password,
      country: location?.country ?? null,
      city: location?.city ?? null,
    });
    if (response.data) {
      this.isAuthenticated = true;
      this.user = response.data;
    }
    return response.data;
  }

  logout() {
    this.isAuthenticated = false;
    this.user = null;
    return api.post(API_URL + "signout"); // This clears the backend cookie
  }

  async register(
    username: string,
    email: string,
    password: string,
    role?: "student" | "parent" | "teacher",
    age?: number,
    dateOfBirth?: string,
    parentEmail?: string,
    parentConsent?: boolean
  ) {
    const location = getLocationData();
    const response = await api.post(API_URL + "signup", {
      username,
      email,
      password,
      role,
      age,
      dateOfBirth,
      parentEmail,
      parentConsent,
      country: location?.country ?? null,
      city: location?.city ?? null,
    });
    if (response.data) {
      this.isAuthenticated = true;
      this.user = response.data;
    }
    return response.data;
  }

  getCurrentUser() {
    return this.user;
  }

  async checkAuth() {
    try {
      const response = await api.get(API_URL + "check");
      if (response.data.isAuthenticated) {
        this.isAuthenticated = true;
        this.user = response.data.user;
      } else {
        this.isAuthenticated = false;
        this.user = null;
      }
    } catch (error) {
      this.isAuthenticated = false;
      this.user = null;
    }
    return this.isAuthenticated;
  }
}

export default new AuthService();