/* eslint-disable @typescript-eslint/no-explicit-any */

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { fetchProjects } from "../store/projectSlice";
import NestaLogo from "../assets/NestaLogo.png"; // Update path if needed
import { colors } from "../config/colors";
import { useToast } from "./ToastManager";

const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .matches(/^\S+$/, "Username cannot contain spaces")
    .test("no-trailing-space", "Username cannot have trailing spaces", (value) => {
      return value ? value.trim() === value : true;
    }),
  password: yup.string().required("Password is required"),
});

type LoginFormInputs = {
  username: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await AuthService.login(data.username, data.password);
      // Fetch projects after successful login
      dispatch(fetchProjects());
      navigate("/app");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Login failed";
      setError("username", { type: "manual", message });
        showToast(message, "error");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: colors.veryDarkGray }}
    >
      <div
        className="shadow-md rounded-xl px-8 pt-6 pb-8 w-full max-w-md"
        style={{ backgroundColor: colors.mediumDarkGray }}
      >
        <div className="flex flex-col items-center mb-6">
          <img src={NestaLogo} alt="Nesta Logo" className="w-32 mb-2" />
          <h2
            className="text-2xl font-semibold"
            style={{ color: colors.lightGray }}
          >
           Think. Tinker. Run. 
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium"
              style={{ color: colors.lightGray }}
            >
              Username
            </label>
            <input
              {...register("username")}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition"
              style={{
                backgroundColor: colors.darkerGray,
                color: colors.lightGray,
                borderColor: errors.username
                  ? colors.red
                  : colors.limeGreen,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.limeGreen;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.username
                  ? colors.red
                  : colors.limeGreen;
              }}
              type="text"
              name="username"
              autoComplete="username"
            />
            {errors.username && (
              <p className="mt-1 text-sm" style={{ color: colors.red }}>
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: colors.lightGray }}
            >
              Password
            </label>
            <input
              {...register("password")}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition"
              style={{
                backgroundColor: colors.darkerGray,
                color: colors.lightGray,
                borderColor: errors.password
                  ? colors.red
                  : colors.limeGreen,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.limeGreen;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.password
                  ? colors.red
                  : colors.limeGreen;
              }}
              type="password"
              name="password"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm" style={{ color: colors.red }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-4 py-2 rounded-md focus:outline-none transition"
              style={{
                backgroundColor: colors.red,
                color: colors.lightGray,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#c01f1f";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = colors.red;
                }
              }}
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              Login
            </button>
          </div>
        </form>

        {/* Register Redirect Button */}
        <div className="mt-4 text-center">
          <span className="text-sm" style={{ color: colors.lightGray }}>
            Don't have an account?
          </span>
          <button
            onClick={() => navigate("/register")}
            className="ml-2 hover:underline font-medium transition"
            style={{ color: colors.lightGray }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.darkGray;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.lightGray;
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}