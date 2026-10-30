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
  Search,
  Edit,
  Trash2,
  Key,
  Plus,
  IndianRupee,
  ShieldCheck,
  History,
  ArrowRight,
  Archive
} from 'lucide-react';
import axios from 'axios';
import { API } from '../../api/api';

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Teachers');

  // Teacher States
  const [teachersList, setTeachersList] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [selectedFile, setSelectedFile] = useState(null);
  const [removePhotoFlag, setRemovePhotoFlag] = useState(false);

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    classAssigned: '',
    sectionAssigned: '',
    joinedOn: '',
    password: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    classAssigned: '',
    sectionAssigned: '',
    joinedOn: ''
  });

  // Load Admin cached details
  useEffect(() => {
    // Trigger page animations
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch teachers
  const fetchTeachers = () => {
    setLoadingTeachers(true);
    axios.get(`${API}/api/admin/teachers`, {
      withCredentials: true,
      params: { search: searchQuery }
    })
      .then(res => {
        setTeachersList(res.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch teachers:', err.message);
      })
      .finally(() => {
        setLoadingTeachers(false);
      });
  };

  useEffect(() => {
    fetchTeachers();
  }, [searchQuery]);

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed', err);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleRemovePhotoClick = () => {
    setRemovePhotoFlag(true);
    setSelectedFile(null);
  };

  // Add teacher handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('email', addForm.email);
      formData.append('mobile', addForm.mobile);
      formData.append('subject', addForm.subject);
      formData.append('classAssigned', addForm.classAssigned);
      formData.append('sectionAssigned', addForm.sectionAssigned);
      formData.append('joinedOn', addForm.joinedOn);
      formData.append('password', addForm.password);

      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      await axios.post(`${API}/api/admin/teachers`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      setIsAddModalOpen(false);
      setSelectedFile(null);
      setAddForm({
        name: '',
        email: '',
        mobile: '',
        subject: '',
        classAssigned: '',
        sectionAssigned: '',
        joinedOn: '',
        password: ''
      });
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add teacher');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Click Handler
  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      name: teacher.name || '',
      email: teacher.email || '',
      mobile: teacher.mobile || '',
      subject: teacher.subject || '',
      classAssigned: teacher.classAssigned || '',
      sectionAssigned: teacher.sectionAssigned || '',
      joinedOn: teacher.joinedOn || ''
    });
    setSelectedFile(null);
    setRemovePhotoFlag(false);
    setIsEditModalOpen(true);
  };

  // Edit Save handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      formData.append('mobile', editForm.mobile);
      formData.append('subject', editForm.subject);
      formData.append('classAssigned', editForm.classAssigned);
      formData.append('sectionAssigned', editForm.sectionAssigned);
      formData.append('joinedOn', editForm.joinedOn);
      formData.append('removePhoto', removePhotoFlag ? 'true' : 'false');

      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      await axios.put(`${API}/api/admin/teachers/${selectedTeacher._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      setIsEditModalOpen(false);
      setSelectedFile(null);
      setRemovePhotoFlag(false);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update teacher details');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handler
  const handleDeleteClick = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete teacher '${name}'?`)) {
      try {
        await axios.delete(`${API}/api/admin/teachers/${id}`, { withCredentials: true });
        fetchTeachers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete teacher');
      }
    }
  };

  // Password reset handler
  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Enter new password for ${name}:`, 'teacher123');
    if (newPassword) {
      try {
        await axios.post(`${API}/api/admin/teachers/${id}/reset-password`, { password: newPassword }, { withCredentials: true });
        alert('Password reset successfully!');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to reset password');
      }
    }
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

  const filteredTeachers = (teachersList || []).filter((t) => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (t.name || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q)
    );
  });

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

            <span className={`font-serif text-2xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Teachers</span>
          </div>

          {/* Right Header action elements */}
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
          <div className="space-y-6">
            {/* Header Row */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}>
              <div className="space-y-1">
                <h1 className={`font-serif text-3xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Teachers</h1>
                <p className={`text-sm font-medium transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{teachersList.length} teacher(s) in the system.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md active:scale-97 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Add Teacher</span>
              </button>
            </div>

            {/* Search filter panel card */}
            <div className={`rounded-3xl p-6 border shadow-xs transition-all duration-500 delay-100 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by teacher name, email or assigned subject..."
                  className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-semibold placeholder-slate-400 outline-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f]'}`}
                />
              </div>
            </div>

            {/* Data Table list layout */}
            <div className={`rounded-3xl border shadow-xs overflow-hidden transition-all duration-500 delay-200 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px] text-[13px]">
                  <thead>
                    <tr className={`border-b text-[11px] font-bold tracking-wider uppercase transition-colors duration-500 ${darkMode ? 'bg-slate-950 border-slate-700 text-slate-400' : 'border-slate-300 bg-[#F2F5F9] text-slate-500'}`}>
                      <th className="px-6 py-4.5">TEACHER</th>
                      <th className="px-6 py-4.5">EMAIL</th>
                      <th className="px-6 py-4.5">SUBJECT</th>
                      <th className="px-6 py-4.5">ASSIGNED CLASS</th>
                      <th className="px-6 py-4.5">MOBILE</th>
                      <th className="px-6 py-4.5 text-right pr-12">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-semibold transition-colors duration-500 ${darkMode ? 'divide-slate-700 text-slate-300' : 'divide-slate-300 text-slate-700'}`}>
                    {loadingTeachers ? (
                      <tr>
                        <td colSpan="6" className="text-center py-16 text-sm text-slate-400 font-semibold">
                          Loading teachers list...
                        </td>
                      </tr>
                    ) : filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-16 text-sm text-slate-400 font-semibold">
                          No teachers found in database.
                        </td>
                      </tr>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <tr key={teacher._id} className={`transition-colors text-[13px] ${darkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50/20'}`}>

                          {/* Avatar & Info */}
                          <td className="px-6 py-4 flex items-center gap-3">
                            {teacher.photo ? (
                              <img
                                src={teacher.photo}
                                alt={teacher.name}
                                className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2f6] text-[#0a1e3f] font-bold text-[15px]">
                                {teacher.name ? teacher.name[0] : 'T'}
                              </div>
                            )}
                            <span className={`font-semibold text-[14px] transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>{teacher.name}</span>
                          </td>

                          {/* Email */}
                          <td className={`px-6 py-4 font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{teacher.email}</td>

                          {/* Subject */}
                          <td className={`px-6 py-4 font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{teacher.subject || 'N/A'}</td>

                          {/* Assigned Class */}
                          <td className={`px-6 py-4 font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {teacher.classAssigned && teacher.sectionAssigned
                              ? `Class ${teacher.classAssigned} - ${teacher.sectionAssigned}`
                              : teacher.classAssigned || 'N/A'
                            }
                          </td>

                          {/* Mobile */}
                          <td className={`px-6 py-4 font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{teacher.mobile || 'N/A'}</td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right pr-8 space-x-3.5">
                            {/* Reset Password */}
                            <button
                              onClick={() => handleResetPassword(teacher._id, teacher.name)}
                              title="Reset Password"
                              className="text-slate-400 hover:text-amber-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Key className="h-4.5 w-4.5 stroke-[2.2]" />
                            </button>
                            {/* Edit Details */}
                            <button
                              onClick={() => handleEditClick(teacher)}
                              title="Edit Profile"
                              className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="h-4.5 w-4.5 stroke-[2.2]" />
                            </button>
                            {/* Delete Teacher */}
                            <button
                              onClick={() => handleDeleteClick(teacher._id, teacher.name)}
                              title="Delete Teacher"
                              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4.5 w-4.5 stroke-[2.2]" />
                            </button>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in animate-duration-200">
          <div className="w-full max-w-[580px] rounded-3xl bg-white p-5 border border-slate-100 shadow-2xl space-y-4 animate-zoom-in relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-slate-900 pb-1.5 border-b border-slate-100">Add Teacher</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Teacher Name</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile</label>
                  <input
                    type="text"
                    value={addForm.mobile}
                    onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subject</label>
                  <input
                    type="text"
                    value={addForm.subject}
                    onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Class Assigned</label>
                  <select
                    value={addForm.classAssigned}
                    onChange={(e) => setAddForm({ ...addForm, classAssigned: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    <option value="">Select class...</option>
                    {['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Section Assigned</label>
                  <select
                    value={addForm.sectionAssigned}
                    onChange={(e) => setAddForm({ ...addForm, sectionAssigned: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    <option value="">Select section...</option>
                    {['A', 'B', 'C', '-'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Joining Date</label>
                  <input
                    type="date"
                    value={addForm.joinedOn}
                    onChange={(e) => setAddForm({ ...addForm, joinedOn: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Password</label>
                  <input
                    type="password"
                    placeholder="Default: teacher123"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-[11px] font-semibold text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#0a1e3f]/10 file:text-[#0a1e3f] hover:file:bg-[#0a1e3f]/20 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSaving ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in animate-duration-200">
          <div className="w-full max-w-[580px] rounded-3xl bg-white p-5 border border-slate-100 shadow-2xl space-y-4 animate-zoom-in relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-slate-900 pb-1.5 border-b border-slate-100">Edit Teacher</h3>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Teacher Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subject</label>
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Class Assigned</label>
                  <select
                    value={editForm.classAssigned}
                    onChange={(e) => setEditForm({ ...editForm, classAssigned: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    <option value="">Select class...</option>
                    {['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Section Assigned</label>
                  <select
                    value={editForm.sectionAssigned}
                    onChange={(e) => setEditForm({ ...editForm, sectionAssigned: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    <option value="">Select section...</option>
                    {['A', 'B', 'C', '-'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Joining Date</label>
                  <input
                    type="date"
                    value={editForm.joinedOn}
                    onChange={(e) => setEditForm({ ...editForm, joinedOn: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Upload Photo</label>
                  {selectedTeacher?.photo && !removePhotoFlag ? (
                    <div className="flex items-center gap-2 py-1">
                      <img
                        src={selectedTeacher.photo}
                        alt="Current Profile"
                        className="h-7 w-7 rounded-full object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhotoClick}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 rounded-lg px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3 w-3 stroke-[2.5]" />
                        <span>Remove DP</span>
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-[11px] font-semibold text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#0a1e3f]/10 file:text-[#0a1e3f] hover:file:bg-[#0a1e3f]/20 file:cursor-pointer cursor-pointer"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
