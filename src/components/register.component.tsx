/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import NestaLogo from "../assets/NestaLogo.png"; // Update path if needed
import { colors } from "../config/colors";
import { useToast } from "./ToastManager";

type FormData = {
  username: string;
  email: string;
  password: string;
  role: "student" | "parent" | "teacher";
  dateOfBirth?: string | null;
  parentEmail?: string | null;
  parentConsent?: boolean | null;
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string | null | undefined): number | null => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to get max date (150 years ago) and min date (3 years ago)
const getMaxDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 3);
  return date.toISOString().split('T')[0];
};

const getMinDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 150);
  return date.toISOString().split('T')[0];
};

const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .matches(/^\S+$/, "Username cannot contain spaces")
    .test("no-trailing-space", "Username cannot have trailing spaces", (value) => {
      return value ? value.trim() === value : true;
    }),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(40, "Password must be at most 40 characters"),
  role: yup
    .string()
    .oneOf(["student", "parent", "teacher"], "Please select a valid role")
    .required("Role is required"),
  dateOfBirth: yup
    .string()
    .nullable()
    .when("role", {
      is: "student",
      then: (schema) => schema
        .required("Date of birth is required for students")
        .test("valid-age", "Age must be between 3 and 150 years", function (value) {
          if (!value) return false;
          const age = calculateAge(value);
          if (age === null) return false;
          return age >= 3 && age <= 150;
        })
        .test("min-age", "You must be at least 3 years old", function (value) {
          if (!value) return false;
          const age = calculateAge(value);
          if (age === null) return false;
          return age >= 3;
        })
        .test("max-age", "Age cannot exceed 150 years", function (value) {
          if (!value) return false;
          const age = calculateAge(value);
          if (age === null) return false;
          return age <= 150;
        }),
      otherwise: (schema) => schema.notRequired(),
    }),
  parentEmail: yup
    .string()
    .nullable()
    .when(["role", "dateOfBirth"], {
      is: (role: string, dateOfBirth: string) => {
        if (role !== "student" || !dateOfBirth) return false;
        const age = calculateAge(dateOfBirth);
        return age !== null && age < 18;
      },
      then: (schema) => schema
        .required("Parent email is required for users under 18")
        .email("Invalid parent email format"),
      otherwise: (schema) => schema.notRequired(),
    }),
  parentConsent: yup
    .boolean()
    .nullable()
    .when(["role", "dateOfBirth"], {
      is: (role: string, dateOfBirth: string) => {
        if (role !== "student" || !dateOfBirth) return false;
        const age = calculateAge(dateOfBirth);
        return age !== null && age < 18;
      },
      then: (schema) => schema
        .required("Parent consent is required for users under 18")
        .oneOf([true], "You must obtain parent consent to register"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      role: undefined as any,
      dateOfBirth: undefined,
      parentEmail: undefined,
      parentConsent: false,
    },
  });

  const selectedRole = watch("role");
  const dateOfBirth = watch("dateOfBirth");
  const calculatedAge = calculateAge(dateOfBirth);
  const isUnder18 = calculatedAge !== null && calculatedAge < 18;
  const isStudent = selectedRole === "student";

  const onSubmit = async (data: FormData) => {
    try {
      // Calculate age from date of birth
      const age = calculateAge(data.dateOfBirth);
      
      // Only include parent-related fields if user is a student under 18
      const isStudentUnder18 = data.role === "student" && age !== null && age < 18;
      
      await AuthService.register(
        data.username,
        data.email,
        data.password,
        data.role,
        age ?? undefined,
        data.dateOfBirth ?? undefined,
        isStudentUnder18 ? (data.parentEmail ?? undefined) : undefined,
        isStudentUnder18 ? (data.parentConsent ?? undefined) : undefined
      );
      // showToast("Registration successful", "success");
      navigate("/app");
    } catch (error: any) {
      const errorData = error.response?.data;
      
      // Handle field-specific errors (array format: {errors: [{field, message}]})
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        let hasFieldErrors = false;
        errorData.errors.forEach((err: { field?: string; message?: string }) => {
          if (err.field && err.message) {
            const fieldName = err.field as keyof FormData;
            setError(fieldName, { type: "manual", message: err.message });
            hasFieldErrors = true;
          }
        });
        
        if (hasFieldErrors) {
          showToast("Error!", "error");
        } else {
          const generalMessage = errorData.message || error.message || "Registration failed";
          showToast(generalMessage, "error");
        }
      } 
      // Handle single field error (format: {field: "password", message: "..."})
      else if (errorData?.field && errorData?.message) {
        const fieldName = errorData.field as keyof FormData;
        setError(fieldName, { type: "manual", message: errorData.message });
        showToast(errorData.message, "error");
      } 
      // Handle general error message
      else {
        const resMessage = errorData?.message || error.message || "Registration failed";
        showToast(resMessage, "error");
      }
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
            Register for Nesta Toys
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.lightGray }}
            >
              I am a <span style={{ color: colors.red }}>*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["student", "parent", "teacher"] as const).map((role) => (
                <label
                  key={role}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition ${
                    selectedRole === role ? "ring-2" : ""
                  }`}
                  style={{
                    backgroundColor: selectedRole === role ? colors.limeGreen : colors.darkerGray,
                    color: colors.lightGray,
                    borderColor: selectedRole === role ? colors.limeGreen : colors.limeGreen,
                  }}
                >
                  <input
                    {...register("role")}
                    type="radio"
                    value={role}
                    className="sr-only"
                  />
                  <span className="capitalize">{role}</span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm" style={{ color: colors.red }}>
                {errors.role.message}
              </p>
            )}
          </div>
{/* username field */}
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
              type="text"
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
              id="username"
            />
            {errors.username && (
              <p className="mt-1 text-sm" style={{ color: colors.red }}>
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium"
              style={{ color: colors.lightGray }}
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition"
              style={{
                backgroundColor: colors.darkerGray,
                color: colors.lightGray,
                borderColor: errors.email
                  ? colors.red
                  : colors.limeGreen,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.limeGreen;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email
                  ? colors.red
                  : colors.limeGreen;
              }}
              id="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm" style={{ color: colors.red }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Date of Birth Field - Only for Students */}
          {isStudent && (
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium"
                style={{ color: colors.lightGray }}
              >
                Date of Birth <span style={{ color: colors.red }}>*</span>
              </label>
              <input
                {...register("dateOfBirth")}
                type="date"
                min={getMinDate()}
                max={getMaxDate()}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition"
                style={{
                  backgroundColor: colors.darkerGray,
                  color: colors.lightGray,
                  borderColor: errors.dateOfBirth
                    ? colors.red
                    : colors.limeGreen,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.limeGreen;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.dateOfBirth
                    ? colors.red
                    : colors.limeGreen;
                }}
                id="dateOfBirth"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm" style={{ color: colors.red }}>
                  {errors.dateOfBirth.message}
                </p>
              )}
              {calculatedAge !== null && !errors.dateOfBirth && (
                <p className="mt-1 text-xs" style={{ color: colors.darkGray }}>
                  Age: {calculatedAge} years old
                </p>
              )}
            </div>
          )}

          {/* Parent Email - Only for Students Under 18 */}
          {isStudent && isUnder18 && (
            <div>
              <label
                htmlFor="parentEmail"
                className="block text-sm font-medium"
                style={{ color: colors.lightGray }}
              >
                Parent/Guardian Email <span style={{ color: colors.red }}>*</span>
              </label>
              <input
                {...register("parentEmail")}
                type="email"
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition"
                style={{
                  backgroundColor: colors.darkerGray,
                  color: colors.lightGray,
                  borderColor: errors.parentEmail
                    ? colors.red
                    : colors.limeGreen,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.limeGreen;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.parentEmail
                    ? colors.red
                    : colors.limeGreen;
                }}
                id="parentEmail"
                placeholder="parent@example.com"
              />
              {errors.parentEmail && (
                <p className="mt-1 text-sm" style={{ color: colors.red }}>
                  {errors.parentEmail.message}
                </p>
              )}
              <p className="mt-1 text-xs" style={{ color: colors.darkGray }}>
                Required for users under 18 years old
              </p>
            </div>
          )}

         

        

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
              type="password"
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
              id="password"
            />
            {errors.password && (
              <p className="mt-1 text-sm" style={{ color: colors.red }}>
                {errors.password.message}
              </p>
            )}
          </div>

           {/* Parent Consent Checkbox - Only for Students Under 18 */}
           {isStudent && isUnder18 && (
            <div className="flex items-start">
              <input
                {...register("parentConsent")}
                type="checkbox"
                id="parentConsent"
                className="mt-1 mr-2 w-4 h-4"
                style={{
                  accentColor: colors.limeGreen,
                }}
              />
              <label
                htmlFor="parentConsent"
                className="text-sm"
                style={{ color: colors.lightGray }}
              >
                I confirm that I have obtained parental/guardian consent to use this platform{" "}
                <span style={{ color: colors.red }}>*</span>
              </label>
            </div>
          )}
          {errors.parentConsent && (
            <p className="mt-1 text-sm" style={{ color: colors.red }}>
              {errors.parentConsent.message}
            </p>
          )}

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
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm" style={{ color: colors.lightGray }}>
            Already have an account?
          </span>
          <button
            onClick={() => navigate("/login")}
            className="ml-2 hover:underline font-medium transition"
            style={{ color: colors.lightGray }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.darkGray;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.lightGray;
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;