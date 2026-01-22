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

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  // Validation
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters");
    setLoading(false);
    return;
  }

  try {
   const res = await signupService({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });    
    if(res.status == 201){
      if(res.data){
     localStorage.setItem("token", res.data.token);
     localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      }
  
    }
  } catch (err) {
    setError(
      err.response?.data?.message || "Signup failed. Try again."
    );
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
              <label className="block font-bold mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-4 focus:ring-yellow-400/50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-4 focus:ring-yellow-400/50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-4 focus:ring-yellow-400/50"
              />
              <p className="text-sm text-gray-600 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-bold mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-xl border-2 border-black focus:ring-4 focus:ring-yellow-400/50"
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
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold border border-black hover:bg-yellow-500 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
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
