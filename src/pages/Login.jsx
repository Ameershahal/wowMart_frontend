import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginService } from "../services/userService";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Client-side validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await loginService({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      if (res.data && res.data.token && res.data.user) {
        // Store user info in localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Navigate to home page
        navigate("/");
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle py-10 px-4 md:py-16">
      <div className="container mx-auto max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h2 className="font-display text-xl font-semibold text-slate-900">WowMart</h2>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-display-sm font-semibold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-600 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-medium mb-1.5 text-sm text-slate-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow text-sm bg-white"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block font-medium mb-1.5 text-sm text-slate-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow text-sm bg-white"
                disabled={loading}
              />
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Forgot password?</Link>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full" />Logging in…</> : 'Log in'}
            </button>
          </form>
          <div className="text-center mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-3">Don’t have an account?</p>
            <Link to="/signup" className="inline-block w-full btn-secondary py-3 text-center">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
