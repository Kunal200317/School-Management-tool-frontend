import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../api/api';
import {
  GraduationCap, LayoutDashboard, Calendar, Bell,
  LogOut, Menu, X, BookOpen, Users, ClipboardCheck,
  Moon, Sun, Megaphone
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('teacherDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('teacherDarkMode', darkMode);
  }, [darkMode]);

  const [teacher, setTeacher] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user'))?.user || null; } catch { return null; }
  });

  const [stats, setStats] = useState({
    classLabel: '—', totalStudents: 0, markedToday: 0,
    todayDate: '—', presentToday: 0, absentToday: 0, leaveToday: 0
  });

  const [notices, setNotices] = useState([
    { title: 'Annual Sports Day', date: '2026-06-28', body: 'Annual sports day will be held on 15th of next month. All students must participate.' },
    { title: 'Parent-Teacher Meeting', date: '2026-06-28', body: 'PTM scheduled for Saturday from 10 AM to 1 PM.' },
    { title: 'Summer Break Schedule', date: '2026-06-20', body: 'Summer break from 20th June to 15th July. School reopens on 16th July.' }
  ]);

  useEffect(() => {
    fetchDashboard();
    setTimeout(() => setAnimate(true), 50);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/api/teacher/dashboard`, { withCredentials: true });
      setTeacher(res.data.teacher);
      setStats(res.data.stats);
    } catch (err) {
      console.warn('Dashboard fetch failed:', err.message);
      if (err.response?.status === 401) { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }
    }
  };

  const handleSignOut = async () => {
    try { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }); } catch { }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
    { name: 'Mark Attendance', icon: ClipboardCheck, path: '/teacher/attendance' },
    { name: 'Notices', icon: Megaphone, path: '/teacher/notices' }
  ];

  const todayFormatted = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' });

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-[#FBFAF6]'}`}>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbc02d] text-[#0a1e3f]">
                <GraduationCap className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-md font-bold tracking-wide leading-none">Loyola EMS</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">Teacher Portal</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="px-4 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <button key={item.name} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#fbc02d] text-[#0a1e3f] font-bold shadow-sm' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{teacher?.name || 'Teacher'}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">{teacher?.email || ''}</span>
          </div>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="h-[18px] w-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className={`flex items-center justify-between border-b px-6 py-3.5 lg:px-8 transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Teacher Portal</h2>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>
            {/* User status capsule pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#eef2f6] px-4 py-2 border border-slate-200/20">
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700">{teacher?.email}</span>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-8">

          {/* Greeting */}
          <div className={`space-y-1 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h1 className={`font-serif text-3xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Hello, {teacher?.name?.split(' ')[0] || 'Teacher'} 👋
            </h1>
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {teacher?.subject ? `${teacher.subject} · ` : ''}Class {stats.classLabel}
            </p>
          </div>

          {/* Stats Cards */}
          <div className={`grid grid-cols-2 gap-4 lg:grid-cols-4 transition-all duration-500 delay-100 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {[
              { label: 'Class Assigned', value: stats.classLabel, icon: BookOpen, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
              { label: 'My Students', value: stats.totalStudents, icon: Users, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
              { label: 'Marked Today', value: stats.markedToday, icon: ClipboardCheck, bg: 'bg-green-50', iconColor: 'text-green-600' },
              { label: "Today's Date", value: todayFormatted, icon: Calendar, bg: 'bg-amber-50', iconColor: 'text-amber-600' }
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`rounded-2xl p-4 border flex items-center justify-between hover:shadow-md transition-shadow ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
                  <div className="space-y-2">
                    <span className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{card.label}</span>
                    <span className={`block font-serif md:text-3xl text-2xl   font-bold leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>{card.value}</span>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${card.bg} ${card.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Attendance Summary + Notices */}
          <div className={`grid grid-cols-1 gap-6 lg:grid-cols-3 transition-all duration-500 delay-200 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>

            {/* Today's Attendance Summary */}
            <div className={`lg:col-span-2 rounded-3xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Today's Attendance Summary</h3>
                  <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>For {stats.classLabel}</p>
                </div>
                <button
                  onClick={() => navigate('/teacher/attendance')}
                  className="bg-[#0a1e3f] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#1a3a6f] transition-colors flex items-center gap-2"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Mark Attendance
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl p-4 bg-green-50 border border-green-100">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Present</span>
                  <span className="block text-4xl font-bold font-serif text-green-700 mt-2">{stats.presentToday}</span>
                </div>
                <div className="rounded-2xl p-4 bg-red-50 border border-red-100">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Absent</span>
                  <span className="block text-4xl font-bold font-serif text-red-600 mt-2">{stats.absentToday}</span>
                </div>
                <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Leave</span>
                  <span className="block text-4xl font-bold font-serif text-amber-600 mt-2">{stats.leaveToday}</span>
                </div>
              </div>

              {/* Progress bar */}
              {stats.totalStudents > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                    <span>Attendance marked</span>
                    <span>{stats.markedToday}/{stats.totalStudents}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((stats.markedToday / stats.totalStudents) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Recent Notices */}
            <div className={`rounded-3xl p-6 border flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
              <h3 className={`text-base font-bold mb-4 shrink-0 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Recent Notices</h3>
              <div className="overflow-y-auto max-h-64 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {notices.map((notice, idx) => (
                  <div key={idx} className={`border-b pb-3 last:border-0 last:pb-0 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{notice.title}</p>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{notice.date}</p>
                    <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{notice.body}</p>
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
