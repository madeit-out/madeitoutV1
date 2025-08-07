import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../adapters/apiAdapter";
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Input validation and restrictions
    if (name === "username") {
      // Username validation - only allow alphanumeric and underscores, 3-20 characters
      const usernameRegex = /^[a-zA-Z0-9_]*$/;
      if (value === "" || usernameRegex.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value.toLowerCase().trim(),
        }));
      }
    } else if (name === "email") {
      // Email validation - only allow valid email characters
      const emailRegex = /^[a-zA-Z0-9@._-]*$/;
      if (value === "" || emailRegex.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value.toLowerCase().trim(),
        }));
      }
    } else if (name === "password") {
      // Password validation - allow alphanumeric and special characters
      const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      if (value === "" || passwordRegex.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Additional client-side validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    // Username validation
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }

    if (formData.username.length > 20) {
      setError("Username must be less than 20 characters long.");
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length > 128) {
      setError("Password must be less than 128 characters long.");
      setIsLoading(false);
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must contain at least one letter and one number.");
      setIsLoading(false);
      return;
    }

    try {
      await AuthAPI.signUp(formData);
      // Navigate to the dashboard after successful signup
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/20 text-black transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">
            Join Made It Out
          </h1>
          <p className="text-black/70 font-semibold">
            Start planning amazing group adventures
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black tracking-wide">
              <User className="w-4 h-4 inline mr-2 text-[#E08544]" />
              USERNAME
            </label>
            <div className="relative">
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm"
                placeholder="Choose a username"
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]{3,20}$"
                title="Username must be 3-20 characters long and contain only letters, numbers, and underscores"
                required
                autoComplete="username"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <User className="w-5 h-5 text-[#416B6B]/50" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-black tracking-wide">
              <Mail className="w-4 h-4 inline mr-2 text-[#416B6B]" />
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm"
                placeholder="Enter your email"
                maxLength={254}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                title="Please enter a valid email address"
                required
                autoComplete="email"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <Mail className="w-5 h-5 text-[#416B6B]/50" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-black tracking-wide">
              <Lock className="w-4 h-4 inline mr-2 text-[#E08544]" />
              PASSWORD
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm pr-12"
                placeholder="Create a secure password"
                minLength={8}
                maxLength={128}
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$"
                title="Password must be at least 8 characters long and contain letters and numbers"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#416B6B]/50 hover:text-[#416B6B] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-2xl">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 text-base font-semibold">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white text-lg font-bold uppercase py-5 px-6 rounded-2xl transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black/60 font-semibold">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            to="/signin"
            className="mt-6 inline-flex items-center text-[#416B6B] hover:text-[#E08544] font-bold transition-all duration-200 group no-underline"
          >
            Sign in here
            <svg
              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-black/50 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a
              href="/terms"
              className="text-[#416B6B] hover:text-[#E08544] transition-colors no-underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-[#416B6B] hover:text-[#E08544] transition-colors no-underline"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
