import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../api/api';
import {
  GraduationCap, LayoutDashboard, Users, CreditCard,
  LogOut, Menu, X, Bell, Moon, Sun, Calendar,
  Trash2, Plus, CalendarRange, CheckCircle, AlertCircle,
  ShieldCheck, Settings, IndianRupee, FileText, Megaphone, History, ArrowRight, Archive
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

export default function AdminHolidays() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });
  const [animate, setAnimate] = useState(false);

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }

  // Single day form
  const [singleDate, setSingleDate] = useState('');
  const [singleReason, setSingleReason] = useState('');

  // Range form
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeReason, setRangeReason] = useState('');

  const [activeForm, setActiveForm] = useState('single'); // 'single' | 'range'

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
    fetchHolidays();
    setTimeout(() => setAnimate(true), 50);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/admin/holidays`, { withCredentials: true });
      setHolidays(res.data.holidays || []);
    } catch (err) {
      console.error('Failed to fetch holidays:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singleDate) return;
    try {
      setSaving(true);
      await axios.post(`${API}/api/admin/holidays/single`, { date: singleDate, reason: singleReason || 'Holiday' }, { withCredentials: true });
      showToast(`✅ ${singleDate} ko Holiday set kar diya! Sabhi students update ho gaye.`);
      setSingleDate('');
      setSingleReason('');
      fetchHolidays();
    } catch (err) {
      showToast('❌ Holiday set karne mein error aaya.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRangeSubmit = async (e) => {
    e.preventDefault();
    if (!rangeStart || !rangeEnd) return;
    if (rangeStart > rangeEnd) { showToast('❌ Start date end date se pehle honi chahiye.', 'error'); return; }
    try {
      setSaving(true);
      const res = await axios.post(`${API}/api/admin/holidays/range`, { startDate: rangeStart, endDate: rangeEnd, reason: rangeReason || 'Holiday' }, { withCredentials: true });
      showToast(`✅ ${res.data.count} din ka holiday set ho gaya (${rangeStart} se ${rangeEnd} tak)!`);
      setRangeStart(''); setRangeEnd(''); setRangeReason('');
      fetchHolidays();
    } catch (err) {
      showToast('❌ Range holiday set karne mein error aaya.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (date) => {
    if (!window.confirm(`${date} ka holiday hatana chahte ho?`)) return;
    try {
      await axios.delete(`${API}/api/admin/holidays/${date}`, { withCredentials: true });
      showToast(`🗑️ ${date} ka holiday hata diya gaya.`);
      fetchHolidays();
    } catch (err) {
      showToast('❌ Holiday hatane mein error aaya.', 'error');
    }
  };

  const handleSignOut = async () => {
    try { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }); } catch { }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
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

      {/* ── SIDEBAR ── */}
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

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className={`flex h-16 shrink-0 items-center justify-between border-b px-6 lg:px-8 transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Holiday Management</h2>
          </div>
          <div className="flex items-center gap-4.5">
            <button className={`relative rounded-full p-2 transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Bell className="h-5 w-5" /><span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Active user badge */}
            <div className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#eef2f6] border-slate-200/20 text-slate-700'}`}>
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold">{adminEmail}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 space-y-6">

          {/* Title */}
          <div className={`transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h1 className={`font-serif text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>School Holidays</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Holiday set karo — sabhi students ke attendance mein automatically lag jayega 🏖️
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* SET HOLIDAY FORM */}
            <div className={`transition-all duration-500 delay-100 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <div className={`rounded-3xl border p-6 space-y-5 transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
                <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Holiday Set Karo</h3>

                {/* Tab Switch */}
                <div className="flex rounded-xl overflow-hidden border border-slate-200 w-fit">
                  <button onClick={() => setActiveForm('single')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${activeForm === 'single' ? 'bg-[#0a1e3f] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <Calendar className="h-3.5 w-3.5" /> Single Day
                  </button>
                  <button onClick={() => setActiveForm('range')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${activeForm === 'range' ? 'bg-[#0a1e3f] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <CalendarRange className="h-3.5 w-3.5" /> Date Range
                  </button>
                </div>

                {/* Single Day Form */}
                {activeForm === 'single' && (
                  <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Date</label>
                      <input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} required
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]/20 transition-colors duration-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reason (Optional)</label>
                      <input type="text" value={singleReason} onChange={e => setSingleReason(e.target.value)} placeholder="e.g. Diwali, Republic Day..."
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]/20 transition-colors duration-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`} />
                    </div>
                    <button type="submit" disabled={saving || !singleDate}
                      className="flex items-center gap-2 w-full justify-center px-6 py-3 rounded-full bg-[#0a1e3f] text-white text-sm font-bold hover:bg-[#1a3a6f] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {saving ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" /> : <Plus className="h-4 w-4" />}
                      {saving ? 'Saving...' : 'Set Holiday'}
                    </button>
                  </form>
                )}

                {/* Date Range Form */}
                {activeForm === 'range' && (
                  <form onSubmit={handleRangeSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Start Date</label>
                        <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} required
                          className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]/20 transition-colors duration-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>End Date</label>
                        <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} required
                          className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]/20 transition-colors duration-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reason (Optional)</label>
                      <input type="text" value={rangeReason} onChange={e => setRangeReason(e.target.value)} placeholder="e.g. Summer Vacation, Winter Break..."
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]/20 transition-colors duration-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`} />
                    </div>
                    {rangeStart && rangeEnd && rangeStart <= rangeEnd && (
                      <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                        📅 {Math.ceil((new Date(rangeEnd) - new Date(rangeStart)) / 86400000) + 1} din ka holiday set hoga
                      </div>
                    )}
                    <button type="submit" disabled={saving || !rangeStart || !rangeEnd}
                      className="flex items-center gap-2 w-full justify-center px-6 py-3 rounded-full bg-[#0a1e3f] text-white text-sm font-bold hover:bg-[#1a3a6f] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {saving ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" /> : <CalendarRange className="h-4 w-4" />}
                      {saving ? 'Saving...' : 'Set Range Holiday'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* HOLIDAYS LIST */}
            <div className={`transition-all duration-500 delay-200 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <div className={`rounded-3xl border p-6 space-y-4 transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Holidays List</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{holidays.length} holidays</span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-7 w-7 rounded-full border-4 border-[#0a1e3f] border-t-transparent" />
                  </div>
                ) : holidays.length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Koi holiday set nahi hai</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {holidays.map(h => (
                      <div key={h.date} className={`flex items-center justify-between px-4 py-3 rounded-2xl ${darkMode ? 'bg-slate-700/60' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🏖️</span>
                          <div>
                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{formatDate(h.date)}</p>
                            <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{h.reason}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(h.date)} title="Holiday hatao"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
