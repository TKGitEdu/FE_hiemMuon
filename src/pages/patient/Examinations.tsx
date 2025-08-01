import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "../../components/ui/button";
import type { Examination } from "../../api/patientApi/dashboardAPI";
import { motion } from "framer-motion";

// Trang hiển thị chi tiết các buổi khám của bệnh nhân
const ExaminationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading] = useState<boolean>(false);
  
  // Lấy dữ liệu examination từ state của location (được truyền từ Dashboard)
  const examination = location.state?.examination as Examination | undefined;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!examination) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg mb-6">Không có thông tin buổi khám hoặc dữ liệu không hợp lệ</p>
        <button 
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch  {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="border-b border-gray-200 bg-blue-50 px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">TỜ KHAI CHI TIẾT BUỔI KHÁM</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              examination.status === "Completed" ? "bg-green-100 text-green-800" :
              examination.status === "in-progress" ? "bg-blue-100 text-blue-800" :
              examination.status === "Scheduled" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {examination.status === "Completed" ? "Đã hoàn thành" :
               examination.status === "in-progress" ? "Đang tiến hành" :
               examination.status === "Scheduled" ? "Đã lên lịch" :
               examination.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Ngày khám: {formatDate(examination.examinationDate)}
          </p>
        </div>
        
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">Thông tin chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="w-1/3 font-medium text-gray-700">Mã buổi khám:</span>
              <span className="w-2/3 text-gray-900">{examination.examinationId}</span>
            </div>
            <div className="flex items-center">
              <span className="w-1/3 font-medium text-gray-700">Mã đặt lịch:</span>
              <span className="w-2/3 text-gray-900">{examination.bookingId}</span>
            </div>
            <div className="flex items-center">
              <span className="w-1/3 font-medium text-gray-700">Bác sĩ phụ trách:</span>
              <span className="w-2/3 text-gray-900">{examination.doctorName}</span>
            </div>
            <div className="flex items-center">
              <span className="w-1/3 font-medium text-gray-700">Dịch vụ:</span>
              <span className="w-2/3 text-gray-900">{examination.serviceName}</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">Mô tả buổi khám</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {examination.examinationDescription || "Không có mô tả"}
          </p>
        </div>
        
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">Kết quả</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {examination.result || "Chưa có kết quả"}
          </p>
        </div>
        
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">Ghi chú của bác sĩ</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {examination.note || "Không có ghi chú"}
          </p>
        </div>
        
        <div className="px-6 py-6 bg-gray-50 flex justify-between">
          <Button 
            variant="outline" 
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-800 font-medium rounded-lg shadow-sm transition-all duration-200"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <Button 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => navigate(`/patient/treatments/${examination.examinationId}`, { state: { examination } })}
          >
            Xem kế hoạch điều trị
          </Button>
        </div>
      </motion.div>
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Vui lòng kiểm tra kỹ thông tin trước khi đến khám. Nếu có thắc mắc, liên hệ tổng đài hỗ trợ.</p>
      </div>
    </div>
  );
};

export default ExaminationsPage;