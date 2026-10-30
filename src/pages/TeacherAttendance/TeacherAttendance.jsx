import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../api/api';
import {
  GraduationCap, LayoutDashboard, ClipboardCheck, Megaphone,
  LogOut, Menu, X, Bell, CheckCircle, XCircle, MinusCircle,
  Users, Moon, Sun, Save, ArrowLeft
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
  { name: 'Mark Attendance', icon: ClipboardCheck, path: '/teacher/attendance' },
  { name: 'Notices', icon: Megaphone, path: '/teacher/notices' }
];

export default function TeacherAttendance() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('teacherDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('teacherDarkMode', darkMode);
  }, [darkMode]);

  const [animate, setAnimate] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [teacher, setTeacher] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('user'));
      return raw?.user || raw || null;
    } catch { return null; }
  });

  const todayDisplay = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    fetchStudents();
    setTimeout(() => setAnimate(true), 50);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/teacher/students`, { withCredentials: true });
      setStudents(res.data.students.map(s => ({ ...s, newStatus: s.todayStatus || null })));
    } catch (err) {
      console.warn('Failed to load students:', err.message);
      if (err.response?.status === 401) { localStorage.removeItem('user'); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (id, status) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, newStatus: status } : s));
    setSaved(false);
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, newStatus: status })));
    setSaved(false);
  };

  const saveAttendance = async () => {
    const records = students.filter(s => s.newStatus).map(s => ({ studentId: s._id, status: s.newStatus }));
    if (records.length === 0) return;
    try {
      setSaving(true);
      await axios.post(`${API}/api/teacher/attendance/bulk`, { records }, { withCredentials: true });
      setSaved(true);
      fetchStudents();
    } catch (err) {
      console.error('Save failed:', err.message);
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }); } catch { }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const present = students.filter(s => s.newStatus === 'Present').length;
  const absent = students.filter(s => s.newStatus === 'Absent').length;
  const leave = students.filter(s => s.newStatus === 'Leave').length;
  const unmarked = students.filter(s => !s.newStatus).length;

  const btnColor = (status, selected) => {
    if (status === 'Present') return selected ? 'bg-emerald-500 text-white border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 text-slate-400 hover:bg-emerald-50 hover:border-emerald-300';
    if (status === 'Absent') return selected ? 'bg-red-500 text-white border-red-500 ring-2 ring-red-200' : 'border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-300';
    if (status === 'Leave') return selected ? 'bg-amber-400 text-white border-amber-400 ring-2 ring-amber-200' : 'border-slate-200 text-slate-400 hover:bg-amber-50 hover:border-amber-300';
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-[#FBFAF6]'}`}>

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
                <span className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">Teacher Portal</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
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
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
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
        <header className={`flex items-center justify-between border-b px-6 py-3.5 lg:px-8 transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h2 className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Mark Attendance</h2>
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

          {/* Back button */}
          <div className={`transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <button onClick={() => navigate('/teacher/dashboard')} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0a1e3f] transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
          </div>

          {/* Date + Summary Bar */}
          <div className={`transition-all duration-500 delay-100 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Attendance Date</p>
                <p className={`text-lg font-bold font-serif mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{todayDisplay}</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600"><CheckCircle className="h-4 w-4" /> {present} Present</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-red-500"><XCircle className="h-4 w-4" /> {absent} Absent</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-amber-500"><MinusCircle className="h-4 w-4" /> {leave} Leave</span>
                {unmarked > 0 && <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{unmarked} unmarked</span>}
              </div>
            </div>
          </div>

          {/* Mark All Buttons */}
          <div className={`transition-all duration-500 delay-150 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mark All:</span>
              <button onClick={() => markAll('Present')} className="px-4 py-1.5 text-sm font-bold rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">✓ All Present</button>
              <button onClick={() => markAll('Absent')} className="px-4 py-1.5 text-sm font-bold rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">✗ All Absent</button>
            </div>
          </div>

          {/* Student List */}
          <div className={`transition-all duration-500 delay-200 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#0a1e3f] border-t-transparent" />
              </div>
            ) : students.length === 0 ? (
              <div className={`rounded-3xl p-12 text-center ${darkMode ? 'bg-slate-800' : 'bg-white border border-slate-100'}`}>
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold">No students found in your class.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className={`hidden sm:block rounded-3xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <th className="text-left px-6 py-4">Roll</th>
                        <th className="text-left px-6 py-4">Student Name</th>
                        <th className="text-center px-6 py-4">Present</th>
                        <th className="text-center px-6 py-4">Absent</th>
                        <th className="text-center px-6 py-4">Leave</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => (
                        <tr key={s._id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-50 hover:bg-slate-50/80'}`}>
                          <td className={`px-6 py-4 text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{s.rollNo || idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {s.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{s.name}</span>
                            </div>
                          </td>
                          {['Present', 'Absent', 'Leave'].map(status => (
                            <td key={status} className="px-6 py-4 text-center">
                              <button onClick={() => setStatus(s._id, s.newStatus === status ? null : status)}
                                className={`h-9 w-9 rounded-full border-2 text-xs font-bold transition-all duration-150 ${btnColor(status, s.newStatus === status)}`}>
                                {status[0]}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards — P A L all visible, no scroll */}
                <div className="sm:hidden space-y-3">
                  {students.map((s, idx) => (
                    <div key={s._id} className={`rounded-2xl p-4 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xs'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{s.name}</p>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Roll {s.rollNo || idx + 1}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {['Present', 'Absent', 'Leave'].map(status => (
                            <button key={status} onClick={() => setStatus(s._id, s.newStatus === status ? null : status)}
                              className={`h-10 w-10 rounded-full border-2 text-xs font-bold transition-all duration-150 ${btnColor(status, s.newStatus === status)}`}>
                              {status[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Save Button */}
          {students.length > 0 && (
            <div className={`flex justify-end pb-4 transition-all duration-500 delay-300 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <button onClick={saveAttendance} disabled={saving || saved}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all shadow-md ${saved ? 'bg-emerald-500 text-white cursor-default' :
                    saving ? 'bg-slate-300 text-slate-500 cursor-wait' :
                      'bg-[#0a1e3f] text-white hover:bg-[#1a3a6f] hover:shadow-lg active:scale-95'
                  }`}>
                {saving ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" /> :
                  saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
