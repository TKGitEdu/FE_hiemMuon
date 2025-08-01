import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Save, Calendar, User, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { 
  getBookingById, 
  getPatientById, 
  createExamination,
  checkExaminationExists
} from "../../api/doctorApi/interactivePatientAPI";
import type { 
  Booking as BookingType,
  Patient as PatientType,
  ExaminationRequest
} from "../../api/doctorApi/interactivePatientAPI";

interface PatientDisplay extends PatientType {
  age?: number;
  medicalHistory?: string[];
}

interface BookingDisplay extends BookingType {
  patientName?: string;
  doctorName?: string;
  serviceName?: string;
}

const InteractivePatient: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDisplay | null>(null);
  const [patient, setPatient] = useState<PatientDisplay | null>(null);
  const [examinationDescription, setExaminationDescription] = useState<string>("");
  const [examinationResult, setExaminationResult] = useState<string>("");
  const [specialNote, setSpecialNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [examinationExists, setExaminationExists] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!bookingId) {
          setError("Không tìm thấy ID cuộc hẹn");
          setLoading(false);
          return;
        }
        
        const bookingData = await getBookingById(bookingId);
        console.log("Booking data:", bookingData);
        
        try {
          const hasExamination = await checkExaminationExists(bookingId);
          setExaminationExists(hasExamination);
          
          if (hasExamination) {
            console.log("Booking đã có examination, cần tạo booking mới để khám tiếp");
            setTimeout(() => {
              alert("Bệnh nhân đã được khám cho lịch hẹn này!\n\nVui lòng tạo lịch hẹn mới để có thể khám tiếp.");
              navigate(`/doctor/create-appointment?patientId=${bookingData.patientId}`);
            }, 100);
            return;
          }
        } catch (error) {
          console.error("Error checking examination exists:", error);
        }
        
        const bookingDisplay: BookingDisplay = {
          ...bookingData,
          serviceName: "Khám chữa bệnh",
        };
        
        const patientData = await getPatientById(bookingData.patientId);
        console.log("Patient data:", patientData);
        
        let age;
        if (patientData.dateOfBirth) {
          const birthDate = new Date(patientData.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
        
        const patientDisplay: PatientDisplay = {
          ...patientData,
          age
        };
        
        setBooking(bookingDisplay);
        setPatient(patientDisplay);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải thông tin. Vui lòng thử lại.");
        
        const mockBooking: BookingDisplay = {
          bookingId: bookingId || "BKG_001",
          patientId: "PAT_001",
          doctorId: "DOC_001",
          serviceId: "SRV_001",
          slotId: "SLOT_001",
          dateBooking: new Date().toISOString(),
          description: "Đau răng số 6 hàm dưới bên phải",
          note: "Lịch hẹn khẩn",
          status: "confirmed",
          createAt: new Date().toISOString(),
          patientName: "Nguyễn Văn A",
          doctorName: "Bác sĩ Trần Văn B",
          serviceName: "Khám răng tổng quát"
        };
        
        const mockPatient: PatientDisplay = {
          patientId: "PAT_001",
          userId: "USR_001",
          name: "Nguyễn Văn A",
          gender: "Nam",
          phone: "0987654321",
          email: "nguyenvana@example.com",
          address: "123 Đường ABC, Quận XYZ, TP. HCM",
          bloodType: "A+",
          dateOfBirth: "1988-01-01",
          emergencyPhoneNumber: "0987654322",
          age: 35,
          medicalHistory: ["Chưa có thông tin tiền sử bệnh"]
        };
        
        setBooking(mockBooking);
        setPatient(mockPatient);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [bookingId]);
  
  const handleCompleteExamination = async () => {
  try {
    setSubmitting(true);

    if (!booking || !bookingId || !examinationDescription) {
      alert("Vui lòng nhập mô tả khám bệnh!");
      setSubmitting(false);
      return;
    }

    try {
      const hasExamination = await checkExaminationExists(bookingId);
      if (hasExamination) {
        alert("Bệnh nhân đã được khám cho lịch hẹn này!\n\nVui lòng tạo lịch hẹn mới để có thể khám tiếp.");
        navigate(`/doctor/create-appointment?patientId=${booking.patientId}`);
        return;
      }
    } catch (error: unknown) {
      console.error("Error double-checking examination exists:", error);
    }

    const examinationData: ExaminationRequest = {
      bookingId: bookingId,
      examinationDate: new Date().toISOString(),
      examinationDescription: examinationDescription.trim(),
      result: examinationResult.trim() || "",
      status: "completed",
      note: specialNote.trim() || ""
    };

    console.log("Preparing to send examination data:", examinationData);

    const response = await createExamination(examinationData);
    console.log("Created examination:", response);

    alert("Đã hoàn thành khám bệnh thành công!");
    navigate("/doctor/dashboard");
  } catch (error: unknown) {
    console.error("Error completing examination:", error);

    // Kiểm tra kiểu trước khi truy cập thuộc tính
    if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response: { status?: number; data?: { message?: string } } }).response;
    if (
      response.status === 400 ||
      (response.data?.message && response.data.message.includes("examination"))
    ) {
      alert("Bệnh nhân đã được khám cho lịch hẹn này!\n\nVui lòng tạo lịch hẹn mới để có thể khám tiếp.");
      navigate(`/doctor/create-appointment?patientId=${booking?.patientId}`);
      return;
    }
  }
    alert("Không thể hoàn thành khám bệnh. Vui lòng thử lại.");
  } finally {
    setSubmitting(false);
  }
};
  
  const handleCancel = () => {
    const confirmCancel = window.confirm("Bạn có chắc muốn hủy? Các thông tin đã nhập sẽ không được lưu.");
    if (confirmCancel) {
      navigate("/doctor/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4 text-base font-medium">{error}</p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2"
            onClick={() => navigate("/doctor/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Phiên khám bệnh</h1>
            <p className="text-base text-gray-600 mt-2">ID cuộc hẹn: {bookingId}</p>
          </div>
          <Button 
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-4 py-2"
            onClick={() => navigate("/doctor/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </motion.div>

        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Thông tin lịch hẹn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <p><span className="font-medium text-gray-800">Dịch vụ:</span> {booking.serviceName}</p>
                <p><span className="font-medium text-gray-800">Ngày hẹn:</span> {format(new Date(booking.dateBooking), 'dd/MM/yyyy')}</p>
                <p><span className="font-medium text-gray-800">Giờ hẹn:</span> {format(new Date(booking.dateBooking), 'HH:mm')}</p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-800">Trạng thái:</span> 
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Đã xác nhận' :
                     booking.status === 'pending' ? 'Chờ xác nhận' :
                     booking.status === 'canceled' ? 'Đã hủy' :
                     booking.status}
                  </span>
                </p>
                <p><span className="font-medium text-gray-800">Mô tả:</span> {booking.description}</p>
                {booking.note && <p><span className="font-medium text-gray-800">Ghi chú:</span> {booking.note}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {patient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Thông tin bệnh nhân
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <p><span className="font-medium text-gray-800">Họ tên:</span> {patient.name}</p>
                <p><span className="font-medium text-gray-800">ID:</span> {patient.patientId}</p>
                <p><span className="font-medium text-gray-800">Tuổi:</span> {patient.age || 'N/A'}</p>
                <p><span className="font-medium text-gray-800">Giới tính:</span> {patient.gender}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-800">SĐT:</span> {patient.phone || 'N/A'}</p>
                <p><span className="font-medium text-gray-800">Email:</span> {patient.email || 'N/A'}</p>
                <p><span className="font-medium text-gray-800">Địa chỉ:</span> {patient.address || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {examinationExists ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Bệnh nhân đã được khám</h3>
                <p className="text-yellow-700 text-sm">Lịch hẹn này đã có kết quả khám bệnh.</p>
              </div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium mb-2">Lưu ý:</p>
              <ul className="text-yellow-700 text-sm list-disc ml-5 space-y-1">
                <li>Mỗi lịch hẹn chỉ được khám bệnh một lần</li>
                <li>Để khám tiếp cho bệnh nhân, vui lòng tạo lịch hẹn mới</li>
                <li>Bạn có thể xem lại kết quả khám cũ trong hồ sơ bệnh nhân</li>
              </ul>
            </div>
            <div className="flex space-x-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2"
                onClick={() => navigate(`/doctor/create-appointment?patientId=${patient?.patientId}`)}
              >
                Tạo lịch hẹn mới
              </Button>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-4 py-2"
                onClick={() => navigate("/doctor/dashboard")}
              >
                Quay lại Dashboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Thông tin khám bệnh
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả tình trạng bệnh nhân <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full h-40 p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                  placeholder="Nhập mô tả tình trạng bệnh nhân..."
                  value={examinationDescription}
                  onChange={(e) => setExaminationDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kết quả chẩn đoán
                </label>
                <textarea
                  className="w-full h-40 p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                  placeholder="Nhập kết quả chẩn đoán..."
                  value={examinationResult}
                  onChange={(e) => setExaminationResult(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lưu ý đặc biệt
                </label>
                <textarea
                  className="w-full h-28 p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                  placeholder="Nhập lưu ý đặc biệt (chế độ ăn uống, vận động, dùng thuốc...)..."
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex justify-end space-x-4"
        >
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-4 py-2"
            onClick={handleCancel}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2"
            onClick={handleCompleteExamination}
            disabled={submitting || examinationExists}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Hoàn thành khám
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractivePatient;