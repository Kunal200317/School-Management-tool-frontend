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
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function StudentAttendance() {
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
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studentDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('studentDarkMode', darkMode);
  }, [darkMode]);

  // Real attendance data: Map of "YYYY-MM-DD" -> "Present"/"Absent"/"Leave"
  const [attendanceMap, setAttendanceMap] = useState({});

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const monthName = monthNames[monthIndex];
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = new Date(year, monthIndex, 1).getDay();

  const todayStr = new Date().toISOString().split('T')[0];

  const getDayStatus = (dayNum) => {
    const dateObj = new Date(year, monthIndex, dayNum);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) return 'holiday'; // Sunday

    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    if (dateStr > todayStr) return 'future';

    const realStatus = attendanceMap[dateStr];
    if (realStatus === 'Present') return 'present';
    if (realStatus === 'Absent') return 'absent';
    if (realStatus === 'Leave') return 'leave';
    if (realStatus === 'Holiday') return 'holiday';

    return 'unmarked';
  };

  // Monthly stats
  let totalDaysLogged = 0, presentCount = 0, absentCount = 0, leaveCount = 0, holidayCount = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const s = getDayStatus(d);
    if (s === 'present') { totalDaysLogged++; presentCount++; }
    else if (s === 'absent') { totalDaysLogged++; absentCount++; }
    else if (s === 'leave') { totalDaysLogged++; leaveCount++; }
    else if (s === 'holiday') { holidayCount++; }
  }

  useEffect(() => {
    fetchStudentProfile();
    fetchAttendance();
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get(`${API}/api/student/profile`, { withCredentials: true });
      setStudent(response.data.user);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.user) parsed.user = response.data.user;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) { }
      }
    } catch (err) {
      console.error('Failed to load student profile:', err.message);
      if (err.response?.status === 401) { localStorage.removeItem('user'); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const res = await axios.get(`${API}/api/student/attendance`, { withCredentials: true });
      const map = {};
      (res.data.attendance || []).forEach(rec => {
        if (rec.date && rec.status) map[rec.date] = rec.status;
      });
      setAttendanceMap(map);
    } catch (err) {
      console.warn('Attendance fetch failed:', err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) { }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getCellStyle = (status) => {
    if (status === 'present') return { backgroundColor: darkMode ? '#064e3b' : '#bbf7d0', color: darkMode ? '#6ee7b7' : '#065f46', border: '2px solid', borderColor: darkMode ? '#059669' : '#34d399', fontWeight: '800' };
    if (status === 'absent') return { backgroundColor: darkMode ? '#7f1d1d' : '#fecaca', color: darkMode ? '#fca5a5' : '#7f1d1d', border: '2px solid', borderColor: darkMode ? '#dc2626' : '#f87171', fontWeight: '800' };
    if (status === 'leave') return { backgroundColor: darkMode ? '#78350f' : '#fde68a', color: darkMode ? '#fcd34d' : '#78350f', border: '2px solid', borderColor: darkMode ? '#d97706' : '#f59e0b', fontWeight: '800' };
    if (status === 'holiday') return { backgroundColor: darkMode ? '#1e3a5f' : '#c7d2fe', color: darkMode ? '#93c5fd' : '#1e3a5f', border: '2px solid', borderColor: darkMode ? '#3b82f6' : '#818cf8', fontWeight: '800' };
    return { backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', color: darkMode ? '#475569' : '#cbd5e1', border: '1px solid', borderColor: darkMode ? '#334155' : '#e2e8f0' };
  };

  if (loading && !student) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FBFAF6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0a1e3f] border-t-transparent"></div>
          <span className="text-sm font-bold text-[#0a1e3f]">Loading Attendance...</span>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#FBFAF6] text-slate-800'} font-sans`}>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
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
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-4 space-y-1.5">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
              { name: 'My Profile', icon: User, path: '/student/profile' },
              { name: 'Attendance', icon: Calendar, path: '/student/attendance' },
              { name: 'Fees & Payments', icon: CreditCard, path: '/student/fees' },
              { name: 'Notices', icon: Bell, path: '/student/notices' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = item.path === '/student/attendance';
              return (
                <button key={item.name} onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${isActive ? 'bg-[#fbc02d] text-[#0a1e3f] font-bold shadow-sm' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{student.name}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">LEMS-{student.admissionId}</span>
          </div>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer">
            <LogOut className="h-[18px] w-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`flex h-16 items-center justify-between border-b ${darkMode ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-300 bg-white'} px-6 lg:px-8 shrink-0`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer">
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

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-6">
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'} shadow-xs space-y-6 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div>
              <h3 className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>Attendance Dashboard</h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Monthly logs and statistics tracker</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 p-5 rounded-2xl border" style={{ backgroundColor: darkMode ? '#1e293b' : '#f8fafc', borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
              <div className="text-center py-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Total Days</span>
                <span className="block text-2xl font-bold font-serif mt-1" style={{ color: darkMode ? '#ffffff' : '#0f172a' }}>{totalDaysLogged}</span>
              </div>
              <div className="text-center py-1 border-x border-slate-200/40">
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: darkMode ? '#34d399' : '#047857' }}>Present</span>
                <span className="block text-2xl font-bold font-serif mt-1 text-emerald-600">{presentCount}</span>
              </div>
              <div className="text-center py-1 border-r border-slate-200/40">
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: darkMode ? '#f87171' : '#b91c1c' }}>Absent</span>
                <span className="block text-2xl font-bold font-serif mt-1 text-rose-600">{absentCount}</span>
              </div>
              <div className="text-center py-1 border-r border-slate-200/40">
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: darkMode ? '#fbbf24' : '#92400e' }}>Leave</span>
                <span className="block text-2xl font-bold font-serif mt-1 text-amber-500">{leaveCount}</span>
              </div>
              <div className="text-center py-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: darkMode ? '#60a5fa' : '#1e40af' }}>Holiday</span>
                <span className="block text-2xl font-bold font-serif mt-1 text-blue-500">{holidayCount}</span>
              </div>
            </div>

            {/* Attendance loading indicator */}
            {attendanceLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                Loading attendance from server...
              </div>
            )}
            {!attendanceLoading && Object.keys(attendanceMap).length === 0 && (
              <div className="text-xs font-semibold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                ℹ️ Is mahine ka koi attendance record abhi tak nahi hai.
              </div>
            )}

            {/* Calendar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 select-none">
                  <button onClick={handlePrevMonth} className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="block text-sm font-bold" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>
                    {monthName} {year} Logs
                  </span>
                  <button onClick={handleNextMonth} className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Present</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Absent</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Leave</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Holiday</span>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-bold text-slate-400 uppercase">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-semibold">
                {Array.from({ length: startDay }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="py-2"></div>
                ))}
                {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map(day => {
                  const status = getDayStatus(day);
                  return (
                    <div
                      key={day}
                      className="py-2.5 rounded-lg font-mono text-xs font-bold transition-all relative group select-none"
                      style={getCellStyle(status)}
                    >
                      {day}
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-[8px] bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {status.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
