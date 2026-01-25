import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupService } from "../services/userService";

function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    if (formData.fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await signupService({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      if (res.status === 201 && res.data) {
        if (res.data.token && res.data.user) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/");
        } else {
          setError("Account created but login failed. Please try logging in.");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-black mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join WowMart and start shopping
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block font-bold mb-2 text-black">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-bold mb-2 text-black">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block font-bold mb-2 text-black">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Create a strong password"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all"
                disabled={loading}
              />
              <p className="text-sm text-gray-600 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block font-bold mb-2 text-black">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all"
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold border border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-2">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-block bg-black text-yellow-400 px-4 py-2 rounded-lg font-semibold border"
            >
              Login Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
