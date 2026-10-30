import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../api/api';
import {
  GraduationCap, LayoutDashboard, Users, CreditCard,
  LogOut, Menu, X, Bell, Moon, Sun, Calendar,
  CheckCircle, AlertCircle, ShieldCheck, Settings,
  IndianRupee, FileText, Megaphone, History, ArrowRight, Archive
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard',       icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Students',        icon: Users,           path: '/admin/students' },
  { name: 'Teachers',        icon: Users,           path: '/admin/teachers' },
  { name: 'Attendance',      icon: Calendar,        path: null },
  { name: 'Fees',            icon: CreditCard,      path: null },
  { name: 'Fee Structure',   icon: IndianRupee,     path: '/admin/fee-structure' },
  { name: 'Daily Collection',icon: FileText,        path: null },
  { name: 'Sessions',        icon: Calendar,        path: '/admin/sessions' },
  { name: 'Promotion',       icon: ArrowRight,      path: '/admin/promotion' },
  { name: 'Archived',        icon: Archive,         path: '/admin/archive' },
  { name: 'Notices',         icon: Megaphone,       path: null },
  { name: 'Holidays',        icon: Calendar,        path: '/admin/holidays' },
  { name: 'Reports',         icon: FileText,        path: null },
  { name: 'Audit Logs',      icon: History,         path: null },
  { name: 'Admins',          icon: ShieldCheck,     path: '/admin/admins' },
  { name: 'Settings',        icon: Settings,        path: null },
];

const CLASS_OPTIONS = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SECTION_OPTIONS = ["A", "B", "C", "D"];

export default function AdminPromotion() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });
  const [animate, setAnimate] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters state
  const [fromSession, setFromSession] = useState('');
  const [currentClass, setCurrentClass] = useState('1');
  const [currentSection, setCurrentSection] = useState('A');
  const [toSession, setToSession] = useState('');
  const [targetSection, setTargetSection] = useState('A');
  const [autoRollNumbers, setAutoRollNumbers] = useState(true);

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

  // Fetch sessions to populate dropdowns
  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API}/api/sessions`, { withCredentials: true });
      const sessList = res.data || [];
      setSessions(sessList);

      // Default sessions
      const active = sessList.find(s => s.status === 'Active');
      if (active) {
        setFromSession(active.label);
        // Find next session if possible
        const sorted = [...sessList].sort((a, b) => a.startYear - b.startYear);
        const activeIdx = sorted.findIndex(s => s._id === active._id);
        if (activeIdx !== -1 && activeIdx + 1 < sorted.length) {
          setToSession(sorted[activeIdx + 1].label);
        } else {
          setToSession('');
        }
      } else if (sessList.length > 0) {
        setFromSession(sessList[0].label);
        if (sessList.length > 1) {
          setToSession(sessList[1].label);
        }
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  // Fetch students based on source filters
  useEffect(() => {
    if (fromSession && currentClass && currentSection) {
      fetchStudents();
    }
  }, [fromSession, currentClass, currentSection]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const res = await axios.get(`${API}/api/admin/students`, {
        params: {
          session: fromSession,
          className: currentClass,
          section: currentSection
        },
        withCredentials: true
      });
      setStudents(res.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      showToast('❌ Students fetch karne mein error aaya.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s._id));
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handlePromote = async () => {
    if (selectedIds.length === 0) {
      showToast('❌ Pehle promote karne ke liye students select karein.', 'error');
      return;
    }
    if (!toSession) {
      showToast('❌ Target session select karna jaruri hai.', 'error');
      return;
    }
    if (fromSession === toSession) {
      showToast('❌ Target session source session ke same nahi ho sakta.', 'error');
      return;
    }

    const nextClass = getNextClassLabel(currentClass);
    const confirmMsg = nextClass === 'Passed Out'
      ? `Kya aap selected ${selectedIds.length} students ko Pass Out mark karna chahte hain?`
      : `Kya aap selected ${selectedIds.length} students ko Class ${nextClass}-${targetSection} (${toSession}) mein promote karna chahte hain?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setPromoting(true);
      const res = await axios.post(`${API}/api/admin/students/promote`, {
        studentIds: selectedIds,
        fromSession,
        toSession,
        targetSection,
        autoRollNumbers
      }, { withCredentials: true });

      showToast(`✅ ${res.data.message || 'Promotion successful!'}`);
      setSelectedIds([]);
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || '❌ Promotion process fail ho gaya.', 'error');
    } finally {
      setPromoting(false);
    }
  };

  const getNextClassLabel = (current) => {
    const cls = current.trim().toUpperCase();
    if (cls === 'NURSERY') return 'LKG';
    if (cls === 'LKG') return 'UKG';
    if (cls === 'UKG') return '1';
    
    const num = parseInt(cls, 10);
    if (!isNaN(num)) {
      if (num >= 10) return 'Passed Out';
      return String(num + 1);
    }
    return 'Passed Out';
  };

  const handleSignOut = async () => {
    try { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }); } catch {}
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const nextClassLabel = getNextClassLabel(currentClass);

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
            <h2 className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Student Promotion</h2>
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
            <h1 className={`font-serif text-2xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Student Promotion</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Bulk-promote students to the next class in a new academic session. Class 10 uses Pass Out instead.
            </p>
          </div>

          {/* Configuration Form Card */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50 shadow-xs'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">From Session</label>
                <select
                  value={fromSession}
                  onChange={(e) => setFromSession(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  <option value="">Select Session</option>
                  {sessions.map(s => (
                    <option key={s._id} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Class</label>
                <select
                  value={currentClass}
                  onChange={(e) => setCurrentClass(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  {CLASS_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Section</label>
                <select
                  value={currentSection}
                  onChange={(e) => setCurrentSection(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  {SECTION_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">To Session</label>
                <select
                  value={toSession}
                  onChange={(e) => setToSession(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  <option value="">Select Session</option>
                  {sessions.map(s => (
                    <option key={s._id} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Section</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  {SECTION_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRollNumbers"
                checked={autoRollNumbers}
                onChange={(e) => setAutoRollNumbers(e.target.checked)}
                className="w-4 h-4 accent-[#203a5e] cursor-pointer"
              />
              <label htmlFor="autoRollNumbers" className="text-xs font-bold text-slate-500 cursor-pointer">
                Auto-assign fresh roll numbers in the target class-section
              </label>
            </div>
          </div>

          {/* Student List Promotion Panel */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50 shadow-xs'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="text-sm font-semibold">
                {loading ? (
                  <span className="text-slate-400">Loading student details...</span>
                ) : (
                  <span>
                    {students.length} students in Class {currentClass}-{currentSection} · Selected {selectedIds.length} ·{' '}
                    <span className="text-amber-600 font-bold">
                      Will promote to {nextClassLabel === 'Passed Out' ? 'Passed Out Status' : `Class ${nextClassLabel}`}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  disabled={students.length === 0}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all hover:cursor-pointer ${darkMode ? 'border-slate-600 text-white hover:bg-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {selectedIds.length === students.length && students.length > 0 ? 'Deselect all' : 'Select all'}
                </button>
                <button
                  onClick={handlePromote}
                  disabled={selectedIds.length === 0 || promoting}
                  className="px-4 py-2 bg-[#203a5e] hover:bg-[#1a304f] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 hover:cursor-pointer"
                >
                  Promote ({selectedIds.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">No students found matching current filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                      <th className="py-3 px-4 w-12">Select</th>
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Admission</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Father</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id} className={`border-b hover:bg-slate-500/5 ${darkMode ? 'border-slate-700/50' : 'border-slate-100/80'}`}>
                        <td className="py-4 px-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(student._id)}
                            onChange={() => handleToggleSelect(student._id)}
                            className="w-4 h-4 accent-[#203a5e] cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 font-semibold">{student.rollNo || '—'}</td>
                        <td className="py-4 px-4 font-bold text-slate-400">AdmNo: {student.admissionId}</td>
                        <td className="py-4 px-4 font-bold">{student.name}</td>
                        <td className="py-4 px-4 font-medium text-slate-500">{student.fatherName || '—'}</td>
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
