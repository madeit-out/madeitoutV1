import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../adapters/apiAdapter";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Input validation and restrictions
    if (name === "email") {
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
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
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

    // Password length validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await AuthAPI.signIn(formData);
      localStorage.setItem("token", res.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 p-6">
      {/* Enhanced Form Card with glassmorphism effect */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/20 text-black transform transition-all duration-300 hover:shadow-3xl">
        {/* Enhanced Header Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-black/70 font-semibold">
            Sign in to continue your journey
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Enhanced Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black tracking-wide">
              <Mail className="w-4 h-4 inline mr-2 text-[#E08544]" />
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
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

          {/* Enhanced Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black tracking-wide">
              <Lock className="w-4 h-4 inline mr-2 text-[#416B6B]" />
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm pr-12"
                placeholder="Enter your password"
                minLength={6}
                maxLength={128}
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$"
                title="Password must be at least 6 characters long and contain letters and numbers"
                required
                autoComplete="current-password"
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

          {/* Enhanced Error Display */}
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

          {/* Enhanced Submit Button */}
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
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </form>

        {/* Enhanced Footer */}
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black/60 font-semibold">
                New to Made It Out?
              </span>
            </div>
          </div>

          <Link
            to="/signup"
            className="mt-6 inline-flex items-center text-[#416B6B] hover:text-[#E08544] font-bold transition-all duration-200 group no-underline"
          >
            Create your account
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
      </div>
    </div>
  );
}

export default SignIn;
