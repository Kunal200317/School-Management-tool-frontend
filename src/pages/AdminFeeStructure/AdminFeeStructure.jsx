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
  LayoutDashboard,
  Menu,
  X,
  Save,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  History,
  ArrowRight,
  Archive
} from 'lucide-react';
import axios from 'axios';
import { API } from '../../api/api';

export default function AdminFeeStructure() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Fee Structure');
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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

  // Loading and Database States
  const [originalFees, setOriginalFees] = useState([]); // Database templates
  const [formFees, setFormFees] = useState([]); // UI inputs state
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Sessions States
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');

  // Standard predefined classes list in sorted order
  const classesOrder = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  // Load admin details
  useEffect(() => {
    // Fetch sessions
    axios.get(`${API}/api/sessions`, { withCredentials: true })
      .then(res => {
        const sessList = res.data || [];
        setSessions(sessList);
        const active = sessList.find(s => s.status === 'Active');
        if (active) {
          setSelectedSession(active.label);
        } else if (sessList.length > 0) {
          setSelectedSession(sessList[0].label);
        }
      })
      .catch(err => console.error('Error fetching sessions:', err));

    // Trigger page entry animations
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Class Fees
  const fetchClassFees = () => {
    if (!selectedSession) return;
    setLoading(true);
    axios.get(`${API}/api/fees/class`, {
      params: { session: selectedSession }
    })
      .then(res => {
        const data = res.data || [];
        // Map database array to order of classesOrder
        const mapped = classesOrder.map(className => {
          const dbTemplate = data.find(item => item.className.trim() === className);
          return {
            className,
            annualFee: dbTemplate ? dbTemplate.annualFee : 0,
            monthlyTuitionFee: dbTemplate ? dbTemplate.monthlyTuitionFee : 0,
            examFee: dbTemplate ? dbTemplate.examFee : 0,
            computerFee: dbTemplate ? dbTemplate.computerFee * 2 : 0 // Stored is half-yearly, UI shows yearly
          };
        });
        setOriginalFees(JSON.parse(JSON.stringify(mapped)));
        setFormFees(JSON.parse(JSON.stringify(mapped)));
      })
      .catch(err => {
        console.error('Failed to fetch class fees:', err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClassFees();
  }, [selectedSession]);

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed', err);
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Handle Input Changes
  const handleInputChange = (index, field, value) => {
    const numericValue = Number(value) || 0;
    setFormFees(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: numericValue
        };
      }
      return item;
    }));
  };

  // Row-level Reset
  const handleRowReset = (index) => {
    const original = originalFees[index];
    setFormFees(prev => prev.map((item, idx) => {
      if (idx === index) {
        return JSON.parse(JSON.stringify(original));
      }
      return item;
    }));
  };

  // Row-level Save
  const handleRowSave = async (index) => {
    const row = formFees[index];
    setIsSaving(true);
    try {
      // Divide computerFee by 2 when saving, to store the half-yearly amount in DB
      const payload = {
        className: row.className,
        annualFee: row.annualFee,
        monthlyTuitionFee: row.monthlyTuitionFee,
        examFee: row.examFee,
        computerFee: row.computerFee / 2,
        session: selectedSession
      };

      await axios.post(`${API}/api/fees/class`, payload, { withCredentials: true });
      alert(`Fee structure for Class ${row.className} saved and propagated successfully!`);
      fetchClassFees(); // Refresh
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset All
  const handleResetAll = () => {
    setFormFees(JSON.parse(JSON.stringify(originalFees)));
  };

  // Save All
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Prepare payload: divide computer fee by 2
      const classesPayload = formFees.map(row => ({
        className: row.className,
        annualFee: row.annualFee,
        monthlyTuitionFee: row.monthlyTuitionFee,
        examFee: row.examFee,
        computerFee: row.computerFee / 2
      }));

      await axios.post(`${API}/api/fees/class/batch`, { classes: classesPayload, session: selectedSession }, { withCredentials: true });
      alert('All class fee structures saved and propagated successfully!');
      fetchClassFees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save all changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate Yearly Total for a Class
  const calculateYearlyTotal = (row) => {
    return row.annualFee + (row.monthlyTuitionFee * 12) + (row.examFee * 4) + row.computerFee;
  };

  // Calculate Sum of all Yearly Totals
  const calculateTotalExpectedRevenue = () => {
    return formFees.reduce((sum, row) => sum + calculateYearlyTotal(row), 0);
  };

  const formatRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
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
                      navigate('/admin/dashboard', { state: { tab: item.name } });
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

      {/* 2. MAIN CONTENT AREA (Right Panel) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header Navbar */}
        <header className={`flex h-16 items-center justify-between border-b transition-colors duration-500 px-6 lg:px-8 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`rounded-lg p-1.5 lg:hidden cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className={`font-serif text-2xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Fee Structure</span>
          </div>

          {/* Right Header action elements */}
          <div className="flex items-center gap-4.5">
            <button className={`relative rounded-full p-2 transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Active user badge */}
            <div className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#eef2f6] border-slate-200/20 text-slate-700'}`}>
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold">{adminEmail}</span>
            </div>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-6">

          {/* Main Card Wrapper */}
          <div className={`rounded-3xl p-6 border shadow-xs space-y-6 transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'}`}>

            {/* Title / Description & Global Buttons row */}
            <div className={`space-y-6 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <div className={`flex items-center gap-2.5 transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>
                    <CreditCard className="h-6 w-6 stroke-[2.2]" />
                    <h2 className="text-2xl font-bold font-serif leading-none">Fee Structure</h2>
                  </div>
                  <p className={`text-xs font-semibold leading-relaxed max-w-[650px] transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    Edit Admission, Monthly Tuition, Exam and Computer fee for each class in one place. Changes apply instantly to <strong className={darkMode ? 'text-amber-400' : 'text-[#0a1e3f]'}>every existing student</strong> and to <strong className={darkMode ? 'text-amber-400' : 'text-[#0a1e3f]'}>new admissions</strong> of that class.
                  </p>

                  {/* Academic Session Selector */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Session:</span>
                    <select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#203a5e]'}`}
                    >
                      {sessions.map(s => (
                        <option key={s._id} value={s.label}>{s.label} {s.status === 'Active' ? '(Active)' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Global Buttons */}
                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={handleResetAll}
                    disabled={loading || isSaving}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4.5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-97 disabled:opacity-50 ${darkMode ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset all</span>
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={loading || isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md active:scale-97 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save all'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Revenue Banner */}
              <div className={`rounded-2xl p-5 border flex items-center justify-between text-xs font-semibold transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-[#F8FAFC] border-slate-200/50 text-slate-800'}`}>
                <span className={`text-[13px] transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Total expected revenue per student across all classes (sum):
                </span>
                <span className={`text-lg font-bold font-serif tracking-wide whitespace-nowrap transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>
                  {formatRupee(calculateTotalExpectedRevenue())}
                </span>
              </div>

              {/* Table Area */}
              <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className={`transition-colors duration-500 ${darkMode ? 'bg-slate-950 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <tr>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px]">Class</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px] w-40">Admission Fee (₹)</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px] w-40">Monthly Tuition (₹)</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px] w-40">Exam Fee (₹)</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px] w-40">Computer Fee (₹)</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px] w-40">Yearly Total (₹)</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-[10px] w-24 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-semibold transition-colors duration-500 ${darkMode ? 'divide-slate-700 text-slate-300' : 'divide-slate-100/70 text-slate-700'}`}>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-5 py-8 text-center text-slate-500 text-sm">
                            Loading fee structure...
                          </td>
                        </tr>
                      ) : (
                        formFees.map((row, index) => (
                          <tr key={index} className={`transition-colors duration-500 ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/50'}`}>
                            <td className={`px-5 py-4 font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                              {row.className}
                            </td>
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                value={row.annualFee}
                                onChange={(e) => handleInputChange(index, 'annualFee', e.target.value)}
                                className={`w-full max-w-[120px] rounded-lg border px-3 py-1.5 text-sm font-semibold outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20' : 'bg-white border-slate-300 text-slate-900 focus:border-[#203a5e] focus:ring-1 focus:ring-[#203a5e]/20'}`}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                value={row.monthlyTuitionFee}
                                onChange={(e) => handleInputChange(index, 'monthlyTuitionFee', e.target.value)}
                                className={`w-full max-w-[120px] rounded-lg border px-3 py-1.5 text-sm font-semibold outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20' : 'bg-white border-slate-300 text-slate-900 focus:border-[#203a5e] focus:ring-1 focus:ring-[#203a5e]/20'}`}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                value={row.examFee}
                                onChange={(e) => handleInputChange(index, 'examFee', e.target.value)}
                                className={`w-full max-w-[120px] rounded-lg border px-3 py-1.5 text-sm font-semibold outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20' : 'bg-white border-slate-300 text-slate-900 focus:border-[#203a5e] focus:ring-1 focus:ring-[#203a5e]/20'}`}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                value={row.computerFee}
                                onChange={(e) => handleInputChange(index, 'computerFee', e.target.value)}
                                className={`w-full max-w-[120px] rounded-lg border px-3 py-1.5 text-sm font-semibold outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20' : 'bg-white border-slate-300 text-slate-900 focus:border-[#203a5e] focus:ring-1 focus:ring-[#203a5e]/20'}`}
                              />
                            </td>
                            <td className={`px-5 py-4 text-sm font-bold font-serif transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              {formatRupee(
                                Number(row.annualFee || 0) +
                                Number(row.monthlyTuitionFee || 0) * 12 +
                                Number(row.examFee || 0) * 4 +
                                Number(row.computerFee || 0)
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-center whitespace-nowrap space-x-2">
                              <button
                                onClick={() => handleRowSave(index)}
                                disabled={isSaving}
                                className={`inline-block text-[11px] font-bold py-1.5 px-3.5 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 border ${darkMode ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-500' : 'bg-[#0a1e3f] hover:bg-[#153466] text-white border-[#0a1e3f]'}`}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => handleRowReset(index)}
                                disabled={isSaving}
                                className={`inline-block border text-[11px] font-bold py-1.5 px-3.5 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}`}
                              >
                                Reset
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom helper tip */}
              <div className="text-[11px] font-bold text-slate-400 tracking-wide leading-relaxed pt-2">
                Tip: Use <strong className="text-[#0a1e3f]">Save all</strong> after bulk edits. Yearly total = Admission + (Monthly Tuition * 12) + (Exam * 4) + Computer.
              </div>

            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
