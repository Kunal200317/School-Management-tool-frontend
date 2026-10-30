import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Shield, BookOpen, User, Mail, Lock, ArrowLeft, Loader2, Phone } from 'lucide-react';
import axios from 'axios';
import { API } from '../../api/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin'); // 'admin', 'teacher', 'student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset notifications when role changes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Build request payload dynamically depending on active role
      const payload = role === 'student'
        ? { mobileNumber: email.trim(), dob: password.trim() }
        : { email: email.trim(), password: password.trim() };

      // Connect to the Backend server
      const response = await axios.post(`${API}/api/auth/login/${role}`, payload, {
        withCredentials: true // Set cookie variables in browser
      });

      setSuccess(`Successfully signed in as ${role}!`);

      // Store user info and token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data));

      // Stagger navigate so user sees success state
      setTimeout(() => {
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'teacher') navigate('/teacher/dashboard');
        else navigate('/student/dashboard');
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Invalid credentials. Please verify your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FBFAF6]">

      {/* 1. Left Column (Navy Banner Panel) - 50% split with rich glowing light gradients */}
      <div
        className="relative hidden w-1/2 flex-col justify-between p-16 text-white lg:flex overflow-hidden"
        style={{ background: 'radial-gradient(circle at 70% 70%, #0c2652 0%, #040d1c 100%)' }}
      >

        {/* Soft multicolored light glows radiating in different parts of the panel */}
        <div className="absolute -left-20 -top-20 h-[380px] w-[380px] rounded-full bg-amber-500/15 blur-[85px] z-0"></div>
        <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-[#3b82f6]/10 blur-[75px] z-0"></div>
        <div className="absolute -right-20 -bottom-20 h-[450px] w-[450px] rounded-full bg-[#2563eb]/25 blur-[95px] z-0"></div>

        {/* Top Branding Logo block */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbc02d] text-[#0a1e3f] shadow-sm">
            <GraduationCap className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wide">Loyola EMS</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wider uppercase">Lalpania · Bokaro</span>
          </div>
        </div>

        {/* Central Welcoming Headers (using medium-bold elegant serif fonts) */}
        <div className="space-y-6 z-10 max-w-lg my-auto pt-10">
          <h1 className="font-serif text-[42px] font-semibold leading-[1.15] text-white tracking-tight">
            Welcome to <br />
            Loyola School ERP.
          </h1>
          <p className="text-slate-300 text-[15px] leading-relaxed font-sans font-light">
            A unified portal for administrators, teachers and students — modern, responsive, and beautifully organised.
          </p>
        </div>

        {/* Bottom copyright segment */}
        <div className="text-slate-400 text-xs font-light z-10">
          &copy; {new Date().getFullYear()} Loyola English Medium School
        </div>

      </div>

      {/* 2. Right Column (Credentials Form) - 50% split */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 bg-[#FBFAF6]">

        {/* Max width container for form elements */}
        <div className="w-full max-w-[430px] flex flex-col space-y-7 animate-fade-in-up">

          {/* Back to Home Button */}
          <Link
            to="/"
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to school site</span>
          </Link>

          {/* Heading block */}
          <div className="space-y-2">
            <h2 className="font-serif text-4xl font-semibold text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-slate-500 text-[14px]">Choose your role and enter your credentials.</p>
          </div>

          {/* Role selector Tabs pill-box */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#eef2f6]/90 p-1.5 border border-slate-100">
            {/* Admin Role Tab */}
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold transition-all ${role === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>

            {/* Teacher Role Tab */}
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold transition-all ${role === 'teacher'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Teacher</span>
            </button>

            {/* Student Role Tab */}
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold transition-all ${role === 'student'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Student</span>
            </button>
          </div>

          {/* Alert messages box */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-600 leading-relaxed animate-fade-in-down">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-600 leading-relaxed animate-fade-in-down">
              {success}
            </div>
          )}

          {/* Sign In Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Mobile Number Field wrapper */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">
                {role === 'student' ? 'Mobile Number' : 'Email'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  {role === 'student' ? (
                    <Phone className="h-4.5 w-4.5" />
                  ) : (
                    <Mail className="h-4.5 w-4.5" />
                  )}
                </div>
                <input
                  type={role === 'student' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. 9999911111' : 'name@loyola.school'}
                  className="block w-full rounded-2xl border border-slate-300 bg-white py-4.5 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-xs outline-hidden focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]"
                />
              </div>
            </div>

            {/* Password / DOB Field wrapper */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">
                {role === 'student' ? 'Date of Birth (YYYY-MM-DD)' : 'Password'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={role === 'student' ? 'YYYY-MM-DD' : '••••••••'}
                  className="block w-full rounded-2xl border border-slate-300 bg-white py-4.5 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-xs outline-hidden focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]"
                />
              </div>
            </div>

            {/* Sign-in Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-2xl bg-[#0a1e3f] py-4.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#122e5c] active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Bottom Demo accounts display card */}
          <div className="rounded-xl bg-[#f1f5f9] p-3 text-center border border-slate-100/40 text-[11px] font-medium text-slate-600">
            {role === 'admin' && (
              <span>
                <strong className="text-slate-800">Demo Admin:</strong> admin@loyola.school / loyola@2026
              </span>
            )}
            {role === 'teacher' && (
              <span>
                <strong className="text-slate-800">Demo Teacher:</strong> teacher@loyola.school / teacher@2026
              </span>
            )}
            {role === 'student' && (
              <span>
                <strong className="text-slate-800">Demo Student:</strong> student@loyola.school / student@2026
              </span>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
