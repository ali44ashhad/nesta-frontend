import api from "./api"; // Use the new api instance

const API_URL = `/api/test/`;
const USER_API_URL = `/api/user/`;

class UserService {
  getPublicContent() {
    return api.get(API_URL + "all");
  }

  getUserBoard() {
    return api.get(API_URL + "user");
  }

  getModeratorBoard() {
    return api.get(API_URL + "mod");
  }

  getAdminBoard() {
    return api.get(API_URL + "admin");
  }

  changePassword(currentPassword: string, newPassword: string) {
    return api.post(USER_API_URL + "change-password", {
      currentPassword,
      newPassword,
    });
  }
}

export default new UserService();