import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserCog,
  Stethoscope,
  Wallet,
  
  Calendar,
  Clock,
  
  ArrowRight,
  ArrowUp,
  ArrowDown,
  FileText,
  ChevronDown,
  Activity,
  MessageSquare
} from "lucide-react";
import { Button } from "../../components/ui/button";

// Mock data for dashboard stats
const dashboardStats = {
  totalPatients: 145,
  newPatients: 23,
  totalDoctors: 8,
  totalRevenue: "879.200.000",
  patientGrowth: 12,
  revenueGrowth: 8,
  doctorGrowth: 0,
  successRateGrowth: 3,
  totalAppointments: 96,
  completedAppointments: 84,
  cancelledAppointments: 12,
  totalTreatments: 58,
  successfulTreatments: 42,
  ongoingTreatments: 16,
  averageRating: 4.8
};

// Mock data for recent appointments
const recentAppointments = [
  {
    id: 1,
    patientName: "Nguyễn Thị A",
    patientId: "PT10234",
    doctorName: "TS. BS. Nguyễn Văn A",
    service: "Thụ tinh trong tử cung (IUI)",
    date: "20/06/2025",
    time: "09:30",
    status: "confirmed"
  },
  {
    id: 2,
    patientName: "Trần Văn B",
    patientId: "PT10245",
    doctorName: "TS. BS. Nguyễn Văn A",
    service: "Thụ tinh trong ống nghiệm (IVF)",
    date: "18/06/2025",
    time: "11:00",
    status: "confirmed"
  },
  {
    id: 3,
    patientName: "Lê Thị C",
    patientId: "PT10267",
    doctorName: "BS. CKI. Phạm Thị D",
    service: "Tư vấn ban đầu",
    date: "17/06/2025",
    time: "14:30",
    status: "waiting"
  }
];

// Mock data for recent feedbacks
const recentFeedbacks = [
  {
    id: 1,
    patientName: "Hoàng Thị E",
    patientId: "PT10302",
    doctorName: "TS. BS. Nguyễn Văn A",
    rating: 5,
    comment: "Tôi rất hài lòng với quá trình điều trị, bác sĩ tận tình và chu đáo.",
    date: "15/06/2025"
  },
  {
    id: 2,
    patientName: "Vũ Văn F",
    patientId: "PT10315",
    doctorName: "BS. CKI. Phạm Thị D",
    rating: 4,
    comment: "Dịch vụ tốt, tuy nhiên thời gian chờ đợi hơi lâu.",
    date: "12/06/2025"
  }
];

// Mock data for revenue chart
const revenueData = [
  { month: "Tháng 1", revenue: 650000000 },
  { month: "Tháng 2", revenue: 720000000 },
  { month: "Tháng 3", revenue: 680000000 },
  { month: "Tháng 4", revenue: 750000000 },
  { month: "Tháng 5", revenue: 820000000 },
  { month: "Tháng 6", revenue: 879200000 }
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Format number with commas
  const formatNumber = (number: number | string) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Time Range Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
            <p className="mt-1 text-gray-600">
              Tổng quan về hoạt động của phòng khám
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white rounded-lg shadow-sm flex">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'day' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'week' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'year' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Năm
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng số bệnh nhân</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.totalPatients)}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium flex items-center ${
                    dashboardStats.patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardStats.patientGrowth >= 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(dashboardStats.patientGrowth)}% so với tháng trước
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalRevenue} đ</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium flex items-center ${
                    dashboardStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardStats.revenueGrowth >= 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(dashboardStats.revenueGrowth)}% so với tháng trước
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng số bác sĩ</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalDoctors}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium flex items-center ${
                    dashboardStats.doctorGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardStats.doctorGrowth > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : dashboardStats.doctorGrowth < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <span className="text-gray-500">Không thay đổi</span>
                    )}
                    {dashboardStats.doctorGrowth !== 0 && `${Math.abs(dashboardStats.doctorGrowth)}% so với tháng trước`}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tỷ lệ thành công</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((dashboardStats.successfulTreatments / dashboardStats.totalTreatments) * 100)}%
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium flex items-center ${
                    dashboardStats.successRateGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardStats.successRateGrowth >= 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(dashboardStats.successRateGrowth)}% so với tháng trước
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Doanh thu</h2>
                <div className="relative">
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <span className="mr-1">Theo tháng</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Chart would go here - using a placeholder */}
              <div className="h-64 flex flex-col">
                <div className="relative flex-grow">
                  <div className="absolute inset-0">
                    <div className="h-full">
                      <div className="relative h-full">
                        {/* Chart bars */}
                        <div className="flex items-end justify-between h-full">
                          {revenueData.map((data, index) => (
                            <div key={index} className="w-1/6 px-2 flex flex-col items-center">
                              <div 
                                className="w-full bg-blue-500 rounded-t-sm" 
                                style={{ 
                                  height: `${(data.revenue / 900000000) * 100}%`,
                                  opacity: index === revenueData.length - 1 ? 1 : 0.7
                                }}
                              ></div>
                              <p className="text-xs text-gray-500 mt-2">{data.month.split(' ')[1]}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Y-axis labels */}
                        <div className="absolute inset-y-0 left-0 flex flex-col justify-between pointer-events-none">
                          <span className="text-xs text-gray-400">900M</span>
                          <span className="text-xs text-gray-400">600M</span>
                          <span className="text-xs text-gray-400">300M</span>
                          <span className="text-xs text-gray-400">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Doanh thu tháng này</p>
                    <p className="text-lg font-semibold text-gray-900">{dashboardStats.totalRevenue} đ</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Dự kiến tháng sau</p>
                    <p className="text-lg font-semibold text-gray-900">950.000.000 đ</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Lịch hẹn gần đây</h2>
                <Link to="/admin/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100' 
                        : 'bg-yellow-100'
                    }`}>
                      <Calendar className={`h-5 w-5 ${
                        appointment.status === 'confirmed' 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-xs text-gray-500 mb-1">ID: {appointment.patientId} · Bác sĩ: {appointment.doctorName}</p>
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <span>{appointment.date}, {appointment.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4 text-center">
                <Button variant="outline" size="sm" className="text-sm border-gray-300 text-gray-700">
                  Tải thêm
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Treatment Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Tình trạng điều trị</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Tỷ lệ thành công</p>
                <div className="flex items-center">
                  <div className="flex-grow mr-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${(dashboardStats.successfulTreatments / dashboardStats.totalTreatments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((dashboardStats.successfulTreatments / dashboardStats.totalTreatments) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Tổng số ca điều trị</h3>
                    <span className="font-bold text-gray-900">{dashboardStats.totalTreatments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Điều trị thành công</h3>
                    <span className="font-bold text-gray-900">{dashboardStats.successfulTreatments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(dashboardStats.successfulTreatments / dashboardStats.totalTreatments) * 100}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Đang điều trị</h3>
                    <span className="font-bold text-gray-900">{dashboardStats.ongoingTreatments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(dashboardStats.ongoingTreatments / dashboardStats.totalTreatments) * 100}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Link to="/admin/treatments">
                  <Button variant="outline" className="border-gray-300 text-gray-700">
                    <FileText className="mr-2 h-4 w-4" />
                    Xem chi tiết báo cáo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Appointments Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Thống kê cuộc hẹn</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Tỷ lệ hoàn thành</p>
                <div className="flex items-center">
                  <div className="flex-grow mr-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${(dashboardStats.completedAppointments / dashboardStats.totalAppointments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((dashboardStats.completedAppointments / dashboardStats.totalAppointments) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Tổng cuộc hẹn</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalAppointments}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedAppointments}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-700">Hoàn thành</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.completedAppointments} ({Math.round((dashboardStats.completedAppointments / dashboardStats.totalAppointments) * 100)}%)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-700">Hủy</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.cancelledAppointments} ({Math.round((dashboardStats.cancelledAppointments / dashboardStats.totalAppointments) * 100)}%)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-700">Sắp tới</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.totalAppointments - dashboardStats.completedAppointments - dashboardStats.cancelledAppointments} ({Math.round(((dashboardStats.totalAppointments - dashboardStats.completedAppointments - dashboardStats.cancelledAppointments) / dashboardStats.totalAppointments) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Link to="/admin/appointments">
                  <Button variant="outline" className="border-gray-300 text-gray-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Quản lý lịch hẹn
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Recent Feedbacks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Phản hồi gần đây</h2>
                <Link to="/admin/feedbacks" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-gray-900 mr-2">{dashboardStats.averageRating}</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`h-5 w-5 ${i < Math.floor(dashboardStats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">Dựa trên {formatNumber(dashboardStats.totalPatients)} đánh giá</p>
              </div>
              
              <div className="space-y-6">
                {recentFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium text-gray-900">{feedback.patientName}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feedback.comment}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Bác sĩ: {feedback.doctorName}</span>
                      <span>{feedback.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <Button variant="outline" className="border-gray-300 text-gray-700">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Xem thêm phản hồi
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Truy cập nhanh</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/admin/patients" className="block">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Quản lý bệnh nhân</h3>
                      <p className="text-sm text-gray-600">{dashboardStats.totalPatients} bệnh nhân</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-blue-600 text-sm font-medium">
                    Xem chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
              
              <Link to="/admin/doctors" className="block">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Quản lý bác sĩ</h3>
                      <p className="text-sm text-gray-600">{dashboardStats.totalDoctors} bác sĩ</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserCog className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-blue-600 text-sm font-medium">
                    Xem chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
              
              <Link to="/admin/services" className="block">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Quản lý dịch vụ</h3>
                      <p className="text-sm text-gray-600">Cập nhật dịch vụ</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-blue-600 text-sm font-medium">
                    Xem chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
              
              <Link to="/admin/feedbacks" className="block">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Đánh giá & phản hồi</h3>
                      <p className="text-sm text-gray-600">Xem phản hồi</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-blue-600 text-sm font-medium">
                    Xem chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
