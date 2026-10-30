import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../api/api';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Calendar,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  BookOpen,
  Trophy,
  Wallet,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.user || parsed;
      } catch (e) { }
    }
    return null;
  });
  const [loading, setLoading] = useState(!student);
  const [animate, setAnimate] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studentDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('studentDarkMode', darkMode);
  }, [darkMode]);

  // Load student profile on mount
  useEffect(() => {
    fetchStudentProfile();
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get(`${API}/api/student/profile`, {
        withCredentials: true
      });
      setStudent(response.data.user);

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.user) parsed.user = response.data.user;
          else parsed.paidFee = response.data.user.paidFee;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) { }
      }
    } catch (err) {
      console.error('Failed to load student profile:', err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err.message);
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatRupee = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  // Mock Notices
  const notices = [
    { id: 1, title: 'Annual Sports Day', date: '2026-06-28', desc: 'Loyola School Annual Sports Day is scheduled for next Monday. All students must wear their white uniforms.' },
    { id: 2, title: 'Parent-Teacher Meeting', date: '2026-06-28', desc: 'First term Parent-Teacher Meeting will be held from 9:00 AM to 12:30 PM. Parents must collect report cards.' }
  ];

  if (loading && !student) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FBFAF6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0a1e3f] border-t-transparent"></div>
          <span className="text-sm font-bold text-[#0a1e3f]">Loading Student Portal...</span>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#FBFAF6] text-slate-800'} font-sans`}>

      {/* 1. LEFT SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="space-y-6">
          {/* Brand logo */}
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbc02d] text-[#0a1e3f] shadow-xs">
                <GraduationCap className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-md font-bold tracking-wide leading-none">Loyola EMS</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">Student Portal</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
              { name: 'My Profile', icon: User, path: '/student/profile' },
              { name: 'Attendance', icon: Calendar, path: '/student/attendance' },
              { name: 'Fees & Payments', icon: CreditCard, path: '/student/fees' },
              { name: 'Notices', icon: Bell, path: '/student/notices' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = item.path === '/student/dashboard';
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${isActive
                      ? 'bg-[#fbc02d] text-[#0a1e3f] font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{student.name}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">LEMS-{student.admissionId}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Sidebar background overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        ></div>
      )}

      {/* 2. MAIN VIEW CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Navbar */}
        <header className={`flex h-16 items-center justify-between border-b ${darkMode ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-300 bg-white'} px-6 lg:px-8 shrink-0`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-serif text-2xl font-bold">Student Portal</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification trigger */}
            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>
            {/* User status capsule pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#eef2f6] px-4 py-2 border border-slate-200/20">
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700">{student?.name}</span>
            </div>
          </div>
        </header>

        {/* Body Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-6">

          {/* Welcome Banner card */}
          <div className={`bg-[#203a5e] text-white p-6 rounded-3xl relative overflow-hidden flex items-center justify-between shadow-md transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white font-serif text-3xl font-bold shadow-inner">
                {student.name ? student.name[0] : 'S'}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">Welcome back,</span>
                <h2 className="text-3xl font-bold font-serif leading-tight">{student.name}</h2>
                <p className="text-xs font-semibold text-slate-200 mt-1">
                  Admission No: {student.admissionId} · Roll {student.rollNo}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 delay-75 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>

            {/* Class */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'} shadow-xs flex items-center justify-between`}>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</span>
                <span className="block text-xl font-bold font-serif mt-2">{student.class}-{student.section}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            {/* Attendance */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'} shadow-xs flex items-center justify-between`}>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance %</span>
                <span className="block text-xl font-bold font-serif mt-2">0%</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            {/* Paid */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'} shadow-xs flex items-center justify-between`}>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid</span>
                <span className="block text-xl font-bold font-serif mt-2 text-emerald-600">{formatRupee(student.paidFee)}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
            </div>

            {/* Due */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'} shadow-xs flex items-center justify-between`}>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due</span>
                <span className="block text-xl font-bold font-serif mt-2 text-rose-600">{formatRupee(student.dueFee)}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>

          </div>

          {/* Quick Actions & Notices panel row */}
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch transition-all duration-500 delay-150 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>

            {/* Quick Actions Panel */}
            <div className={`lg:col-span-8 rounded-3xl border p-6 flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
              <h3 className="text-xl font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>Quick Actions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                {/* Pay Fees */}
                <button
                  onClick={() => navigate('/student/fees')}
                  className={`rounded-2xl p-5 border text-left transition-all ${darkMode
                      ? 'bg-slate-900/30 border-slate-700 hover:bg-slate-900/60'
                      : 'bg-white border-slate-200/60 hover:bg-slate-50/50 hover:shadow-xs hover:cursor-pointer'
                    }`}
                >
                  <div className="space-y-1">
                    <span className="block text-md font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>Pay School Fees</span>
                    <span className="block text-xs text-slate-400 font-semibold">UPI, Card, Net Banking or Wallet</span>
                  </div>
                </button>

                {/* Attendance */}
                <button
                  onClick={() => navigate('/student/attendance')}
                  className={`rounded-2xl p-5 border text-left transition-all ${darkMode
                      ? 'bg-slate-900/30 border-slate-700 hover:bg-slate-900/60'
                      : 'bg-white border-slate-200/60 hover:bg-slate-50/50 hover:shadow-xs hover:cursor-pointer'
                    }`}
                >
                  <div className="space-y-1">
                    <span className="block text-md font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>View Attendance</span>
                    <span className="block text-xs text-slate-400 font-semibold">Monthly and yearly summary</span>
                  </div>
                </button>

                {/* My Profile */}
                <button
                  onClick={() => navigate('/student/profile')}
                  className={`rounded-2xl p-5 border text-left transition-all ${darkMode
                      ? 'bg-slate-900/30 border-slate-700 hover:bg-slate-900/60'
                      : 'bg-white border-slate-200/60 hover:bg-slate-50/50 hover:shadow-xs hover:cursor-pointer'
                    }`}
                >
                  <div className="space-y-1">
                    <span className="block text-md font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>My Profile</span>
                    <span className="block text-xs text-slate-400 font-semibold">Personal details on record</span>
                  </div>
                </button>

                {/* Notices */}
                <button
                  onClick={() => navigate('/student/notices')}
                  className={`rounded-2xl p-5 border text-left transition-all ${darkMode
                      ? 'bg-slate-900/30 border-slate-700 hover:bg-slate-900/60'
                      : 'bg-white border-slate-200/60 hover:bg-slate-50/50 hover:shadow-xs hover:cursor-pointer'
                    }`}
                >
                  <div className="space-y-1">
                    <span className="block text-md font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>School Notices</span>
                    <span className="block text-xs text-slate-400 font-semibold">{notices.length} recent</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Latest Notices side list */}
            <div className={`lg:col-span-4 rounded-3xl border p-6 flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
              <h3 className="text-xl font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>Latest Notices</h3>

              <div className="space-y-3 mt-6 flex-1 flex flex-col justify-start">
                {notices.slice(0, 2).map(notice => (
                  <div
                    key={notice.id}
                    className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/30 border-slate-700' : 'bg-white border-slate-200/60'
                      } space-y-1`}
                  >
                    <h4 className="font-bold text-sm text-[#0a1e3f] dark:text-white leading-snug" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>{notice.title}</h4>
                    <span className="block text-[11px] text-slate-400 font-semibold">{notice.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
