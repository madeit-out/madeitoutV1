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
      if (passwordRegex.test(value) || value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: value.trim(),
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { email, password } = formData;
    
    // Frontend validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await AuthAPI.signIn(formData);
      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
        // Force a page reload to ensure UserContext initializes with the new token
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 p-6 font-['Inter']">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-10">

        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
            <h1 className="text-4xl font-black text-black tracking-tight leading-tight">
              Welcome Back
            </h1>
            <div className="w-2 h-10 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full ml-4"></div>
          </div>
          <p className="text-lg text-black/70 font-semibold max-w-xs mx-auto">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 tracking-wide mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold placeholder:text-gray-400"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 tracking-wide mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold placeholder:text-gray-400"
                placeholder="Enter your password"
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-semibold text-center mt-4">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative overflow-hidden w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white mr-3"></div>
                <span>Signing In…</span>
              </div>
            ) : (
              <span className="relative z-10 flex items-center justify-center">
                <LogIn className="w-6 h-6 mr-2" />
                Sign In
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black/60 font-semibold">
                Don't have an account?
              </span>
            </div>
          </div>

          <Link
            to="/signup"
            className="mt-6 inline-flex items-center text-[#416B6B] hover:text-[#E08544] font-bold transition-all duration-200 group no-underline"
          >
            Sign up here
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
            By signing in, you agree to our{" "}
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

export default SignIn;