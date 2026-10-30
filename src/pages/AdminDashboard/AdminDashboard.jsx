import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  Megaphone,
  Sun,
  FileText,
  Settings,
  LogOut,
  Bell,
  Moon,
  TrendingUp,
  IndianRupee,
  AlertCircle,
  Globe,
  LayoutDashboard,
  CheckCircle,
  Menu,
  X,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  History,
  ArrowRight,
  Archive
} from 'lucide-react';
import axios from 'axios';
import { API } from '../../api/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

  // Dashboard overall statistics
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAttendance: '0/0',
    totalPaid: 0,
    totalDue: 0,
    todayCollection: 0,
    monthlyCollection: 0,
    cashCollection: 0,
    onlineCollection: 0,
    classSummary: []
  });
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const p = JSON.parse(raw);
        return p.name || 'Principal';
      }
    } catch (e) {}
    return 'Principal';
  });
  const [adminEmail, setAdminEmail] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const p = JSON.parse(raw);
        return p.email || 'admin@loyola.school';
      }
    } catch (e) {}
    return 'admin@loyola.school';
  });
  const [animate, setAnimate] = useState(false);

  // Load user details & fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/api/admin/dashboard-stats`, {
          withCredentials: true
        });
        setStats(response.data);
      } catch (err) {
        console.warn('Backend connection failed, keeping zero indicators.', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Trigger page load animation
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed', err);
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Teachers', icon: Users, path: '/admin/teachers' },
    { name: 'Attendance', icon: Calendar, path: null },
    { name: 'Fees', icon: CreditCard, path: null },
    { name: 'Fee Structure', icon: IndianRupee, path: '/admin/fee-structure' },
    { name: 'Daily Collection', icon: FileText, path: null },
    { name: 'Sessions', icon: Calendar, path: '/admin/sessions' },
    { name: 'Promotion', icon: ArrowRight, path: '/admin/promotion' },
    { name: 'Archived', icon: Archive, path: '/admin/archive' },
    { name: 'Notices', icon: Megaphone, path: null },
    { name: 'Holidays', icon: Calendar, path: '/admin/holidays' },
    { name: 'Reports', icon: FileText, path: null },
    { name: 'Audit Logs', icon: History, path: null },
    { name: 'Admins', icon: ShieldCheck, path: '/admin/admins' },
    { name: 'Settings', icon: Settings, path: null }
  ];

  // Helper to format rupees nicely (e.g. ₹67,500)
  const formatRupee = (value) => {
    if (value === null || value === undefined) return '₹-';
    if (value === 0 || value === '0') return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const isOffline = stats.totalStudents === 0 && loading;

  // Calculate dynamic cash vs online percentage split for the donut ring
  const cashVal = stats.cashCollection || 0;
  const onlineVal = stats.onlineCollection || 0;
  const totalCol = cashVal + onlineVal;

  let onlinePct = 0;
  let cashPct = 0;

  if (totalCol > 0) {
    onlinePct = Math.round((onlineVal / totalCol) * 100);
    cashPct = 100 - onlinePct;
  } else {
    onlinePct = 0;
    cashPct = 0;
  }

  const circumference = 351.85;
  // Each segment: dashoffset = circumference - (pct% of circumference) → shows that % filled
  const cashDash = totalCol > 0 ? (circumference * cashPct) / 100 : 0;
  const onlineDash = totalCol > 0 ? (circumference * onlinePct) / 100 : 0;
  // Online segment rotates to start exactly where Cash ends
  const onlineRotation = cashPct * 3.6; // 3.6 degrees per 1%

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#FBFAF6] text-slate-900'}`}>

      {/* 1. SIDEBAR (Left Panel) - Fixed on desktop, sliding drawer on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >

        {/* Top Branding Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbc02d] text-[#0a1e3f] shadow-xs">
                <GraduationCap className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-md font-bold tracking-wide leading-none">Loyola EMS</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">Admin Panel</span>
              </div>
            </div>
            {/* Mobile close menu trigger */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links Scroll Box */}
          <nav className="h-[calc(100vh-250px)] overflow-y-auto px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    } else {
                      setActiveTab(item.name);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive
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

        {/* Sidebar Footer (Principal Info + Logout) */}
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{adminName}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">{adminEmail}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Sign out</span>
          </button>
        </div>

      </div>

      {/* Overlay background when drawer sidebar is active on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        ></div>
      )}

      {/* 2. MAIN LAYOUT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Controls bar */}
        <header className={`flex items-center justify-between border-b transition-colors duration-500 px-6 py-3.5 lg:px-8 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center gap-4">
            {/* Hamburger menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`rounded-lg p-2 lg:hidden cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{activeTab}</h2>
          </div>

          {/* Quick Info & Controls */}
          <div className="flex items-center gap-5">
            <button className={`relative rounded-full p-2 transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User status capsule pill */}
            <div className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#eef2f6] border-slate-200/20 text-slate-700'}`}>
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold">{adminEmail}</span>
            </div>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-8">
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              {/* Welcome greeting card */}
              <div className={`space-y-1 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>
                <h1 className={`font-serif text-3xl font-bold flex items-center gap-2 transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <span>Welcome back</span>
                  <span>👋</span>
                </h1>
                <p className={`text-sm font-medium transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Here's what's happening at Loyola EMS today.</p>
              </div>

              {/* 3. METRICS CARD GRID (3x3 grid matching screenshot) */}
              <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-500 delay-150 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>

                {/* Card 1: Total Students */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Total Students</span>
                    <span className={`block font-serif text-4xl font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stats.totalStudents !== null ? stats.totalStudents : '-'}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                    <GraduationCap className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 2: Total Teachers */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Total Teachers</span>
                    <span className={`block font-serif text-4xl font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stats.totalTeachers}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef7e0] text-[#b06000]">
                    <Users className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 3: Today's Attendance */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Today's Attendance</span>
                    <span className={`block font-serif text-4xl font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stats.todayAttendance}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                    <Calendar className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 4: Total Paid */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Total Paid</span>
                    <span className={`block font-serif text-4xl font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatRupee(stats.totalPaid)}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f4ea] text-[#137333]">
                    <IndianRupee className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 5: Total Due */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Total Due</span>
                    <span className={`block font-serif text-4xl font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatRupee(stats.totalDue)}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fce8e6] text-[#c5221f]">
                    <AlertCircle className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 6: Today's Collection */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Today's Collection</span>
                    <span className={`block font-serif text-4xl font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatRupee(stats.todayCollection)}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                    <Globe className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 7: Monthly Collection */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Monthly Collection</span>
                    <span className={`block font-serif text-[32px] font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatRupee(stats.monthlyCollection)}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                    <TrendingUp className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 8: Cash */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Cash <span className="normal-case font-normal">(Today)</span></span>
                    <span className={`block font-serif text-4xl font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatRupee(stats.cashCollection)}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f4ea] text-[#137333]">
                    <IndianRupee className="h-[22px] w-[22px]" />
                  </div>
                </div>

                {/* Card 9: Online */}
                <div className={`rounded-3xl p-6 border shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-4">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Online <span className="normal-case font-normal">(Today)</span></span>
                    <span className={`block font-serif text-[32px] font-bold leading-none transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatRupee(stats.onlineCollection)}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                    <CreditCard className="h-[22px] w-[22px]" />
                  </div>
                </div>

              </div>

              {/* 3.5 CLASS-WISE STUDENT COUNT */}
              {stats.classSummary && stats.classSummary.length > 0 && (
                <div className={`transition-all duration-500 delay-250 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                  }`}>
                  <div className={`rounded-3xl p-6 border shadow-xs transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className={`text-md font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Students Per Class</h3>
                        <p className="text-slate-400 text-xs font-semibold mt-0.5">Class-wise student distribution</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors duration-500 ${darkMode ? 'text-slate-300 bg-slate-700' : 'text-slate-400 bg-slate-100'}`}>{stats.classSummary.length} sections</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {stats.classSummary.map(cls => (
                        <div key={cls.label} className={`flex flex-col items-center justify-center rounded-2xl border py-4 px-3 hover:shadow-md transition-all cursor-default ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gradient-to-br from-[#e8f0fe] to-[#dbeafe] border-blue-100'}`}>
                          <span className="font-serif text-2xl font-bold text-[#1a73e8]">{cls.count}</span>
                          <span className={`text-xs font-bold mt-1 text-center ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{cls.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. CHARTS ROW */}
              <div className={`grid grid-cols-1 gap-6 lg:grid-cols-3 transition-all duration-500 delay-300 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>

                {/* Left Chart: Monthly Collection Bar Chart (Span-2) */}
                <div className={`rounded-3xl p-6 border shadow-xs lg:col-span-2 space-y-6 flex flex-col justify-between min-h-[300px] transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-1">
                    <h3 className={`font-serif text-xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Weekly Collection Trend</h3>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Total collected this month</p>
                  </div>

                  {/* Graph Visual Area */}
                  <div className="relative flex-1 flex flex-col justify-between h-[200px] mt-4">

                    {/* Background dotted gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between z-0 pl-10 pointer-events-none">
                      {[36000, 27000, 18000, 9000, 0].map((val) => (
                        <div key={val} className="flex items-center w-full">
                          <span className={`text-[10px] font-bold w-10 text-right pr-2 select-none ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{val}</span>
                          <div className={`flex-1 border-t border-dashed ${darkMode ? 'border-slate-700/80' : 'border-slate-200/80'}`}></div>
                        </div>
                      ))}
                    </div>

                    {/* Bars Container */}
                    <div className="relative flex-1 flex items-end justify-around h-full ml-10 z-10">
                      {[
                        { month: 'Jan', val: 0 },
                        { month: 'Feb', val: 0 },
                        { month: 'Mar', val: isOffline ? 0 : 1200 },
                        { month: 'Apr', val: isOffline ? 0 : 11500 },
                        { month: 'May', val: stats.monthlyCollection || 0 },
                        { month: 'Jun', val: isOffline ? 0 : 19250 }
                      ].map((item, idx) => {
                        const maxVal = 36000;
                        const pct = Math.min((item.val / maxVal) * 100, 100);
                        const isHovered = hoveredBar === idx;

                        return (
                          <div
                            key={item.month}
                            className="h-full flex flex-col justify-end items-center group w-12 cursor-pointer"
                            onMouseEnter={() => setHoveredBar(idx)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Bar Graphic with Tooltip inside */}
                            <div
                              className={`w-8 rounded-t-lg transition-all duration-300 relative ${darkMode ? 'bg-blue-500 hover:bg-blue-400' : 'bg-[#3b82f6] hover:bg-[#2563eb]'}`}
                              style={{ height: `${Math.max(pct, 2)}%` }} // At least 2% height so 0 values don't break layout lines
                            >
                              {/* Floating Tooltip Bubble relative to the top of the bar */}
                              {isHovered && item.val > 0 && (
                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 rounded-xl px-3 py-2 shadow-md border text-center z-30 animate-fade-in-up min-w-[100px] ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
                                  <span className={`block text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.month}</span>
                                  <span className={`block text-[12px] font-bold mt-0.5 ${darkMode ? 'text-blue-400' : 'text-[#2563eb]'}`}>total : {formatRupee(item.val)}</span>
                                  {/* Little arrow at the bottom of tooltip */}
                                  <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${darkMode ? 'border-t-slate-700' : 'border-t-white'}`}></div>
                                </div>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold mt-2 select-none ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Chart: Payment Mode Distribution Pie Chart (Span-1) */}
                <div className={`rounded-3xl p-6 border shadow-xs flex flex-col justify-between min-h-[300px] transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="space-y-1">
                    <h3 className={`font-serif text-xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Collection Split</h3>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Distribution of transaction modes</p>
                  </div>

                  {/* Circular Pie Chart Ring */}
                  <div className="relative flex items-center justify-center h-44 my-4">
                    <svg className="w-36 h-36 transform -rotate-90 select-none">
                      {/* Grey background circle */}
                      <circle cx="72" cy="72" r="56" fill="transparent" stroke={darkMode ? '#334155' : '#f1f5f9'} strokeWidth="18" />

                      {/* Cash segment (yellow) — starts at 0° */}
                      <circle
                        cx="72" cy="72" r="56"
                        fill="transparent"
                        stroke="#fbc02d"
                        strokeWidth="18"
                        strokeDasharray={`${cashDash} ${circumference - cashDash}`}
                        strokeDashoffset={0}
                        className="transition-all duration-1000 ease-out"
                      />

                      {/* Online segment (blue) — rotated to start after Cash */}
                      <circle
                        cx="72" cy="72" r="56"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="18"
                        strokeDasharray={`${onlineDash} ${circumference - onlineDash}`}
                        strokeDashoffset={0}
                        transform={`rotate(${onlineRotation}, 72, 72)`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Centered overall numeric percentage text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-bold font-serif ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {isOffline ? '-%' : (totalCol > 0 ? `${onlinePct}%` : '0%')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Online</span>
                    </div>
                  </div>

                  {/* Legend: Cash & Online */}
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#fbc02d] inline-block"></span>
                      <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cash {totalCol > 0 ? `${cashPct}%` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#2563eb] inline-block"></span>
                      <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Online {totalCol > 0 ? `${onlinePct}%` : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder placeholder details content for inactive tabs */}
          {activeTab !== 'Dashboard' && (
            <div className={`rounded-3xl border p-8 text-center space-y-3 transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <Settings className="h-10 w-10 text-slate-300 mx-auto" />
              <h2 className={`text-xl font-bold font-serif transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{activeTab} Module</h2>
              <p className={`text-sm max-w-sm mx-auto transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                The management interface for {activeTab} is configured. Connecting CRUD APIs...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
