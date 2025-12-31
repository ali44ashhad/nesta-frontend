/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import { RootState } from "../store";
import { useToast } from "./ToastManager";
import NestaLogo from "../assets/NestaLogo.png";
import { colors } from "../config/colors";

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required("Please confirm your new password"),
});

type PasswordFormInputs = yup.InferType<typeof passwordSchema>;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const currentUser = AuthService.getCurrentUser();
  const { savedProjects } = useSelector((state: RootState) => state.project);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<PasswordFormInputs>({
    resolver: yupResolver(passwordSchema),
  });

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const handlePasswordSubmit = async (data: PasswordFormInputs) => {
    try {
      const response = await UserService.changePassword(
        data.currentPassword,
        data.newPassword
      );
      showToast(response.data.message, "success");
      setShowPasswordModal(false);
      reset();
    } catch (err: any) {
      const message = err?.response?.data?.message || "An error occurred.";
      setError("currentPassword", { type: "manual", message });
    }
  };

  return (
    <>
      <div
        className="min-h-screen p-4 sm:p-6 lg:p-8"
        style={{ backgroundColor: colors.veryDarkGray }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <img src={NestaLogo} alt="Nesta Logo" className="w-32 h-auto" />
          </div>
          <h1
            className="text-3xl font-bold text-center mb-8 capitalize"
            style={{ color: colors.lightGray, fontFamily: "TCM" }}
          >
            <span style={{ color: colors.limeGreen }}>{currentUser.username}</span>'s Profile
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Details Card */}
            <div
              className="p-6 rounded-xl shadow-lg"
              style={{ backgroundColor: colors.mediumDarkGray }}
            >
              <h2
                className="text-xl font-semibold mb-4 pb-2 border-b"
                style={{
                  color: colors.limeGreen,
                  borderColor: colors.darkerGray,
                  fontFamily: "Saiba",
                }}
              >
                User Details
              </h2>
              <div className="space-y-3" style={{ color: colors.lightGray }}>
                {/* <p>
                  <strong style={{ color: colors.limeGreen }}>ID:</strong>{" "}
                  <span style={{ fontFamily: "Cyberank" }}>{currentUser.id}</span>
                </p> */}
                <p>
                  <strong style={{ color: colors.limeGreen }}>Email:</strong>{" "}
                  {currentUser?.email}
                </p>
                {/* user role */}
                <p className="capitalize">
                  <strong style={{ color: colors.limeGreen }}>Roles:</strong>{" "}
                  {currentUser?.role}
                </p>
              </div>
            </div>

            {/* Project Stats Card */}
            <div
              className="p-6 rounded-xl shadow-lg"
              style={{ backgroundColor: colors.mediumDarkGray }}
            >
              <h2
                className="text-xl font-semibold mb-4 pb-2 border-b"
                style={{
                  color: colors.limeGreen,
                  borderColor: colors.darkerGray,
                  fontFamily: "Saiba",
                }}
              >
                Project Statistics
              </h2>
              <div className="space-y-3" style={{ color: colors.lightGray }}>
                <p>
                  <strong style={{ color: colors.limeGreen }}>Total Projects:</strong>{" "}
                  <span style={{ fontFamily: "Cyberank" }}>{savedProjects.length}</span>
                </p>
              </div>
            </div>

            {/* Security Card */}
            <div
              className="p-6 rounded-xl shadow-lg md:col-span-2"
              style={{ backgroundColor: colors.mediumDarkGray }}
            >
              <h2
                className="text-xl font-semibold mb-4 pb-2 border-b"
                style={{
                  color: colors.limeGreen,
                  borderColor: colors.darkerGray,
                  fontFamily: "Saiba",
                }}
              >
                Security
              </h2>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: colors.limeGreen,
                  color: colors.nearBlack,
                  fontFamily: "TCM",
                  fontWeight: "bold",
                }}
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/app")}
              className="px-6 py-2 rounded-md transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: colors.limeGreen,
                color: colors.nearBlack,
                fontFamily: "TCM",
                fontWeight: "bold",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <div
            className="rounded-xl shadow-xl p-6 w-full max-w-md"
            style={{ backgroundColor: colors.mediumDarkGray }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: colors.limeGreen, fontFamily: "Saiba" }}
            >
              Change Password
            </h2>
            <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <input
                  {...register("currentPassword")}
                  type="password"
                  placeholder="Current Password"
                  className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition"
                  style={{
                    backgroundColor: colors.darkerGray,
                    color: colors.lightGray,
                    borderColor: errors.currentPassword
                      ? colors.red
                      : colors.limeGreen,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.limeGreen;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.currentPassword
                      ? colors.red
                      : colors.limeGreen;
                  }}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm" style={{ color: colors.red }}>
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("newPassword")}
                  type="password"
                  placeholder="New Password"
                  className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition"
                  style={{
                    backgroundColor: colors.darkerGray,
                    color: colors.lightGray,
                    borderColor: errors.newPassword
                      ? colors.red
                      : colors.limeGreen,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.limeGreen;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.newPassword
                      ? colors.red
                      : colors.limeGreen;
                  }}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm" style={{ color: colors.red }}>
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition"
                  style={{
                    backgroundColor: colors.darkerGray,
                    color: colors.lightGray,
                    borderColor: errors.confirmPassword
                      ? colors.red
                      : colors.limeGreen,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.limeGreen;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.confirmPassword
                      ? colors.red
                      : colors.limeGreen;
                  }}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm" style={{ color: colors.red }}>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    reset();
                  }}
                  className="px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: colors.darkerGray,
                    color: colors.lightGray,
                    fontFamily: "Cyberank",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: colors.limeGreen,
                    color: colors.nearBlack,
                    fontFamily: "Cyberank",
                    fontWeight: "bold",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;