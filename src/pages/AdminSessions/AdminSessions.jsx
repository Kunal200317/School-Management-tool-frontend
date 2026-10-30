import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../api/api';
import {
  GraduationCap, LayoutDashboard, Users, CreditCard,
  LogOut, Menu, X, Bell, Moon, Sun, Calendar,
  CheckCircle, AlertCircle, ShieldCheck, Settings,
  IndianRupee, FileText, Megaphone, History, Plus, ArrowRight, Archive
} from 'lucide-react';

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
  { name: 'Settings', icon: Settings, path: null },
];

export default function AdminSessions() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });
  const [animate, setAnimate] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  // New session form
  const [label, setLabel] = useState('');
  const [startYear, setStartYear] = useState('');

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

  useEffect(() => {
    fetchSessions();
    setTimeout(() => setAnimate(true), 50);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/sessions`, { withCredentials: true });
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err.message);
      showToast('❌ Session list fetch fail ho gaya.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!label.trim() || !startYear) {
      showToast('❌ Dono fields bharna jaruri hai.', 'error');
      return;
    }

    try {
      setCreating(true);
      await axios.post(
        `${API}/api/sessions`,
        { label: label.trim(), startYear: Number(startYear) },
        { withCredentials: true }
      );
      showToast('✅ Naya session successfully create ho gaya!');
      setLabel('');
      setStartYear('');
      fetchSessions();
    } catch (err) {
      showToast(err.response?.data?.message || '❌ Session create karne mein error aaya.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await axios.patch(`${API}/api/sessions/${id}/active`, {}, { withCredentials: true });
      showToast('✅ Session ko active set kar diya gaya hai!');
      fetchSessions();
    } catch (err) {
      showToast('❌ Session active karne mein error aaya.', 'error');
    }
  };

  const handleCloseSession = async (id) => {
    try {
      await axios.patch(`${API}/api/sessions/${id}/close`, {}, { withCredentials: true });
      showToast('🔒 Session ko close kar diya gaya.');
      fetchSessions();
    } catch (err) {
      showToast('❌ Session close karne mein error aaya.', 'error');
    }
  };

  const handleSignOut = async () => {
    try { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }); } catch { }
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#FBFAF6] text-slate-900'}`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbc02d] text-[#0a1e3f]">
                <GraduationCap className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-md font-bold tracking-wide leading-none">Loyola EMS</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">Admin Portal</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="h-[calc(100vh-250px)] overflow-y-auto px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <button key={item.name} onClick={() => { if (item.path) navigate(item.path); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#fbc02d] text-[#0a1e3f] font-bold shadow-sm' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                  <Icon className="h-[18px] w-[18px]" /><span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{adminName}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">{adminEmail}</span>
          </div>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="h-[18px] w-[18px]" /><span>Sign out</span>
          </button>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className={`flex h-16 shrink-0 items-center justify-between border-b px-6 lg:px-8 transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Academic Sessions</h2>
          </div>
          <div className="flex items-center gap-4.5">
            <button className={`relative rounded-full p-2 transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#eef2f6] border-slate-200/20 text-slate-700'}`}>
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold">{adminEmail}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 space-y-6">

          <div className={`transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h1 className={`font-serif text-2xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Academic Sessions</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Create academic years, activate the current session and close previous ones. Fees, promotions and attendance are all recorded against the active session.
            </p>
          </div>

          {/* Form */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50 shadow-xs'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-md font-bold mb-4 flex items-center gap-2">
              <span className="p-1 bg-[#203a5e] text-white rounded-lg"><Plus className="h-4 w-4" /></span>
              <span>Create new session</span>
            </h2>
            <form onSubmit={handleCreateSession} className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example label: 2026-2027</label>
                <input
                  type="text"
                  placeholder="2026-2027"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#203a5e]'}`}
                />
              </div>
              <div className="w-full md:w-48 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Year</label>
                <input
                  type="number"
                  placeholder="2026"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#203a5e]'}`}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full md:w-auto px-6 py-2.5 bg-[#203a5e] hover:bg-[#1a304f] text-white rounded-xl text-sm font-bold shadow-xs hover:cursor-pointer transition-all disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50 shadow-xs'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-md font-bold mb-4">All sessions</h2>

            {loading ? (
              <p className="text-sm text-slate-400">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-slate-400">No academic sessions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                      <th className="py-3 px-4">Label</th>
                      <th className="py-3 px-4">Start Year</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((sess) => (
                      <tr key={sess._id} className={`border-b hover:bg-slate-500/5 ${darkMode ? 'border-slate-700/50' : 'border-slate-100/80'}`}>
                        <td className="py-4 px-4 font-bold">{sess.label}</td>
                        <td className="py-4 px-4 font-semibold">{sess.startYear}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${sess.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {sess.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-400">
                          {new Date(sess.createdAt).toLocaleDateString('en-US')}
                        </td>
                        <td className="py-4 px-4">
                          {sess.status === 'Active' ? (
                            <button
                              onClick={() => handleCloseSession(sess._id)}
                              className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:cursor-pointer"
                            >
                              Close
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetActive(sess._id)}
                              className="px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-all hover:cursor-pointer"
                            >
                              Set Active
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
