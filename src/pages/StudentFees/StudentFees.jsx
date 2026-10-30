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
  Download,
  Printer,
  CheckCircle,
  ClipboardList,
  Wallet,
  Trophy,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';

export default function StudentFees() {
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
  const [loading, setLoading] = useState(!student);
  const [animate, setAnimate] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('studentDarkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('studentDarkMode', darkMode);
  }, [darkMode]);

  // Payment states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedFeeComponents, setSelectedFeeComponents] = useState([]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Load student profile on mount
  useEffect(() => {
    fetchStudentProfile();

    // Dynamically load Razorpay Checkout SDK script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);

    return () => {
      clearTimeout(timer);
      try {
        document.body.removeChild(script);
      } catch (e) { }
    };
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await axios.get(`${API}/api/student/profile`, {
        withCredentials: true
      });
      setStudent(response.data.user);

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.user) parsed.user = response.data.user;
          else parsed.paidFee = response.data.user.paidFee;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) { }
      }
    } catch (err) {
      console.error('Failed to load student profile:', err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err.message);
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatRupee = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  // Dynamic Fee Components list builder
  const getFeeComponentsList = (studentData) => {
    if (!studentData) return [];
    const list = [];

    // Annual
    if (studentData.annualFee > 0) {
      list.push({ id: 'annual', name: 'Annual / Admission Fee', amount: studentData.annualFee, category: 'ANNUAL' });
    }

    // Exams
    if (studentData.examFee > 0) {
      for (let i = 1; i <= 4; i++) {
        list.push({ id: `exam-${i}`, name: `Exam Fee — Term ${i}`, amount: studentData.examFee, category: 'EXAM' });
      }
    }

    // Computers
    if (studentData.computerFee > 0) {
      for (let i = 1; i <= 2; i++) {
        list.push({ id: `comp-${i}`, name: `Computer Fee — Term ${i}`, amount: studentData.computerFee, category: 'COMPUTER' });
      }
    }

    // Tuition Months
    const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    if (studentData.monthlyTuitionFee > 0) {
      months.forEach((m, idx) => {
        list.push({ id: `tuition-${idx}`, name: `Tuition — ${m}`, amount: studentData.monthlyTuitionFee, category: 'TUITION' });
      });
    }

    // Check which ones are already paid
    return list.map(item => {
      const alreadyPaid = (studentData.paymentHistory || []).some(pay => {
        const payRemarks = pay.remarks || '';
        return payRemarks.split(',').map(s => s.trim()).includes(item.name);
      });
      return { ...item, alreadyPaid };
    });
  };

  const handleComponentToggle = (name) => {
    if (selectedFeeComponents.includes(name)) {
      setSelectedFeeComponents(prev => prev.filter(c => c !== name));
    } else {
      setSelectedFeeComponents(prev => [...prev, name]);
    }
  };

  const getCollectTotal = () => {
    const list = getFeeComponentsList(student);
    return selectedFeeComponents.reduce((sum, name) => {
      const match = list.find(item => item.name === name);
      return sum + (match ? match.amount : 0);
    }, 0);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (selectedFeeComponents.length === 0 || isSubmittingPayment) return;

    setIsSubmittingPayment(true);
    const amount = getCollectTotal();

    try {
      // 1. Fetch public Key ID from server
      const keyRes = await axios.get(`${API}/api/student/payments/razorpay-key`, {
        withCredentials: true
      });
      const razorpayKey = keyRes.data.key;

      if (!razorpayKey) {
        throw new Error('Razorpay configuration key not loaded from the server.');
      }

      // 2. Create Order in Razorpay backend
      const orderRes = await axios.post(`${API}/api/student/payments/order`, {
        amount
      }, { withCredentials: true });

      const { order } = orderRes.data;

      // 3. Setup Razorpay Options
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: 'INR',
        name: 'Loyola EMS',
        description: 'School Fee Payment',
        order_id: order.id,
        handler: async function (response) {
          try {
            setIsSubmittingPayment(true);
            setPaymentSuccessMsg('Verifying Transaction Signature...');

            // 4. Verify signature on backend
            const verifyRes = await axios.post(`${API}/api/student/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount,
              remarks: selectedFeeComponents.join(', ')
            }, { withCredentials: true });

            setStudent(verifyRes.data.student);
            setPaymentSuccessMsg(`Success! Paid ${formatRupee(amount)} via Razorpay.`);
            setSelectedFeeComponents([]);

            // Update local storage
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              try {
                const parsed = JSON.parse(savedUser);
                if (parsed.user) parsed.user = verifyRes.data.student;
                else parsed.paymentHistory = verifyRes.data.student.paymentHistory;
                localStorage.setItem('user', JSON.stringify(parsed));
              } catch (e) {
                console.error(e);
              }
            }

            setTimeout(() => {
              setIsCheckoutOpen(false);
              setPaymentSuccessMsg('');
            }, 2000);
          } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Payment signature verification failed. Please contact school admin.');
            setPaymentSuccessMsg('');
          } finally {
            setIsSubmittingPayment(false);
          }
        },
        prefill: {
          name: student.name,
          contact: student.mobileNumber || ''
        },
        theme: {
          color: '#0a1e3f'
        },
        modal: {
          ondismiss: function () {
            setIsSubmittingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to initialize payment checkout.');
      setIsSubmittingPayment(false);
    }
  };

  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const remarksHtml = (receipt.remarks || 'Term Dues').split(', ').map(r => `<li>${r}</li>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${receipt.receiptNo}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .receipt-box { border: 2px solid #eaeaea; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px dashed #eaeaea; padding-bottom: 20px; margin-bottom: 25px; }
            .school-title { font-size: 24px; font-weight: bold; color: #203a5e; margin: 0; }
            .school-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-top: 5px; }
            .title { font-size: 18px; font-weight: bold; margin-top: 15px; color: #333; text-transform: uppercase; letter-spacing: 1px; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
            .meta-item { font-size: 13px; }
            .meta-label { color: #888; font-weight: bold; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px; }
            .meta-value { font-weight: 600; color: #111; }
            .items-list { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #eee; }
            .items-title { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 10px; margin-top: 0; }
            ul { padding-left: 20px; margin: 0; font-size: 13px; color: #444; }
            li { margin-bottom: 6px; }
            .footer-row { display: flex; justify-content: space-between; align-items: center; border-top: 2px dashed #eaeaea; padding-top: 20px; margin-top: 20px; }
            .total-label { font-size: 12px; font-weight: bold; color: #888; text-transform: uppercase; }
            .total-val { font-size: 24px; font-weight: bold; color: #203a5e; }
            .badge { display: inline-block; padding: 4px 10px; background: #e2f7e9; color: #006837; font-size: 11px; font-weight: bold; border-radius: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="school-title">LOYOLA EMS</div>
              <div class="school-subtitle">OFFICIAL FEE RECEIPT</div>
              <div class="title">Receipt Card</div>
            </div>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Receipt No</span>
                <span class="meta-value" style="font-family: monospace;">${receipt.receiptNo}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Payment Date</span>
                <span class="meta-value">${receipt.date}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Student Name</span>
                <span class="meta-value">${student.name}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Admission ID</span>
                <span class="meta-value">${student.admissionId}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Class & Roll</span>
                <span class="meta-value">Class ${student.class}-${student.section} · Roll ${student.rollNo}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Payment Mode</span>
                <span class="meta-value"><span class="badge">${receipt.mode}</span></span>
              </div>
            </div>
            
            <div class="items-list">
              <h4 class="items-title">Fee Components Settled</h4>
              <ul>${remarksHtml}</ul>
            </div>
            
            <div class="footer-row">
              <div>
                <span class="total-label">Total Paid Amount</span>
                <div class="total-val">${formatRupee(receipt.amount)}</div>
              </div>
              <div style="text-align: right; font-size: 10px; color: #aaa; margin-top: 15px;">
                Computer Generated Receipt<br>No Signature Required
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading && !student) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FBFAF6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0a1e3f] border-t-transparent"></div>
          <span className="text-sm font-bold text-[#0a1e3f]">Loading Fees & Payments...</span>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#FBFAF6] text-slate-800'} font-sans`}>

      {/* 1. LEFT SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-between bg-[#0a1e3f] py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="space-y-6">
          {/* Brand logo */}
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
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
              { name: 'My Profile', icon: User, path: '/student/profile' },
              { name: 'Attendance', icon: Calendar, path: '/student/attendance' },
              { name: 'Fees & Payments', icon: CreditCard, path: '/student/fees' },
              { name: 'Notices', icon: Bell, path: '/student/notices' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = item.path === '/student/fees';
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
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

        {/* Sidebar bottom */}
        <div className="border-t border-slate-800/80 px-6 pt-5 space-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{student.name}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">LEMS-{student.admissionId}</span>
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

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        ></div>
      )}

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Navbar */}
        <header className={`flex h-16 items-center justify-between border-b ${darkMode ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-300 bg-white'} px-6 lg:px-8 shrink-0`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer"
            >
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

        {/* Body Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 space-y-6">

          {/* Title and Pay Now section */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-serif text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>Fees & Payments</h2>
              <p className="text-sm text-slate-500 font-semibold">View your fee breakdown and pay online securely.</p>
            </div>
            {student.dueFee > 0 ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#e6ad12] hover:bg-[#d69d0d] text-[#0c2340] px-5 py-3 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97 select-none"
              >
                <span className="font-extrabold text-sm mr-0.5">+</span> Pay Now
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 px-5 py-3 text-xs font-bold select-none">
                All Dues Settled ✓
              </div>
            )}
          </div>

          {/* Colored Metrics Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 delay-75 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>

            {/* Total Fee Card */}
            <div
              className="p-6 rounded-3xl flex flex-col justify-center min-h-[110px] shadow-xs border"
              style={{
                backgroundColor: darkMode ? '#1e293b' : '#e2e5e9',
                borderColor: darkMode ? '#334155' : 'transparent'
              }}
            >
              <span className="block text-[10px] font-bold tracking-wider uppercase" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>TOTAL FEE</span>
              <span className="block text-3xl font-bold font-serif leading-tight mt-1.5" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>
                {formatRupee(student.totalFee)}
              </span>
            </div>

            {/* Paid Fee Card */}
            <div
              className="p-6 rounded-3xl flex flex-col justify-center min-h-[110px] shadow-xs border"
              style={{
                backgroundColor: darkMode ? '#064e3b' : '#d6f7e5',
                borderColor: darkMode ? '#065f46' : 'transparent'
              }}
            >
              <span className="block text-[10px] font-bold tracking-wider uppercase" style={{ color: darkMode ? '#34d399' : '#047857' }}>PAID</span>
              <span className="block text-3xl font-bold font-serif leading-tight mt-1.5" style={{ color: darkMode ? '#34d399' : '#047857' }}>
                {formatRupee(student.paidFee)}
              </span>
            </div>

            {/* Due Fee Card */}
            <div
              className="p-6 rounded-3xl flex flex-col justify-center min-h-[110px] shadow-xs border"
              style={{
                backgroundColor: darkMode ? '#4c0519' : '#fce7e7',
                borderColor: darkMode ? '#9f1239' : 'transparent'
              }}
            >
              <span className="block text-[10px] font-bold tracking-wider uppercase" style={{ color: darkMode ? '#f87171' : '#b91c1c' }}>DUE</span>
              <span className="block text-3xl font-bold font-serif leading-tight mt-1.5" style={{ color: darkMode ? '#f87171' : '#b91c1c' }}>
                {formatRupee(student.dueFee)}
              </span>
            </div>

          </div>

          {/* Fee Breakdown Checklist */}
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'} shadow-xs space-y-4 transition-all duration-500 delay-150 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>Fee Components Breakdown</h3>
                <p className="text-xs text-slate-400 font-semibold">Capsule view of all category components</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">✓ = Paid</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['ANNUAL', 'EXAM', 'COMPUTER', 'TUITION'].map(category => {
                const categoryItems = getFeeComponentsList(student).filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className={`border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/50 border-slate-200/40'}`}>
                    <div className="bg-slate-100 dark:bg-slate-800/60 px-4 py-2 border-b border-slate-200/40 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8892a0' }}>
                      {category}
                    </div>
                    <div className="p-3 space-y-2 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border ${item.alreadyPaid
                            ? 'border-emerald-100 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400'
                            : 'border-slate-200/60 bg-white text-slate-600 dark:bg-slate-800/50'
                            }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {item.name}
                            {item.alreadyPaid && <span className="text-emerald-500 font-extrabold">✓</span>}
                          </span>
                          <span className="font-bold">{formatRupee(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipt History Table */}
          <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/50'} shadow-xs space-y-4 transition-all duration-500 delay-200 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            <div>
              <h3 className="text-lg font-bold text-[#0a1e3f] dark:text-white" style={{ color: darkMode ? '#ffffff' : '#0a1e3f' }}>Transaction History</h3>
              <p className="text-xs text-slate-400 font-semibold">Official invoices issued for paid components</p>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-auto max-h-[320px] scrollbar-thin">
              <table className="w-full text-left border-collapse text-[13px] min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-[#F2F5F9] border-b border-slate-200 text-[12px] font-bold text-[#596475] tracking-wider uppercase">
                  <tr>
                    <th className="px-5 py-3">RECEIPT</th>
                    <th className="px-5 py-3">DATE</th>
                    <th className="px-5 py-3">AMOUNT</th>
                    <th className="px-5 py-3">MODE</th>
                    <th className="px-5 py-3 w-[240px]">REMARKS</th>
                    <th className="px-5 py-3 text-right pr-8 w-28">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {!student.paymentHistory || student.paymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-xs text-slate-400 font-semibold">
                        No receipts found.
                      </td>
                    </tr>
                  ) : (
                    student.paymentHistory.map(pay => (
                      <tr key={pay.receiptNo} className="hover:bg-slate-50/30 transition-colors text-slate-700">
                        <td className="px-5 py-3.5 font-mono text-[12px] font-semibold text-[#596475]">{pay.receiptNo}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-600">{pay.date}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 text-[14px]">{formatRupee(pay.amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E2F7E9] text-[#006837] px-3 py-1 text-[11px] font-bold border border-emerald-200/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#006837] shrink-0"></span>
                            {pay.mode}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 w-[240px]">
                          <div className="max-w-[220px] overflow-x-auto whitespace-nowrap scrollbar-none text-slate-500 font-semibold pb-1">
                            {pay.remarks || 'Term fee'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right pr-8 w-28 shrink-0">
                          <div className="flex justify-end gap-3.5">
                            <button
                              onClick={() => handlePrintReceipt(pay)}
                              className="text-slate-400 hover:text-[#0a1e3f] p-1 rounded transition-colors cursor-pointer shrink-0"
                            >
                              <Download className="h-4.5 w-4.5 stroke-[2.2]" />
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(pay)}
                              className="text-slate-400 hover:text-[#0a1e3f] p-1 rounded transition-colors cursor-pointer shrink-0"
                            >
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

        </main>
      </div>

      {/* ONLINE PAYMENT SIMULATED CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
            {/* Header */}
            <div className="bg-[#203a5e] text-white px-6 py-5 relative shrink-0">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-0.5">LOYOLA EMS · FEE CHECKOUT</span>
              <h2 className="text-2xl font-bold font-serif">Pay School Fees Online</h2>
              <p className="text-xs font-semibold text-slate-200 mt-1">
                Select unpaid items to clear outstanding school dues.
              </p>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute right-6 top-6 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="flex flex-col overflow-hidden">
              <div className="overflow-y-auto p-6 space-y-5">

                {paymentSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold">{paymentSuccessMsg}</span>
                  </div>
                )}

                {/* Checkout selection */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Items to Pay</label>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {['ANNUAL', 'EXAM', 'COMPUTER', 'TUITION'].map(category => {
                      const categoryItems = getFeeComponentsList(student).filter(item => item.category === category && !item.alreadyPaid);
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category} className="space-y-0.5">
                          <div className="bg-[#f1f3f7] px-4 py-2 rounded-t-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-b-0 border-slate-200">
                            {category} (UNPAID)
                          </div>
                          <div className="border border-slate-200 bg-white rounded-b-2xl p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryItems.map(item => {
                              const isChecked = selectedFeeComponents.includes(item.name);
                              return (
                                <label
                                  key={item.id}
                                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer select-none ${isChecked
                                    ? 'border-[#203a5e] bg-[#e4e8f1]/30 text-slate-900 font-bold'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50/50'
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleComponentToggle(item.name)}
                                      className="h-4 w-4 rounded border-slate-300 text-[#203a5e] focus:ring-[#203a5e] cursor-pointer"
                                    />
                                    <span>{item.name}</span>
                                  </div>
                                  <span className="font-bold text-slate-900">{formatRupee(item.amount)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-white shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL TO PAY</span>
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
                    onClick={() => setIsCheckoutOpen(false)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 cursor-pointer disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPayment || getCollectTotal() <= 0}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#e6ad12] hover:bg-[#d69d0d] px-6 py-3.5 text-xs font-bold text-[#0c2340] transition-all shadow-sm active:scale-97 cursor-pointer disabled:opacity-75"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <div className="animate-spin h-3.5 w-3.5 text-[#0c2340] rounded-full border-2 border-[#0c2340] border-t-transparent" />
                        <span>Redirecting to Gateway...</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        Pay {formatRupee(getCollectTotal())} Online
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
