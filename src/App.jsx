import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx';
import AdminStudents from './pages/AdminStudents/AdminStudents.jsx';
import AdminTeachers from './pages/AdminTeachers/AdminTeachers.jsx';
import AdminFeeStructure from './pages/AdminFeeStructure/AdminFeeStructure.jsx';
import AdminAdmins from './pages/AdminAdmins/AdminAdmins.jsx';
import AdminHolidays from './pages/AdminHolidays/AdminHolidays.jsx';
import AdminSessions from './pages/AdminSessions/AdminSessions.jsx';
import AdminPromotion from './pages/AdminPromotion/AdminPromotion.jsx';
import AdminArchive from './pages/AdminArchive/AdminArchive.jsx';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile/StudentProfile.jsx';
import StudentAttendance from './pages/StudentAttendance/StudentAttendance.jsx';
import StudentFees from './pages/StudentFees/StudentFees.jsx';
import StudentNotices from './pages/StudentNotices/StudentNotices.jsx';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard.jsx';
import TeacherAttendance from './pages/TeacherAttendance/TeacherAttendance.jsx';
import TeacherNotices from './pages/TeacherNotices/TeacherNotices.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/teachers" element={<AdminTeachers />} />
        <Route path="/admin/fee-structure" element={<AdminFeeStructure />} />
        <Route path="/admin/admins" element={<AdminAdmins />} />
        <Route path="/admin/holidays" element={<AdminHolidays />} />
        <Route path="/admin/sessions" element={<AdminSessions />} />
        <Route path="/admin/promotion" element={<AdminPromotion />} />
        <Route path="/admin/archive" element={<AdminArchive />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/fees" element={<StudentFees />} />
        <Route path="/student/notices" element={<StudentNotices />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/notices" element={<TeacherNotices />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
