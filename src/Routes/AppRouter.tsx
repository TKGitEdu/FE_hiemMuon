
import React from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import Header from "../components/header";
import Footer from "../components/footer";
import ServicesPage from "../pages/ServicesPage";
import DoctorsPage from "../pages/DoctorsPage";
import ServiceDetailPage from "../pages/ServiceDetailPage";
import DoctorDetailPage from "../pages/DoctorDetailPage";
import BlogPage from "../pages/BlogPage";
import BlogDetailPage from "../pages/BlogDetailPage";
import BookingPage from "../pages/BookingPage";
import PatientDashboard from "../pages/patient/Dashboard";
import PatientAppointments from "../pages/patient/Appointments";
import PatientTreatments from "../pages/patient/Treatments";
import PatientProfile from "../pages/patient/Profile";
import PatientFeedback from "../pages/patient/Feedback";
// import PatientPayments from "../pages/patient/Payments";
import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorAppointments from "../pages/doctor/Appointments";
import DoctorPatients from "../pages/doctor/Patients";
import DoctorTreatmentRecords from "../pages/doctor/TreatmentRecords";
import CreateAppointmentForPatient from "../pages/doctor/CreateAppointmentForPatient";
import InteractivePatient from "../pages/doctor/InteractivePatient";
import AdminDashboard from "../pages/admin/Dashboard";
// import AdminServices from "../pages/admin/Services";
import AdminDoctors from "../pages/admin/Doctors";
import AdminPatients from "../pages/admin/Patients";
import AdminFeedbacks from "../pages/admin/Feedbacks";
import NotFoundPage from "../pages/NotFoundPage";
import AdminLayout from "../layout/adminLayout";
import ProtectedRoute from "./ProtectedRouter";
import RegisterSuccess from "../components/registerSuccess";
// thêm trang PatientExaminations D:\ThuMucTam\SWP391--FrontEnd\SWP391--FrontEnd\src\pages\patient\Examinations.tsx
import PatientExaminations from "../pages/patient/Examinations";
// thêm trang CreateTreatmentPlan
import CreateTreatmentPlan from "../pages/doctor/CreateTreatmentplan";

import AdminServices from "../pages/admin/Services";
import Bookings from "../pages/admin/Bookings";
import Examination from "../pages/admin/Examination";
import TreatmentMedications from "../pages/admin/Medicine";

import PaymentPage from "../pages/patient/PaymentPage";
import PaymentCallbackPage from "../pages/patient/PaymentCallbackPage";
import AdminPayment from "../pages/admin/Payment";

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="min-h-screen pt-16">{children}</main>
    <Footer />
  </>
);


const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
         <Route path="/success" element={<RegisterSuccess />} />
        <Route
          path="/services"
          element={
            <MainLayout>
              <ServicesPage />
            </MainLayout>
          }
        />
        <Route
          path="/services/:id"
          element={
            <MainLayout>
              <ServiceDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/doctors"
          element={
            <MainLayout>
              <DoctorsPage />
            </MainLayout>
          }
        />
        <Route
          path="/doctors/:id"
          element={
            <MainLayout>
              <DoctorDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/blog"
          element={
            <MainLayout>
              <BlogPage />
            </MainLayout>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <MainLayout>
              <BlogDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/booking"
          element={
            <MainLayout>
              <BookingPage />
            </MainLayout>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PatientDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments/:bookingId"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PatientAppointments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/treatments/:treatmentPlanId"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PatientTreatments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* trang này nhận bookingid để thực hiện thanh toán */}
        <Route
          path="/patient/payment/:bookingId"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PaymentPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/payment-callback"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PaymentCallbackPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* trang này nhận /patient/examinations?bookingId=BKG_1&examinationId=EXM_1 */}
        <Route
          path="/patient/examinations"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PatientExaminations />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute allowedRoles={["Patient", "Doctor"]}>
              <MainLayout>
                <PatientProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/feedback"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PatientFeedback />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* <Route trang này không có sử dụng.
          path="/patient/payments"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MainLayout>
                <PatientPayments />
              </MainLayout>
            </ProtectedRoute>
          }
        /> */}
        {/* Doctor */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MainLayout>
                <DoctorDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MainLayout>
                <DoctorAppointments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/create-treatment-plan/:examinationId"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MainLayout>
                <CreateTreatmentPlan />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MainLayout>
                <DoctorPatients />
              </MainLayout>
            </ProtectedRoute>          
            }
        />
        <Route
          path="/doctor/treatment-records"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MainLayout>
                <DoctorTreatmentRecords />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/create-appointment"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MainLayout>
                <CreateAppointmentForPatient />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/interactive-patient/:bookingId"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MainLayout>
                <InteractivePatient />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminPayment/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminDoctors />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <Bookings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminPatients />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/examinations"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <Examination />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
         <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminServices/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedbacks"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AdminFeedbacks />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/medicines"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <TreatmentMedications />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <MainLayout>
              <NotFoundPage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
