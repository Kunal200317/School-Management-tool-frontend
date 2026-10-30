import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  User,
  Mail,
  Lock,
  UserPlus,
  Trash2,
  KeyRound,
  Edit2,
  Check,
  X,
  Menu,
  ArrowRight,
  Sun,
  Moon,
  Bell,
  Archive
} from 'lucide-react';
import axios from 'axios';
import { API } from '../../api/api';

export default function AdminAdmins() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Admins');
  const [animate, setAnimate] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

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
  const [adminId, setAdminId] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const p = JSON.parse(raw);
        return p.id || '';
      }
    } catch (e) {}
    return '';
  });

  // Admins CRUD states
  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit states (Inline editing of Name & Email)
  const [editingId, setEditingId] = useState(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormEmail, setEditFormEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password reset modal states
  const [resetModalId, setResetModalId] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Error/Success banner
  const [notification, setNotification] = useState(null);

  // Load current admin info and fetch list
  useEffect(() => {
    fetchAdmins();

    // Trigger page load animation
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const fetchAdmins = () => {
    setLoadingAdmins(true);
    axios.get(`${API}/api/admin/admins`, { withCredentials: true })
      .then(res => {
        setAdminsList(res.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch admins:', err.message);
        showNotification('error', err.response?.data?.message || 'Failed to load admins');
      })
      .finally(() => {
        setLoadingAdmins(false);
      });
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      showNotification('error', 'Email and password are required');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters');
      return;
    }

    setIsAdding(true);
    axios.post(`${API}/api/admin/admins`, {
      name: newName.trim() || 'Principal',
      email: newEmail.trim(),
      password: newPassword
    }, { withCredentials: true })
      .then(res => {
        showNotification('success', res.data.message || 'Admin added successfully');
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        fetchAdmins();
      })
      .catch(err => {
        showNotification('error', err.response?.data?.message || 'Failed to add admin');
      })
      .finally(() => {
        setIsAdding(false);
      });
  };

  const handleStartEdit = (admin) => {
    setEditingId(admin._id);
    setEditFormName(admin.name || '');
    setEditFormEmail(admin.email || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormName('');
    setEditFormEmail('');
  };

  const handleSaveEdit = (id) => {
    if (!editFormEmail) {
      showNotification('error', 'Email is required');
      return;
    }
    setIsUpdating(true);
    axios.put(`${API}/api/admin/admins/${id}`, {
      name: editFormName.trim(),
      email: editFormEmail.trim()
    }, { withCredentials: true })
      .then(res => {
        showNotification('success', res.data.message || 'Admin updated successfully');

        // If updating the currently logged-in user, sync with localStorage and state
        if (id === adminId) {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            const u = JSON.parse(cachedUser);
            u.name = editFormName.trim();
            u.email = editFormEmail.trim();
            localStorage.setItem('user', JSON.stringify(u));
            setAdminName(u.name);
            setAdminEmail(u.email);
          }
        }

        setEditingId(null);
        fetchAdmins();
      })
      .catch(err => {
        showNotification('error', err.response?.data?.message || 'Failed to update admin');
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const handleRemoveAdmin = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name || 'this admin'}?`)) {
      axios.delete(`${API}/api/admin/admins/${id}`, { withCredentials: true })
        .then(res => {
          showNotification('success', res.data.message || 'Admin removed successfully');
          fetchAdmins();
        })
        .catch(err => {
          showNotification('error', err.response?.data?.message || 'Failed to remove admin');
        });
    }
  };

  const handleOpenResetModal = (id) => {
    setResetModalId(id);
    setResetPasswordVal('');
  };

  const handleCloseResetModal = () => {
    setResetModalId(null);
    setResetPasswordVal('');
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetPasswordVal || resetPasswordVal.length < 6) {
      showNotification('error', 'Password must be at least 6 characters');
      return;
    }

    setIsResetting(true);
    axios.post(`${API}/api/admin/admins/${resetModalId}/reset-password`, {
      password: resetPasswordVal
    }, { withCredentials: true })
      .then(res => {
        showNotification('success', res.data.message || 'Password reset successfully');
        handleCloseResetModal();
      })
      .catch(err => {
        showNotification('error', err.response?.data?.message || 'Failed to reset password');
      })
      .finally(() => {
        setIsResetting(false);
      });
  };

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

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#FBFAF6] text-slate-900'}`}>

      {/* 1. SIDEBAR (Left Panel) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          {/* Logo Title */}
          <div className="flex items-center gap-2.5 px-6 pb-6 border-b border-slate-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbc02d]">
              <span className="text-xl font-bold text-[#0a1e3f]">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-wide">Loyola EMS</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Links Scroll Box */}
          <nav className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
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

        {/* Sidebar Footer (Logged-in admin name + email + Logout) */}
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
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. MAIN CONTENT CONTAINER (Right Panel) */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden">

        {/* Top Header navbar */}
        <header className={`flex h-16 shrink-0 items-center justify-between border-b transition-colors duration-500 px-6 lg:px-8 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`rounded-lg p-1.5 lg:hidden cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className={`font-serif text-2xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admins</span>
          </div>

          <div className="flex items-center gap-4">
            <button className={`relative rounded-full p-2 transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            {/* Dark Mode toggle button */}
            <button onClick={() => setDarkMode(!darkMode)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer">
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User status capsule pill */}
            <div className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#eef2f6] border-slate-200/20 text-slate-700'}`}>
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span className="text-xs font-bold">{adminEmail}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-6">

          {/* Notifications banner overlay style */}
          {notification && (
            <div className={`p-4 rounded-2xl border text-sm font-bold shadow-xs transition-all animate-fade-in ${notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
              {notification.message}
            </div>
          )}

          {/* Form Card: Create a new admin */}
          <div className={`rounded-3xl p-6 border shadow-xs space-y-6 transition-all duration-300 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                <UserPlus className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-[15px] font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>Create a new admin</h3>
                <p className={`text-xs font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>New admins get full access to every panel.</p>
              </div>
            </div>

            <form onSubmit={handleAddAdmin} className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
              {/* Name */}
              <div className="lg:col-span-3 space-y-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Full name"
                    className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-semibold placeholder-slate-400 outline-hidden transition-all duration-200 focus:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="lg:col-span-3 space-y-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@loyola.school"
                    className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-semibold placeholder-slate-400 outline-hidden transition-all duration-200 focus:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lg:col-span-3 space-y-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password (min 6)"
                    className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-semibold placeholder-slate-400 outline-hidden transition-all duration-200 focus:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                  />
                </div>
              </div>

              {/* Add admin Button */}
              <div className="lg:col-span-3">
                <button
                  type="submit"
                  disabled={isAdding}
                  className={`w-full rounded-2xl py-3 text-sm font-extrabold text-white transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer text-center disabled:opacity-50 duration-200 ${darkMode ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow-amber-500/20' : 'bg-[#0a1e3f] hover:bg-[#153466]'}`}
                >
                  {isAdding ? 'Adding...' : 'Add admin'}
                </button>
              </div>
            </form>
          </div>

          {/* Table Card: Existing admins */}
          <div className={`rounded-3xl border shadow-xs overflow-hidden flex flex-col transition-all duration-300 delay-75 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
            {/* Header section */}
            <div className={`p-6 border-b flex items-center gap-3 transition-colors duration-500 ${darkMode ? 'border-slate-700' : 'border-slate-200/60'}`}>
              <ShieldCheck className={`h-5 w-5 ${darkMode ? 'text-amber-400' : 'text-[#0a1e3f]'}`} />
              <h3 className={`text-[15px] font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>Existing admins ({adminsList.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px] text-[13px]">
                <thead>
                  <tr className={`border-b text-[11px] font-bold tracking-wider uppercase transition-colors duration-500 ${darkMode ? 'bg-slate-950 border-slate-700 text-slate-400' : 'border-slate-300 bg-[#F2F5F9] text-slate-500'}`}>
                    <th className="px-6 py-4.5 w-1/3">NAME</th>
                    <th className="px-6 py-4.5 w-1/3">EMAIL</th>
                    <th className="px-6 py-4.5 text-right pr-12 w-1/3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-semibold transition-colors duration-500 ${darkMode ? 'divide-slate-700 text-slate-300' : 'divide-slate-300 text-slate-700'}`}>
                  {loadingAdmins ? (
                    <tr>
                      <td colSpan="3" className="text-center py-12 text-sm text-slate-400">
                        Loading admins...
                      </td>
                    </tr>
                  ) : adminsList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-12 text-sm text-slate-400">
                        No admins found in database
                      </td>
                    </tr>
                  ) : (
                    adminsList.map((admin) => {
                      const isMe = admin._id === adminId || admin.email.toLowerCase() === adminEmail.toLowerCase();
                      const isEditingThisRow = editingId === admin._id;

                      // Identify creator as the oldest admin (earliest createdAt)
                      const isCreator = adminsList.length > 0 && admin._id === adminsList.reduce((oldest, curr) => {
                        if (!curr.createdAt) return oldest;
                        if (!oldest.createdAt) return curr;
                        return new Date(curr.createdAt) < new Date(oldest.createdAt) ? curr : oldest;
                      }, adminsList[0])._id;

                      return (
                        <tr key={admin._id} className={`transition-colors duration-500 ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/20'}`}>

                          {/* Name edit or display */}
                          <td className="px-6 py-4 align-middle">
                            {isEditingThisRow ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editFormName}
                                  onChange={(e) => setEditFormName(e.target.value)}
                                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold outline-hidden w-48 transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-[#0a1e3f]'}`}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-[14px] transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                  {admin.name || 'Principal'}
                                </span>
                                {isMe && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                    YOU
                                  </span>
                                )}
                                {isCreator && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide transition-colors duration-500 bg-amber-500/20 text-amber-500`}>
                                    CREATOR
                                  </span>
                                )}
                                <button
                                  onClick={() => handleStartEdit(admin)}
                                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                                  title="Edit Name & Email"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Email edit or display */}
                          <td className={`px-6 py-4 align-middle font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isEditingThisRow ? (
                              <input
                                type="email"
                                value={editFormEmail}
                                onChange={(e) => setEditFormEmail(e.target.value)}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-bold outline-hidden w-56 transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-[#0a1e3f]'}`}
                              />
                            ) : (
                              admin.email
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 align-middle text-right pr-8 whitespace-nowrap">
                            {isEditingThisRow ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleSaveEdit(admin._id)}
                                  disabled={isUpdating}
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                                  title="Save Changes"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={isUpdating}
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                                  title="Cancel Edit"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleOpenResetModal(admin._id)}
                                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all active:scale-95"
                                >
                                  Reset password
                                </button>
                                <button
                                  onClick={() => handleRemoveAdmin(admin._id, admin.name)}
                                  disabled={isMe || isCreator}
                                  className={`border text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all active:scale-95 ${isMe || isCreator
                                      ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                                      : 'border-red-200 hover:bg-red-50 text-red-500 hover:border-red-300 cursor-pointer'
                                    }`}
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Password Reset Modal */}
      {resetModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-[#0a1e3f] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-[15px]">Reset Admin Password</h3>
              </div>
              <button
                onClick={handleCloseResetModal}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="block w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseResetModal}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-97 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="rounded-2xl bg-[#0a1e3f] hover:bg-[#153466] px-6 py-3 text-xs font-bold text-white transition-all active:scale-97 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}