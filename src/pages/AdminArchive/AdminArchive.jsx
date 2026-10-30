import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  IndianRupee,
  FileText,
  Megaphone,
  LogOut,
  ShieldCheck,
  Settings,
  History,
  Archive,
  Search,
  Download,
  RotateCcw,
  X,
  Menu,
  Sun,
  Moon,
  Bell,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { API } from '../../api/api';

export default function AdminArchive() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Archived');
  const [currentFilter, setCurrentFilter] = useState('All'); // 'All', 'Passed Out', 'Locked / Left'
  const [searchQuery, setSearchQuery] = useState('');
  const [animate, setAnimate] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

  // Session info
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

  // Archive state
  const [archivedList, setArchivedList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore Modal State
  const [restoreStudent, setRestoreStudent] = useState(null);
  const [targetSession, setTargetSession] = useState('2026-2027');
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('A');
  const [sessionsList, setSessionsList] = useState([]);
  const [isRestoring, setIsRestoring] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState(null);

  // Load user details & session details ONCE on mount
  useEffect(() => {
    fetchSessions();
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch archived list on filter or query change
  useEffect(() => {
    fetchArchivedStudents();
  }, [currentFilter, searchQuery]);

  const fetchArchivedStudents = () => {
    setLoading(true);
    const params = {};
    if (currentFilter !== 'All') {
      params.status = currentFilter;
    }
    if (searchQuery) {
      params.search = searchQuery;
    }

    axios.get(`${API}/api/admin/archived-students`, {
      params,
      withCredentials: true
    })
      .then(res => {
        setArchivedList(res.data || []);
      })
      .catch(err => {
        showNotification('error', err.response?.data?.message || 'Failed to load archived list');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchSessions = () => {
    axios.get(`${API}/api/sessions`, { withCredentials: true })
      .then(res => {
        setSessionsList(res.data || []);
        const active = res.data.find(s => s.status === 'Active');
        if (active) setTargetSession(active.label);
      })
      .catch(err => console.error('Failed to load sessions', err));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenRestoreModal = (student) => {
    setRestoreStudent(student);
    setTargetClass(student.class === 'Passed Out' ? '10' : student.class || '');
  };

  const handleCloseRestoreModal = () => {
    setRestoreStudent(null);
    setTargetClass('');
  };

  const handleRestoreSubmit = (e) => {
    e.preventDefault();
    if (!targetClass || !targetSection || !targetSession) {
      showNotification('error', 'All fields are required to restore student');
      return;
    }

    setIsRestoring(true);
    axios.post(`${API}/api/admin/students/${restoreStudent._id}/unarchive`, {
      targetClass,
      targetSection,
      targetSession
    }, { withCredentials: true })
      .then(res => {
        showNotification('success', res.data.message || 'Student restored successfully');
        handleCloseRestoreModal();
        fetchArchivedStudents();
      })
      .catch(err => {
        showNotification('error', err.response?.data?.message || 'Failed to restore student');
      })
      .finally(() => {
        setIsRestoring(false);
      });
  };

  const downloadList = () => {
    if (archivedList.length === 0) return;

    // Build CSV content
    const headers = ['Name', 'Admission ID', 'Class', 'Status', 'Reason', 'Archived Date'];
    const rows = archivedList.map(s => [
      s.name,
      s.admissionId,
      s.class,
      s.status,
      s.archiveReason || 'N/A',
      s.archivedAt ? new Date(s.archivedAt).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Archived_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error(err);
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

  // Group counts for filters
  const passedOutCount = archivedList.filter(s => s.status === 'Passed Out').length;
  const lockedLeftCount = archivedList.filter(s => s.status === 'Locked / Left').length;

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#FBFAF6] text-slate-900'}`}>

      {/* 1. SIDEBAR (Left Panel) */}
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
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links Scroll Box */}
          <nav className="h-[calc(100vh-250px)] overflow-y-auto px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === 'Archived';
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    } else {
                      navigate('/admin/dashboard', { state: { tab: item.name } });
                    }
                    setSidebarOpen(false);
                  }}
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

        {/* Sidebar Footer (Principal Info + Logout) */}
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{adminName}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">{adminEmail}</span>
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

      {/* Overlay background when drawer sidebar is active on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        ></div>
      )}

      {/* 2. MAIN CONTENT AREA (Right Panel) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header Navbar */}
        <header className={`flex h-16 items-center justify-between border-b transition-colors duration-500 px-6 py-3.5 lg:px-8 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`rounded-lg p-1.5 lg:hidden cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className={`font-serif text-2xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Archived Students</span>
          </div>

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
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-6">

          {/* Action Row */}
          <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-500 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
            } ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className={`font-serif text-3xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Archived Students Registry</h1>
                <p className={`text-sm font-medium transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Passed-out, transferred, migrated and cancelled students. All records preserved permanently.
                </p>
              </div>

              <button
                onClick={downloadList}
                disabled={archivedList.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md active:scale-97 cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>Download list</span>
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-slate-700/10 pt-6">

              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All Archived', value: 'All', count: archivedList.length },
                  { label: 'Passed Out', value: 'Passed Out', count: passedOutCount },
                  { label: 'Locked / Left', value: 'Locked / Left', count: lockedLeftCount }
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setCurrentFilter(t.value)}
                    className={`rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${currentFilter === t.value
                        ? 'bg-[#0a1e3f] text-white shadow-md'
                        : darkMode
                          ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-[#0a1e3f]'
                      }`}
                  >
                    {t.label} ({t.count})
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative max-w-sm w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, admission, reason..."
                  className={`block w-full rounded-2xl border py-2.5 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 outline-hidden transition-all duration-200 ${darkMode
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f]'
                    }`}
                />
              </div>

            </div>

          </div>

          {/* List Table Card */}
          <div className={`rounded-3xl border shadow-xs overflow-hidden flex flex-col min-h-[360px] transition-all duration-500 delay-75 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
            } ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] text-[13px]">
                <thead>
                  <tr className={`border-b text-[12px] font-bold tracking-wider uppercase transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'border-slate-100 bg-[#F2F5F9] text-[#596475]'
                    }`}>
                    <th className="px-6 py-4.5">STUDENT</th>
                    <th className="px-6 py-4.5">ADMISSION</th>
                    <th className="px-6 py-4.5">CLASS</th>
                    <th className="px-6 py-4.5">STATUS</th>
                    <th className="px-6 py-4.5">REASON</th>
                    <th className="px-6 py-4.5">ARCHIVED</th>
                    <th className="px-6 py-4.5 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-semibold transition-colors duration-500 ${darkMode ? 'divide-slate-700 text-slate-300' : 'divide-slate-100/70 text-slate-700'
                  }`}>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-16 text-slate-400 font-medium">
                        Loading archived records...
                      </td>
                    </tr>
                  ) : archivedList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-16 text-slate-400 font-medium">
                        No archived students found.
                      </td>
                    </tr>
                  ) : (
                    archivedList.map((student) => (
                      <tr key={student._id} className={`transition-colors duration-200 ${darkMode ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50/20'}`}>
                        {/* Student Name */}
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-500/10 border border-[#fbc02d]/30 flex items-center justify-center font-bold text-xs">
                              {student.name[0]}
                            </div>
                            <div>
                              <p className={`font-bold text-[14px] ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{student.mobileNumber || 'No Phone'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Admission ID */}
                        <td className="px-6 py-4 align-middle font-mono font-bold">{student.admissionId}</td>

                        {/* Class */}
                        <td className="px-6 py-4 align-middle uppercase">{student.class}</td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${student.status === 'Passed Out'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-red-500/10 text-red-500'
                            }`}>
                            {student.status}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="px-6 py-4 align-middle text-slate-400 font-medium max-w-xs truncate" title={student.archiveReason}>
                          {student.archiveReason || 'No reason specified'}
                        </td>

                        {/* Archived Date */}
                        <td className="px-6 py-4 align-middle text-slate-400 font-medium">
                          {student.archivedAt ? new Date(student.archivedAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 align-middle text-center">
                          <button
                            onClick={() => handleOpenRestoreModal(student)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] text-white text-[10px] font-bold py-1.5 px-3 shadow-xs transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                            title="Restore student to active registry"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Restore</span>
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>

      {/* Restore Student Modal */}
      {restoreStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-scale-up text-slate-800">

            <div className="bg-[#0a1e3f] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-[#fbc02d]" />
                <h3 className="font-bold text-[15px] font-serif">Restore Student</h3>
              </div>
              <button
                onClick={handleCloseRestoreModal}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRestoreSubmit} className="p-6 space-y-4 font-sans text-slate-800">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                You are restoring <strong>{restoreStudent.name}</strong> to the active student list. Please specify their target registry details.
              </p>

              {/* Target Session */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Session</label>
                <select
                  required
                  value={targetSession}
                  onChange={(e) => setTargetSession(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-hidden"
                >
                  {sessionsList.map(s => (
                    <option key={s._id} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Target Class */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Class</label>
                <input
                  type="text"
                  required
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  placeholder="e.g. 10, LKG, 5"
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-hidden"
                />
              </div>

              {/* Target Section */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Section</label>
                <input
                  type="text"
                  required
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  placeholder="e.g. A, B, C"
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-hidden"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isRestoring}
                  className="w-full bg-[#0a1e3f] hover:bg-[#153466] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-2xl cursor-pointer hover:shadow-md active:scale-97 transition-all duration-200 text-center font-serif"
                >
                  {isRestoring ? 'Restoring...' : 'Restore Student'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
