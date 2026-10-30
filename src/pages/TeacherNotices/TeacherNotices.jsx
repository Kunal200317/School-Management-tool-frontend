import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../api/api';
import {
  GraduationCap, LayoutDashboard, ClipboardCheck, Megaphone,
  LogOut, Menu, X, Bell, Moon, Sun, ArrowLeft
} from 'lucide-react';

const NOTICES = [
  { title: 'Annual Sports Day', date: '2026-06-28', category: 'Event', body: 'Annual sports day will be held on 15th of next month. All students and teachers must participate. Bring proper sports attire.' },
  { title: 'Parent-Teacher Meeting', date: '2026-06-28', category: 'Meeting', body: 'PTM scheduled for Saturday from 10 AM to 1 PM. All teachers are required to be present for their respective sections.' },
  { title: 'Summer Break Schedule', date: '2026-06-20', category: 'Holiday', body: 'Summer break from 20th June to 15th July. School reopens on 16th July. Please complete pending corrections before break.' },
  { title: 'Exam Timetable Released', date: '2026-06-15', category: 'Exam', body: 'Term 3 exam timetable has been released. Teachers must submit question papers 1 week in advance.' },
  { title: 'Staff Meeting', date: '2026-06-10', category: 'Meeting', body: 'Monthly staff meeting on 12th June at 2 PM in the conference hall. Attendance is mandatory for all staff.' }
];

const CATEGORY_COLORS = {
  Event: 'bg-blue-100 text-blue-700',
  Meeting: 'bg-purple-100 text-purple-700',
  Holiday: 'bg-green-100 text-green-700',
  Exam: 'bg-red-100 text-red-700'
};

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
  { name: 'Mark Attendance', icon: ClipboardCheck, path: '/teacher/attendance' },
  { name: 'Notices', icon: Megaphone, path: '/teacher/notices' }
];

export default function TeacherNotices() {
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
    try {
      const raw = JSON.parse(localStorage.getItem('user'));
      return raw?.user || raw || null;
    } catch { return null; }
  });

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);
  }, []);

  const handleSignOut = async () => {
    try { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }); } catch { }
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-[#FBFAF6]'}`}>

      {/* ── SIDEBAR ── */}
      <div className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6 flex-1 min-h-0 overflow-y-auto">
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

          {/* Nav */}
          <nav className="px-4 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <button key={item.name} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#fbc02d] text-[#0a1e3f] font-bold shadow-sm' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                  <Icon className="h-[18px] w-[18px]" /><span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4 shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{teacher?.name || 'Teacher'}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">{teacher?.email || ''}</span>
          </div>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="h-[18px] w-[18px]" /><span>Sign out</span>
          </button>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className={`flex items-center justify-between border-b px-6 py-3.5 transition-colors duration-500 lg:px-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notices</h2>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5" /><span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
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

        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 space-y-5">

          {/* Back button + Title */}
          <div className={`transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <button onClick={() => navigate('/teacher/dashboard')} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0a1e3f] transition-colors mb-3">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <h1 className={`font-serif text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>School Notices</h1>
            <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{NOTICES.length} notices from school administration</p>
          </div>

          {/* Notices List */}
          <div className="space-y-4">
            {NOTICES.map((notice, idx) => (
              <div
                key={idx}
                className={`transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                style={{ transitionDelay: `${100 + idx * 80}ms` }}
              >
                <div className={`rounded-2xl p-5 border hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${CATEGORY_COLORS[notice.category] || 'bg-slate-100 text-slate-600'}`}>
                          {notice.category}
                        </span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{notice.date}</span>
                      </div>
                      <h3 className={`text-base font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{notice.title}</h3>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{notice.body}</p>
                    </div>
                    <Megaphone className={`h-5 w-5 shrink-0 mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-300'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
