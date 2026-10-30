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
  IndianRupee,
  LayoutDashboard,
  Menu,
  X,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Lock,
  Key,
  Edit,
  Printer,
  Download,
  Plus,
  ShieldCheck,
  History,
  ArrowRight,
  Archive
} from 'lucide-react';
import axios from 'axios';
import { API } from '../../api/api';

export default function AdminStudents() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Students');
  const [animate, setAnimate] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

  // Student list search/filter state parameters (No fake fallback)
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [filterClass, setFilterClass] = useState('All classes');
  const [filterSection, setFilterSection] = useState('All sections');
  const [filterRoll, setFilterRoll] = useState('');
  const [filterConcession, setFilterConcession] = useState('All');
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null); // Active profile details modal target
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

  // Edit Student Form States
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [removePhotoFlag, setRemovePhotoFlag] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    admissionId: '',
    classVal: '',
    section: '',
    rollNo: '',
    dob: '',
    mobileNumber: '',
    address: '',
    hasCustomConcession: false,
    annualFee: '',
    monthlyTuitionFee: '',
    examFee: '',
    computerFee: ''
  });

  // Add Student Admission States
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [nextAdmissionId, setNextAdmissionId] = useState('LEMS-1032');
  const [selectedAddFile, setSelectedAddFile] = useState(null);
  const [isAdmittingStudent, setIsAdmittingStudent] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    dob: '',
    fatherName: '',
    motherName: '',
    classVal: '1',
    section: 'A',
    rollNo: '',
    mobileNumber: '',
    address: '',
    hasCustomConcession: false,
    annualFee: '',
    monthlyTuitionFee: '',
    examFee: '',
    computerFee: ''
  });

  const [isCollectingFee, setIsCollectingFee] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Cash'); // 'Cash' or 'Online'

  // Archive Student States
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState('Locked / Left');
  const [archiveReason, setArchiveReason] = useState('');
  const [isSubmittingArchive, setIsSubmittingArchive] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [selectedFeeComponents, setSelectedFeeComponents] = useState([]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const getFeeComponentsList = (student) => {
    if (!student) return [];
    const list = [];

    // 1. Annual Fee
    const annualVal = student.annualFee || 0;
    list.push({
      id: 'ANNUAL',
      name: 'Annual / Admission Fee',
      amount: annualVal,
      category: 'ANNUAL'
    });

    // 2. Exam Fee
    const examVal = student.examFee || 0;
    list.push({ id: 'EXAM_TERM_1', name: 'Exam Fee — Term 1', amount: examVal, category: 'EXAM' });
    list.push({ id: 'EXAM_TERM_2', name: 'Exam Fee — Term 2', amount: examVal, category: 'EXAM' });
    list.push({ id: 'EXAM_TERM_3', name: 'Exam Fee — Term 3', amount: examVal, category: 'EXAM' });
    list.push({ id: 'EXAM_TERM_4', name: 'Exam Fee — Term 4', amount: examVal, category: 'EXAM' });

    // 3. Computer Fee
    const computerVal = student.computerFee || 0;
    list.push({ id: 'COMPUTER_TERM_1', name: 'Computer Fee — Term 1', amount: computerVal, category: 'COMPUTER' });
    list.push({ id: 'COMPUTER_TERM_2', name: 'Computer Fee — Term 2', amount: computerVal, category: 'COMPUTER' });

    // 4. Monthly Tuition Fee
    const tuitionVal = student.monthlyTuitionFee || 0;
    const months = [
      'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'January', 'February', 'March'
    ];
    months.forEach((m) => {
      list.push({
        id: `TUITION_${m.toUpperCase()}`,
        name: `Tuition — ${m}`,
        amount: tuitionVal,
        category: 'TUITION'
      });
    });

    return list.map(item => {
      const isPaid = (student.paymentHistory || []).some(pay => {
        const payRemarks = pay.remarks || '';
        return payRemarks.split(',').map(s => s.trim()).includes(item.name);
      });
      return {
        ...item,
        alreadyPaid: isPaid
      };
    });
  };

  const handleComponentToggle = (name) => {
    setSelectedFeeComponents(prev => {
      if (prev.includes(name)) {
        return prev.filter(item => item !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const getCollectTotal = () => {
    const list = getFeeComponentsList(selectedStudent);
    return list
      .filter(item => !item.alreadyPaid && selectedFeeComponents.includes(item.name))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = getCollectTotal();
    if (totalAmount <= 0) {
      alert('Please select at least one unpaid component to pay.');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const payload = {
        amount: totalAmount,
        mode: paymentMode,
        date: paymentDate,
        remarks: selectedFeeComponents.join(', ')
      };

      const response = await axios.post(
        `${API}/api/admin/students/${selectedStudent._id}/payments`,
        payload,
        { withCredentials: true }
      );

      const updatedStudent = response.data.student;
      setSelectedStudent(updatedStudent);
      setStudentsList(prev => prev.map(s => s._id === updatedStudent._id ? updatedStudent : s));
      setIsCollectingFee(false);
      alert('Payment recorded successfully!');
    } catch (err) {
      console.error('Failed to submit payment:', err);
      alert(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleAddPaymentClick = () => {
    if (!selectedStudent) return;
    setPaymentMode('Cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentRemarks('');
    setSelectedFeeComponents([]);
    setIsCollectingFee(true);
  };

  const handleAdmitClick = async () => {
    setAddForm({
      name: '',
      dob: '',
      fatherName: '',
      motherName: '',
      classVal: '1',
      section: 'A',
      rollNo: '',
      mobileNumber: '',
      address: '',
      hasCustomConcession: false,
      annualFee: '',
      monthlyTuitionFee: '',
      examFee: '',
      computerFee: ''
    });
    setSelectedAddFile(null);
    try {
      const response = await axios.get(`${API}/api/admin/students/next-admission-id`, { withCredentials: true });
      setNextAdmissionId(response.data.nextAdmissionId);
    } catch (err) {
      console.error('Failed to fetch next admission ID:', err);
    }
    setIsAddingStudent(true);
  };

  const handleAddFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFileChange = (e) => {
    setSelectedAddFile(e.target.files[0]);
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    setIsAdmittingStudent(true);
    try {
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('dob', addForm.dob);
      formData.append('fatherName', addForm.fatherName);
      formData.append('motherName', addForm.motherName);
      formData.append('classVal', addForm.classVal);
      formData.append('section', addForm.section);
      formData.append('rollNo', addForm.rollNo);
      formData.append('mobileNumber', addForm.mobileNumber);
      formData.append('address', addForm.address);

      formData.append('hasCustomConcession', addForm.hasCustomConcession ? 'true' : 'false');
      if (addForm.hasCustomConcession) {
        formData.append('annualFee', addForm.annualFee);
        formData.append('monthlyTuitionFee', addForm.monthlyTuitionFee);
        formData.append('examFee', addForm.examFee);
        formData.append('computerFee', addForm.computerFee / 2);
      }

      if (selectedAddFile) {
        formData.append('photo', selectedAddFile);
      }

      const response = await axios.post(
        `${API}/api/admin/students`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      // Refresh student list and auto-select the newly added student
      setIsAddingStudent(false);
      setSelectedAddFile(null);

      const listRes = await axios.get(`${API}/api/admin/students`, { withCredentials: true });
      setStudentsList(listRes.data || []);

      setSelectedStudent(response.data.student);
    } catch (err) {
      console.error('Failed to admit student:', err.message);
      alert(err.response?.data?.message || 'Failed to admit student. Please try again.');
    } finally {
      setIsAdmittingStudent(false);
    }
  };

  const handleEditClick = () => {
    if (!selectedStudent) return;
    setEditForm({
      name: selectedStudent.name || '',
      fatherName: selectedStudent.fatherName || '',
      motherName: selectedStudent.motherName || 'Rekha Mishra',
      admissionId: selectedStudent.admissionId || '',
      classVal: selectedStudent.class || '',
      section: selectedStudent.section || '',
      rollNo: selectedStudent.rollNo || '',
      dob: selectedStudent.dob || '',
      mobileNumber: selectedStudent.mobileNumber || '',
      address: selectedStudent.address || '',
      hasCustomConcession: selectedStudent.hasCustomConcession || false,
      annualFee: selectedStudent.annualFee !== undefined ? selectedStudent.annualFee : '',
      monthlyTuitionFee: selectedStudent.monthlyTuitionFee !== undefined ? selectedStudent.monthlyTuitionFee : '',
      examFee: selectedStudent.examFee !== undefined ? selectedStudent.examFee : '',
      computerFee: selectedStudent.computerFee !== undefined ? selectedStudent.computerFee * 2 : ''
    });
    setSelectedFile(null);
    setRemovePhotoFlag(false);
    setIsEditingStudent(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleRemovePhotoClick = () => {
    setRemovePhotoFlag(true);
    setSelectedFile(null);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSavingStudent(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('fatherName', editForm.fatherName);
      formData.append('motherName', editForm.motherName);
      formData.append('admissionId', editForm.admissionId);
      formData.append('classVal', editForm.classVal);
      formData.append('section', editForm.section);
      formData.append('rollNo', editForm.rollNo);
      formData.append('dob', editForm.dob);
      formData.append('mobileNumber', editForm.mobileNumber);
      formData.append('address', editForm.address);
      formData.append('removePhoto', removePhotoFlag ? 'true' : 'false');

      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      formData.append('hasCustomConcession', editForm.hasCustomConcession ? 'true' : 'false');
      if (editForm.hasCustomConcession) {
        formData.append('annualFee', editForm.annualFee);
        formData.append('monthlyTuitionFee', editForm.monthlyTuitionFee);
        formData.append('examFee', editForm.examFee);
        formData.append('computerFee', editForm.computerFee / 2);
      }

      const response = await axios.put(
        `${API}/api/admin/students/${selectedStudent._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      // Update local states
      setSelectedStudent(response.data.student);
      setStudentsList(prev => prev.map(s => s._id === selectedStudent._id ? response.data.student : s));
      setIsEditingStudent(false);
      setSelectedFile(null);
      setRemovePhotoFlag(false);
    } catch (err) {
      console.error('Failed to update student profile:', err.message);
      alert(err.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleArchiveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmittingArchive(true);
    try {
      await axios.post(
        `${API}/api/admin/students/${selectedStudent._id}/archive`,
        { status: archiveStatus, reason: archiveReason },
        { withCredentials: true }
      );
      // Remove from active list
      setStudentsList(prev => prev.filter(s => s._id !== selectedStudent._id));
      setSelectedStudent(null);
      setArchiveModalOpen(false);
      setArchiveReason('');
    } catch (err) {
      console.error('Failed to archive student:', err.message);
      alert(err.response?.data?.message || 'Failed to archive student.');
    } finally {
      setIsSubmittingArchive(false);
    }
  };

  // Load user details
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch students from backend matching filters
  useEffect(() => {
    setLoadingStudents(true);

    const params = {};
    if (filterClass !== 'All classes') params.className = filterClass;
    if (filterSection !== 'All sections') params.section = filterSection;
    if (filterRoll) params.rollNo = filterRoll;
    if (searchName) params.search = searchName;
    if (filterConcession === 'Scholarship') params.hasCustomConcession = 'true';
    if (filterConcession === 'Regular') params.hasCustomConcession = 'false';

    axios.get(`${API}/api/admin/students`, {
      withCredentials: true,
      params
    })
      .then(res => {
        setStudentsList(res.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch students from backend:', err.message);
        setStudentsList([]); // Empty state on backend error (no fake fallback)
      })
      .finally(() => {
        setLoadingStudents(false);
      });
  }, [filterClass, filterSection, filterRoll, searchName, filterConcession]);

  const handleClearFilters = () => {
    setFilterClass('All classes');
    setFilterSection('All sections');
    setFilterRoll('');
    setFilterConcession('All');
    setSearchName('');
    setCurrentPage(1);
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

  const formatRupee = (value) => {
    if (value === null || value === undefined) return '₹-';
    if (value === 0 || value === '0') return '₹0';
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

  // Pagination config (10 students per page as requested)
  const itemsPerPage = 10;
  const totalPages = Math.max(Math.ceil(studentsList.length / itemsPerPage), 1);
  const paginatedStudents = studentsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                      // Navigate to dashboard if placeholder tab clicked
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
        <header className={`flex h-16 items-center justify-between border-b transition-colors duration-500 px-6 py-3.5 lg:px-8 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-300 bg-white'}`}>
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`rounded-lg p-1.5 lg:hidden cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className={`font-serif text-2xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Students</span>
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
          {!selectedStudent && (
            <div className="space-y-6">
              {/* Header titles row */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>
                <div className="space-y-1">
                  <h1 className={`font-serif text-3xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Student Management</h1>
                  <p className={`text-sm font-medium transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Search and manage all students. Filters work independently.</p>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="text-xs font-semibold text-slate-500">
                    Showing <span className={`font-bold transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{studentsList.length}</span> of <span className={`font-bold transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{studentsList.length}</span>
                  </span>
                  <button
                    onClick={handleAdmitClick}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md active:scale-97 cursor-pointer"
                  >
                    <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    <span>Admit New Student</span>
                  </button>
                </div>
              </div>

              {/* Search Filters Card */}
              <div className={`rounded-3xl p-6 border shadow-xs flex flex-col space-y-3 transition-all duration-500 delay-100 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 items-end">

                  {/* Select Class */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-500">Class</label>
                    <select
                      value={filterClass}
                      onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
                      className={`block w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-hidden cursor-pointer transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                    >
                      {['All classes', 'Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Section */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-500">Section</label>
                    <select
                      value={filterSection}
                      onChange={(e) => { setFilterSection(e.target.value); setCurrentPage(1); }}
                      className={`block w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-hidden cursor-pointer transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                    >
                      {['All sections', 'A', 'B', 'C', '-'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Roll number input */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-500">Roll No.</label>
                    <input
                      type="number"
                      value={filterRoll}
                      onChange={(e) => { setFilterRoll(e.target.value); setCurrentPage(1); }}
                      placeholder="e.g. 5"
                      className={`block w-full rounded-2xl border px-4 py-3 text-sm font-semibold placeholder-slate-400 outline-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                    />
                  </div>

                  {/* Select Scholarship/Concession */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-500">Scholarship Status</label>
                    <select
                      value={filterConcession}
                      onChange={(e) => { setFilterConcession(e.target.value); setCurrentPage(1); }}
                      className={`block w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-hidden cursor-pointer transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400' : 'bg-white border-slate-200 text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                    >
                      <option value="All">All Students</option>
                      <option value="Scholarship">Scholarship Only</option>
                      <option value="Regular">Regular Only</option>
                    </select>
                  </div>

                  {/* Search Student Name input */}
                  <div className="lg:col-span-4 space-y-2">
                    <label className="block text-sm font-medium text-slate-500">Student Name</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        value={searchName}
                        onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }}
                        placeholder="Type a name..."
                        className={`block w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-semibold placeholder-slate-400 outline-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400' : 'bg-white border-slate-200 text-slate-880 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f]'}`}
                      />
                    </div>
                  </div>

                </div>

                {/* Clear action button */}
                <div className="flex justify-end pr-1">
                  <button
                    onClick={handleClearFilters}
                    className={`text-xs font-bold transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                    Clear filters
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className={`rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between min-h-[360px] transition-all duration-500 delay-200 transform ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className={`border-b text-[12px] font-bold tracking-wider uppercase transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'border-slate-100 bg-[#F2F5F9] text-[#596475]'}`}>
                        <th className="px-6 py-4.5">STUDENT</th>
                        <th className="px-6 py-4.5">FATHER'S NAME</th>
                        <th className="px-6 py-4.5">CLASS</th>
                        <th className="px-6 py-4.5">SECTION</th>
                        <th className="px-6 py-4.5">ADMISSION</th>
                        <th className="px-6 py-4.5">ROLL</th>
                        <th className="px-6 py-4.5 text-right pr-12">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors duration-500 ${darkMode ? 'divide-slate-700' : 'divide-slate-100/70'}`}>
                      {loadingStudents ? (
                        <tr>
                          <td colSpan="7" className="text-center py-16 text-sm text-slate-400 font-semibold">
                            Loading students list...
                          </td>
                        </tr>
                      ) : studentsList.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-16 text-sm text-slate-400 font-semibold">
                            No students found in the database.
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((student) => (
                          <tr key={student.admissionId || student._id} className={`transition-colors text-[13px] ${darkMode ? 'text-slate-300 hover:bg-slate-700/50 border-slate-700' : 'text-slate-700 hover:bg-slate-50/40'}`}>

                            {/* Avatar Profile and Mobile */}
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                {student.photo ? (
                                  <img
                                    src={student.photo}
                                    alt={student.name}
                                    className="h-10 w-10 shrink-0 rounded-full object-cover shadow-2xs border border-slate-200/50"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2f6] text-[#0a1e3f] font-bold text-[15px] shadow-2xs">
                                    {student.name ? student.name[0] : 'S'}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className={`font-semibold text-[14px] leading-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>{student.name}</span>
                                    {student.hasCustomConcession && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-[#E0F2FE] text-[#0369A1] uppercase tracking-wider scale-95 origin-left">
                                        Schol.
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-[12px] mt-0.5 transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-[#596475]'}`}>{student.mobileNumber}</span>
                                </div>
                              </div>
                            </td>

                            {/* Father name */}
                            <td className={`px-6 py-4 align-middle font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{student.fatherName || student.fatherNameVal || 'N/A'}</td>

                            {/* Class name */}
                            <td className={`px-6 py-4 align-middle font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{student.class}</td>

                            {/* Section name */}
                            <td className={`px-6 py-4 align-middle font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{student.section}</td>

                            {/* Admission ID */}
                            <td className={`px-6 py-4 align-middle font-semibold font-mono text-[12px] transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{student.admissionId}</td>

                            {/* Roll number */}
                            <td className={`px-6 py-4 align-middle font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{student.rollNo}</td>

                            {/* Action Trigger */}
                            <td className="px-6 py-4 align-middle text-right pr-8 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#0a1e3f] hover:bg-[#153466] px-4 py-2 text-xs font-semibold text-white transition-all active:scale-97 cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="whitespace-nowrap">Read More</span>
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Pagination Controls */}
                {!loadingStudents && studentsList.length > 0 && (
                  <div className={`flex items-center justify-between border-t px-6 py-4 transition-colors duration-500 ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100/80 bg-slate-50/10'}`}>
                    <span className="text-xs font-bold text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`flex h-8 w-8 items-center justify-center rounded-full active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs cursor-pointer ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`flex h-8 w-8 items-center justify-center rounded-full active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs cursor-pointer ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 2. DETAILED PROFILE VIEW (Rendered if a student is selected) */}
          {selectedStudent && (
            <div className="space-y-6 animate-fade-in">

              {/* Actions Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {/* Back Link */}
                <button
                  onClick={() => setSelectedStudent(null)}
                  className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                  <span>Back to students</span>
                </button>

                {/* Lock, Password Reset, Edit triggers */}
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => setArchiveModalOpen(true)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all shadow-2xs cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    <Archive className="h-4 w-4 stroke-[2.2] text-amber-500" />
                    <span>Archive</span>
                  </button>
                  <button className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all shadow-2xs cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    <Key className="h-4 w-4 stroke-[2.2] text-slate-500" />
                    <span>Reset Password</span>
                  </button>
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md active:scale-97 cursor-pointer"
                  >
                    <Edit className="h-4 w-4 stroke-[2.2]" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Dual-Column Layout Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Card: Student Summary Panel */}
                <div className={`lg:col-span-4 rounded-3xl p-6 border shadow-xs flex flex-col items-center transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'}`}>

                  {/* Initials, name, key metadata */}
                  {selectedStudent.photo ? (
                    <img
                      src={selectedStudent.photo}
                      alt={selectedStudent.name}
                      className="h-28 w-28 shrink-0 rounded-full object-cover shadow-sm border border-slate-200/50 mb-4"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#0a1e3f] text-white font-bold text-4xl shadow-sm mb-4">
                      {selectedStudent.name ? selectedStudent.name[0] : 'S'}
                    </div>
                  )}
                  <h2 className={`font-serif text-2xl font-bold text-center leading-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>{selectedStudent.name}</h2>
                  <span className="text-sm font-semibold text-slate-500 mt-1 text-center">
                    Class {selectedStudent.class} · Section {selectedStudent.section} · Roll {selectedStudent.rollNo}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-400 mt-1.5 uppercase tracking-wide">
                    {selectedStudent.admissionId}
                  </span>

                  {/* Attributes Details rows */}
                  <div className={`space-y-4 pt-6 mt-6 border-t w-full text-xs font-semibold transition-colors duration-500 ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-700'}`}>

                    {/* FATHER */}
                    <div className="flex items-start gap-3.5">
                      <Users className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FATHER</span>
                        <span className={`font-bold mt-0.5 text-[14px] transition-colors duration-500 ${darkMode ? 'text-slate-100' : 'text-[#0a1e3f]'}`}>{selectedStudent.fatherName || selectedStudent.fatherNameVal || 'N/A'}</span>
                      </div>
                    </div>

                    {/* MOTHER */}
                    <div className="flex items-start gap-3.5">
                      <Users className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MOTHER</span>
                        <span className={`font-bold mt-0.5 text-[14px] transition-colors duration-500 ${darkMode ? 'text-slate-100' : 'text-[#0a1e3f]'}`}>{selectedStudent.motherName || 'Rekha Mishra'}</span>
                      </div>
                    </div>

                    {/* DOB */}
                    <div className="flex items-start gap-3.5">
                      <Calendar className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOB</span>
                        <span className={`font-bold mt-0.5 text-[14px] transition-colors duration-500 ${darkMode ? 'text-slate-100' : 'text-[#0a1e3f]'}`}>{selectedStudent.dob || 'N/A'}</span>
                      </div>
                    </div>

                    {/* MOBILE */}
                    <div className="flex items-start gap-3.5">
                      <svg className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MOBILE</span>
                        <span className={`font-bold mt-0.5 text-[14px] transition-colors duration-500 ${darkMode ? 'text-slate-100' : 'text-[#0a1e3f]'}`}>{selectedStudent.mobileNumber || 'N/A'}</span>
                      </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="flex items-start gap-3.5">
                      <MapPin className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ADDRESS</span>
                        <span className={`font-bold mt-0.5 text-[14px] leading-tight transition-colors duration-500 ${darkMode ? 'text-slate-100' : 'text-[#0a1e3f]'}`}>{selectedStudent.address || 'N/A'}</span>
                      </div>
                    </div>

                    {/* ADMISSION */}
                    <div className="flex items-start gap-3.5">
                      <CreditCard className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ADMISSION</span>
                        <span className={`font-bold mt-0.5 text-[14px] transition-colors duration-500 ${darkMode ? 'text-slate-100' : 'text-[#0a1e3f]'}`}>{selectedStudent.admissionId || 'N/A'}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Right Cards: Fee Summary & History Panel */}
                <div className="lg:col-span-8 space-y-6">

                  {/* Fee calculations card */}
                  <div className={`rounded-3xl p-6 border shadow-xs space-y-6 transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'}`}>

                    {/* Fee header summary */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className={`text-xl font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Fee Summary</h3>
                        <p className="text-slate-400 text-xs font-semibold">Auto-calculated for Class {selectedStudent.class}</p>
                      </div>
                      <button
                        onClick={handleAddPaymentClick}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#fbc02d] hover:bg-[#e0a800] px-4.5 py-2.5 text-xs font-bold text-[#0a1e3f] transition-all cursor-pointer shadow-xs active:scale-97"
                      >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Add Payment</span>
                      </button>
                    </div>

                    {/* 3 Metrics containers */}
                    <div className="grid grid-cols-3 gap-4">

                      {/* Total Fee card */}
                      <div className={`rounded-2xl p-4.5 border space-y-1 transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-700/50 text-slate-200' : 'bg-[#EEF0F3] border-slate-200/10'}`}>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">TOTAL FEE</span>
                        <span className={`block text-3xl font-bold font-serif leading-none mt-1 transition-colors duration-500 ${darkMode ? 'text-white' : 'text-[#0a1e3f]'}`}>
                          {formatRupee(selectedStudent.totalFee || selectedStudent.annualFee)}
                        </span>
                      </div>

                      {/* Paid card */}
                      <div className="bg-[#E2F7E9] rounded-2xl p-4.5 border border-emerald-100/50 space-y-1">
                        <span className="text-[10px] font-bold text-[#006837] uppercase tracking-wide">PAID</span>
                        <span className="block text-3xl font-bold text-[#006837] font-serif leading-none mt-1">
                          {formatRupee(selectedStudent.paidFee)}
                        </span>
                      </div>

                      {/* Due card */}
                      <div className="bg-[#FFE9E9] rounded-2xl p-4.5 border border-red-100/50 space-y-1">
                        <span className="text-[10px] font-bold text-[#C1272D] uppercase tracking-wide">DUE</span>
                        <span className="block text-3xl font-bold text-[#C1272D] font-serif leading-none mt-1">
                          {formatRupee(selectedStudent.dueFee)}
                        </span>
                      </div>

                    </div>

                    {/* Itemized row list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Annual */}
                      <div className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-semibold transition-colors duration-500 ${darkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-[#F2F5F9] text-slate-800'}`}>
                        <span className="text-slate-500">Annual fee</span>
                        <span className={`font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatRupee(selectedStudent.annualFee || 0)}</span>
                      </div>

                      {/* Monthly Tuition */}
                      <div className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-semibold transition-colors duration-500 ${darkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-[#F2F5F9] text-slate-800'}`}>
                        <span className="text-slate-500">Monthly tuition × 12 ({formatRupee(selectedStudent.monthlyTuitionFee || 0)}/mo)</span>
                        <span className={`font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatRupee((selectedStudent.monthlyTuitionFee || 0) * 12)}</span>
                      </div>

                      {/* Exam Fee */}
                      <div className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-semibold transition-colors duration-500 ${darkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-[#F2F5F9] text-slate-800'}`}>
                        <span className="text-slate-500">Exam fee (×4 / yr)</span>
                        <span className={`font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatRupee((selectedStudent.examFee || 0) * 4)}</span>
                      </div>

                      {/* Computer Fee */}
                      <div className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-semibold transition-colors duration-500 ${darkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-[#F2F5F9] text-slate-800'}`}>
                        <span className="text-slate-500">Computer fee (×2 / yr)</span>
                        <span className={`font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatRupee(selectedStudent.computerFee || 0)}</span>
                      </div>

                    </div>

                  </div>

                  {/* Payment history list */}
                  <div className={`rounded-3xl p-6 border shadow-xs space-y-4 transition-colors duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'}`}>
                    <div className="space-y-1">
                      <h3 className={`text-lg font-bold transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Payment History</h3>
                      <p className="text-slate-400 text-xs font-semibold">
                        {selectedStudent.paymentHistory ? selectedStudent.paymentHistory.length : 0} payment(s)
                      </p>
                    </div>

                    {/* Table grid */}
                    <div className={`border rounded-2xl overflow-auto max-h-[320px] scrollbar-thin transition-colors duration-500 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <table className="w-full text-left border-collapse text-[13px] min-w-[700px]">
                        <thead className={`sticky top-0 z-10 border-b transition-colors duration-500 ${darkMode ? 'bg-slate-950 border-slate-700 text-slate-400' : 'bg-[#F2F5F9] border-slate-200 text-[#596475]'}`}>
                          <tr className="text-[12px] font-bold tracking-wider uppercase">
                            <th className="px-5 py-3">RECEIPT</th>
                            <th className="px-5 py-3">DATE</th>
                            <th className="px-5 py-3">AMOUNT</th>
                            <th className="px-5 py-3">MODE</th>
                            <th className="px-5 py-3 w-[240px]">REMARKS</th>
                            <th className="px-5 py-3 text-right pr-8 w-28">RECEIPT</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y transition-colors duration-500 ${darkMode ? 'divide-slate-700' : 'divide-slate-100/70'}`}>
                          {!selectedStudent.paymentHistory || selectedStudent.paymentHistory.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-8 text-xs text-slate-400 font-semibold">
                                No payment receipts issued.
                              </td>
                            </tr>
                          ) : (
                            selectedStudent.paymentHistory.map((pay) => (
                              <tr key={pay.receiptNo || pay._id} className={`transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50/30'}`}>
                                <td className={`px-5 py-3.5 font-mono text-[12px] font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-[#596475]'}`}>{pay.receiptNo}</td>
                                <td className={`px-5 py-3.5 font-semibold transition-colors duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{pay.date}</td>
                                <td className={`px-5 py-3.5 font-bold text-[14px] transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatRupee(pay.amount)}</td>
                                <td className="px-5 py-3.5">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E2F7E9] text-[#006837] px-3 py-1 text-[11px] font-bold border border-emerald-200/10">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#006837] shrink-0"></span>
                                    {pay.mode}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 w-[240px]">
                                  <div className="max-w-[220px] overflow-x-auto whitespace-nowrap scrollbar-thin text-slate-500 font-semibold pb-1">
                                    {pay.remarks || 'Term fee'}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-right pr-8 w-28 shrink-0">
                                  <div className="flex justify-end gap-3.5">
                                    {/* Download receipt trigger */}
                                    <button className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-[#0a1e3f]'}`}>
                                      <Download className="h-4.5 w-4.5 stroke-[2.2]" />
                                    </button>
                                    {/* Print receipt trigger */}
                                    <button className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-[#0a1e3f]'}`}>
                                      <Printer className="h-4.5 w-4.5 stroke-[2.2]" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}
        </main>
      </div>

      {/* 5. Edit Student Modal Dialog */}
      {isEditingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in animate-duration-200">
          <div className="w-full max-w-[600px] rounded-3xl bg-white p-5 border border-slate-150 shadow-2xl space-y-4 animate-zoom-in relative">

            {/* Top Close trigger */}
            <button
              onClick={() => setIsEditingStudent(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Modal Header */}
            <h3 className="font-serif text-lg font-bold text-slate-900 pb-1.5 border-b border-slate-100">
              Edit Student
            </h3>

            {/* Form */}
            <form onSubmit={handleSaveChanges} className="space-y-3">

              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">

                {/* Student Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Student Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleFormChange}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Father's Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={editForm.fatherName}
                    onChange={handleFormChange}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Mother's Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mother's Name</label>
                  <input
                    type="text"
                    name="motherName"
                    value={editForm.motherName}
                    onChange={handleFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Admission No. */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Admission No.</label>
                  <input
                    type="text"
                    name="admissionId"
                    value={editForm.admissionId}
                    onChange={handleFormChange}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Class Select */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Class</label>
                  <select
                    name="classVal"
                    value={editForm.classVal}
                    onChange={handleFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    {['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Section Select */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Section</label>
                  <select
                    name="section"
                    value={editForm.section}
                    onChange={handleFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    {['A', 'B', 'C', '-'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Roll No */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Roll No.</label>
                  <input
                    type="number"
                    name="rollNo"
                    value={editForm.rollNo}
                    onChange={handleFormChange}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* DOB Date Picker */}
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">DOB</label>
                  <input
                    type="date"
                    name="dob"
                    value={editForm.dob}
                    onChange={handleFormChange}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={editForm.mobileNumber}
                    onChange={handleFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Upload Photo */}
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Upload Photo</label>
                  {selectedStudent.photo && !removePhotoFlag ? (
                    <div className="flex items-center gap-2 py-1">
                      <img
                        src={selectedStudent.photo}
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
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-[11px] font-semibold text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#0a1e3f]/10 file:text-[#0a1e3f] hover:file:bg-[#0a1e3f]/20 file:cursor-pointer cursor-pointer"
                    />
                  )}
                </div>

                {/* Address (Spans both columns) */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleFormChange}
                    rows="2"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden resize-none"
                  />
                </div>

                {/* Custom Concession Checkbox */}
                <div className="col-span-2 flex items-center gap-2.5 py-1 border-t border-slate-100 mt-2">
                  <input
                    type="checkbox"
                    id="editHasCustomConcession"
                    name="hasCustomConcession"
                    checked={editForm.hasCustomConcession}
                    onChange={handleFormChange}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#0a1e3f] focus:ring-[#0a1e3f] cursor-pointer"
                  />
                  <label htmlFor="editHasCustomConcession" className="text-xs font-bold text-[#0a1e3f] uppercase tracking-wide cursor-pointer select-none">
                    Special Concession (Custom Fees)
                  </label>
                </div>

                {/* Concession Inputs (Visible only if checkbox is checked) */}
                {editForm.hasCustomConcession && (
                  <div className="col-span-2 grid grid-cols-4 gap-3 bg-[#eef2f6]/40 p-3 rounded-2xl border border-slate-200/50 mt-1">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Annual Fee</label>
                      <input
                        type="number"
                        name="annualFee"
                        value={editForm.annualFee}
                        onChange={handleFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Monthly Tuition</label>
                      <input
                        type="number"
                        name="monthlyTuitionFee"
                        value={editForm.monthlyTuitionFee}
                        onChange={handleFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Exam Fee</label>
                      <input
                        type="number"
                        name="examFee"
                        value={editForm.examFee}
                        onChange={handleFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Computer Fee (Yr)</label>
                      <input
                        type="number"
                        name="computerFee"
                        value={editForm.computerFee}
                        onChange={handleFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom buttons row */}
              <div className="flex justify-end gap-3.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingStudent}
                  onClick={() => setIsEditingStudent(false)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStudent}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-97 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                >
                  {isSavingStudent ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      <span>Save changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* 4. NEW ADMISSION MODAL (Popup Overlay) */}
      {isAddingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in animate-duration-200">
          <div className="w-full max-w-[620px] rounded-3xl bg-white p-5 border border-slate-100 shadow-2xl space-y-4 animate-zoom-in relative">

            {/* Close Button */}
            <button
              onClick={() => setIsAddingStudent(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header info matching screenshot */}
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              </div>
              <div className="space-y-0.5">
                <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight">New Admission</h3>
                <p className="text-[11px] font-bold text-slate-400 tracking-wide">
                  Admission No. <span className="text-[#0a1e3f]">{nextAdmissionId}</span> will be assigned automatically.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                {/* Student Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Student Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={addForm.name}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* DOB */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={addForm.dob}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  />
                </div>

                {/* Father's Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Father's Name *</label>
                  <input
                    type="text"
                    name="fatherName"
                    required
                    value={addForm.fatherName}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Mother's Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mother's Name *</label>
                  <input
                    type="text"
                    name="motherName"
                    required
                    value={addForm.motherName}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Class */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Class *</label>
                  <select
                    name="classVal"
                    required
                    value={addForm.classVal}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    {['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Section *</label>
                  <select
                    name="section"
                    required
                    value={addForm.section}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  >
                    {['A', 'B', 'C', 'D', '-'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Roll No */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Roll No. *</label>
                  <input
                    type="text"
                    name="rollNo"
                    required
                    value={addForm.rollNo}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile (10 digits) *</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    required
                    value={addForm.mobileNumber}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>

                {/* Upload Photo */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddFileChange}
                    className="block w-full text-[11px] font-semibold text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#0a1e3f]/10 file:text-[#0a1e3f] hover:file:bg-[#0a1e3f]/20 file:cursor-pointer cursor-pointer"
                  />
                </div>

                {/* Address */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Address</label>
                  <textarea
                    name="address"
                    rows="2"
                    value={addForm.address}
                    onChange={handleAddFormChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden resize-none"
                  />
                </div>

                {/* Custom Concession Checkbox */}
                <div className="col-span-2 flex items-center gap-2.5 py-1 border-t border-slate-100 mt-2">
                  <input
                    type="checkbox"
                    id="addHasCustomConcession"
                    name="hasCustomConcession"
                    checked={addForm.hasCustomConcession}
                    onChange={handleAddFormChange}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#0a1e3f] focus:ring-[#0a1e3f] cursor-pointer"
                  />
                  <label htmlFor="addHasCustomConcession" className="text-xs font-bold text-[#0a1e3f] uppercase tracking-wide cursor-pointer select-none">
                    Special Concession (Custom Fees)
                  </label>
                </div>

                {/* Concession Inputs (Visible only if checkbox is checked) */}
                {addForm.hasCustomConcession && (
                  <div className="col-span-2 grid grid-cols-4 gap-3 bg-[#eef2f6]/40 p-3 rounded-2xl border border-slate-200/50 mt-1">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Annual Fee</label>
                      <input
                        type="number"
                        name="annualFee"
                        value={addForm.annualFee}
                        onChange={handleAddFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Monthly Tuition</label>
                      <input
                        type="number"
                        name="monthlyTuitionFee"
                        value={addForm.monthlyTuitionFee}
                        onChange={handleAddFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Exam Fee</label>
                      <input
                        type="number"
                        name="examFee"
                        value={addForm.examFee}
                        onChange={handleAddFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Computer Fee (Yr)</label>
                      <input
                        type="number"
                        name="computerFee"
                        value={addForm.computerFee}
                        onChange={handleAddFormChange}
                        required
                        className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-[#0a1e3f] outline-hidden"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom buttons row */}
              <div className="flex justify-end gap-3.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isAdmittingStudent}
                  onClick={() => setIsAddingStudent(false)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdmittingStudent}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0a1e3f] hover:bg-[#153466] px-5 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-97 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                >
                  {isAdmittingStudent ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Admitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Admit Student</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Collect Fee Modal */}
      {isCollectingFee && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#203a5e] text-white px-6 py-5 relative shrink-0">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-0.5">LOYOLA EMS · FEE PAYMENT</span>
              <h2 className="text-2xl font-bold font-serif">Collect Fees — {selectedStudent.name}</h2>
              <p className="text-xs font-semibold text-slate-200 mt-1">
                Class {selectedStudent.class}-{selectedStudent.section} · Roll {selectedStudent.rollNo} · LEMS-{selectedStudent.admissionId}
              </p>
              <button
                type="button"
                onClick={() => setIsCollectingFee(false)}
                className="absolute right-6 top-6 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <svg className="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="flex flex-col overflow-hidden">
              {/* Modal Scrollable Content */}
              <div className="overflow-y-auto p-6 space-y-5">
                {/* Payment Mode Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Cash Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('Cash')}
                      className={`flex items-center gap-3 rounded-2xl p-4 border text-left cursor-pointer transition-all ${paymentMode === 'Cash'
                        ? 'border-[#203a5e] bg-[#e4e8f1]/40 border-1.5'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl shrink-0 transition-colors ${paymentMode === 'Cash'
                        ? 'bg-[#0c2340] text-white'
                        : 'bg-[#f1f3f7] text-[#596475]'
                        }`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="12" cy="12" r="2" />
                          <path d="M6 12h.01M18 12h.01" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900 leading-tight">Cash</span>
                        <span className="text-[10px] text-slate-400 font-semibold">At school counter</span>
                      </div>
                    </button>

                    {/* Online Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('Online')}
                      className={`flex items-center gap-3 rounded-2xl p-4 border text-left cursor-pointer transition-all ${paymentMode === 'Online'
                        ? 'border-[#203a5e] bg-[#e4e8f1]/40 border-1.5'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl shrink-0 transition-colors ${paymentMode === 'Online'
                        ? 'bg-[#0c2340] text-white'
                        : 'bg-[#f1f3f7] text-[#596475]'
                        }`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900 leading-tight">Online</span>
                        <span className="text-[10px] text-slate-400 font-semibold">UPI · Card · Net Banking</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Date picker */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden cursor-pointer"
                  />
                </div>

                {/* Fee Components Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Fee Components</label>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {['ANNUAL', 'EXAM', 'COMPUTER', 'TUITION'].map(category => {
                      const categoryItems = getFeeComponentsList(selectedStudent).filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category} className="space-y-0.5">
                          {/* Category Header */}
                          <div className="flex items-center justify-between bg-[#f1f3f7] px-4 py-2.5 rounded-t-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-b-0 border-slate-200">
                            <span>{category}</span>
                            {category === 'ANNUAL' && <span className="text-slate-400 capitalize font-semibold normal-case">Greyed = already paid</span>}
                          </div>
                          {/* Category Items List Box */}
                          <div className="border border-slate-200 bg-white rounded-b-2xl p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryItems.map(item => {
                              const isChecked = item.alreadyPaid || selectedFeeComponents.includes(item.name);
                              return (
                                <label
                                  key={item.id}
                                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer select-none ${item.alreadyPaid
                                    ? 'border-emerald-100/70 bg-emerald-500/5 text-emerald-800/80 opacity-75 cursor-not-allowed'
                                    : isChecked
                                      ? 'border-[#203a5e] bg-[#e4e8f1]/30 text-slate-900 font-bold'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50/50'
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <input
                                      type="checkbox"
                                      disabled={item.alreadyPaid}
                                      checked={isChecked}
                                      onChange={() => handleComponentToggle(item.name)}
                                      className="h-4 w-4 rounded border-slate-300 text-[#203a5e] focus:ring-[#203a5e] cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <span className="flex items-center gap-1.5">
                                      {item.name}
                                      {item.alreadyPaid && (
                                        <span className="text-emerald-500 font-bold text-[13px] shrink-0" title="Paid">✓</span>
                                      )}
                                    </span>
                                  </div>
                                  <span className={`font-bold ${item.alreadyPaid ? 'text-slate-400' : 'text-slate-900'}`}>
                                    {formatRupee(item.amount)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Remarks Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Admission payment, First term dues"
                    value={paymentRemarks}
                    onChange={(e) => setPaymentRemarks(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0a1e3f] focus:ring-1 focus:ring-[#0a1e3f] outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-white shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL TO COLLECT</span>
                  <span className="text-3xl font-bold font-serif text-[#112440] leading-none mt-1">
                    {formatRupee(getCollectTotal())}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {selectedFeeComponents.length} item(s) selected
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingPayment}
                    onClick={() => setIsCollectingFee(false)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPayment || getCollectTotal() <= 0}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#e6ad12] hover:bg-[#d69d0d] px-6 py-3.5 text-xs font-bold text-[#0c2340] transition-all shadow-sm active:scale-97 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-[#0c2340]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : paymentMode === 'Online' ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
                        </svg>
                        Pay {formatRupee(getCollectTotal())} Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                        Collect {formatRupee(getCollectTotal())}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ARCHIVE STUDENT MODAL */}
      {archiveModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in text-slate-850">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-zoom-in">
            <div className="bg-[#0a1e3f] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-[#c59b27]" />
                <h3 className="font-bold text-[15px] font-serif">Archive Student</h3>
              </div>
              <button 
                type="button"
                onClick={() => setArchiveModalOpen(false)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="p-6 space-y-4 font-sans text-slate-800">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                You are archiving <strong>{selectedStudent.name}</strong>. Archived students will be moved out of the active list and stats counters.
              </p>

              {/* Archive Status */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Archive Status</label>
                <select
                  required
                  value={archiveStatus}
                  onChange={(e) => setArchiveStatus(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
                >
                  <option value="Passed Out">Passed Out (Graduate)</option>
                  <option value="Locked / Left">Locked / Left (Left School / Fees Defaulted / Transferred)</option>
                </select>
              </div>

              {/* Archive Reason */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason / Remarks</label>
                <textarea
                  required
                  rows="3"
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  placeholder="e.g. Left school on transfer, graduated, etc."
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-800 outline-hidden resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingArchive}
                  className="w-full bg-[#0a1e3f] hover:bg-[#153466] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-2xl cursor-pointer hover:shadow-md active:scale-97 transition-all duration-200 text-center font-serif"
                >
                  {isSubmittingArchive ? 'Archiving...' : 'Confirm Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
