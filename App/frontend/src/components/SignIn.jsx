import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../adapters/apiAdapter";
import { Mail, Lock, Eye, EyeOff, LogIn, Chrome } from "lucide-react";

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
    try {
      const res = await AuthAPI.signIn(formData);
      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Google Sign-In button is commented out */}
      {/*
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
        onClick={() => console.log("Google Sign-In clicked")}
      >
        <Chrome className="inline-block mr-2" />
        Sign in with Google
      </button>
      */}

      <Link to="/signup">Don't have an account? Sign up</Link>
    </div>
  );
}

export default SignIn;