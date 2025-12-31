import api from "./api";

const API_URL = "/api/analytics/";

class AnalyticsService {
  // Get all user statistics
  getAllUsers() {
    return api.get(API_URL + "users");
  }

  // Get user statistics summary
  getUserStats() {
    return api.get(API_URL + "users/stats");
  }

  // Get all projects
  getAllProjects() {
    return api.get(API_URL + "projects");
  }

  // Get project statistics
  getProjectStats() {
    return api.get(API_URL + "projects/stats");
  }

  // Get location analytics
  getLocationAnalytics() {
    return api.get(API_URL + "location");
  }

  // Get registration trends
  getRegistrationTrends(days: number = 30) {
    return api.get(API_URL + `registrations/trends?days=${days}`);
  }

  // Get user roles distribution
  getRolesDistribution() {
    return api.get(API_URL + "users/roles");
  }

  // Get active users
  getActiveUsers(days: number = 30) {
    return api.get(API_URL + `users/active?days=${days}`);
  }

  // Get dashboard overview
  getDashboardOverview() {
    return api.get(API_URL + "overview");
  }

  // Update user roles
  updateUserRoles(userId: string, roles: string[]) {
    return api.put(API_URL + `users/${userId}/roles`, { roles });
  }
}

export default new AnalyticsService();

