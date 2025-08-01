import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  CalendarClock,
  ArrowLeftCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { 
  getPatientsByDoctorId, 
  getPatientDetails, 
  getPatientTestResults, 
  updatePatientNote, 
  getAppointmentsByPatientId
} from "../../api/doctorApi/patientsAPI";
import type { Patient, Booking } from "../../api/doctorApi/patientsAPI";

const DoctorPatients = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [latestNote, setLatestNote] = useState<string>("");
  const [isLoadingNote, setIsLoadingNote] = useState<boolean>(false);
  const [patientAppointments, setPatientAppointments] = useState<Booking[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);
  const patientsPerPage = 5;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const userInfo = localStorage.getItem("userInfo");
        const userId = userInfo ? JSON.parse(userInfo).userId : null;

        if (!userId) {
          console.error("Không tìm thấy userId trong localStorage");
          setLoading(false);
          return;
        }

        const patientsData = await getPatientsByDoctorId(userId);
        setPatients(patientsData);
        
        const patientIdFromUrl = searchParams.get('patientId');
        if (patientIdFromUrl) {
          handleSelectPatient(patientIdFromUrl);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bệnh nhân:", error);
        setLoading(false);
      }
    };

    fetchPatients();
  }, [searchParams]);

  useEffect(() => {
    if (selectedPatient?.patientId) {
      const refreshAppointments = async () => {
        setLoadingAppointments(true);
        try {
          const appointments = await getAppointmentsByPatientId(selectedPatient.patientId);
          const sortedAppointments = appointments.sort((a, b) => 
            new Date(b.dateBooking).getTime() - new Date(a.dateBooking).getTime()
          );
          setPatientAppointments(sortedAppointments);
        } catch (error) {
          console.error("Lỗi khi làm mới danh sách cuộc hẹn:", error);
        } finally {
          setLoadingAppointments(false);
        }
      };
      refreshAppointments();
    }
  }, [searchParams, selectedPatient?.patientId]);

  useEffect(() => {
    const fetchLatestNote = async () => {
      if (selectedPatient?.patientId) {
        setIsLoadingNote(true);
        try {
          const testResults = await getPatientTestResults(selectedPatient.patientId);
          const sortedResults = testResults.sort((a, b) => 
            new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime()
          );
          
          if (sortedResults.length > 0 && sortedResults[0].note) {
            setLatestNote(sortedResults[0].note);
          } else {
            setLatestNote("Không có ghi chú khám bệnh");
          }
        } catch (error) {
          console.error("Lỗi khi lấy kết quả xét nghiệm:", error);
          setLatestNote("Không thể tải ghi chú khám bệnh");
        } finally {
          setIsLoadingNote(false);
        }
      }
    };
    
    fetchLatestNote();
  }, [selectedPatient?.patientId, patientAppointments.length]);

  const filteredPatients = patients.filter((patient) => {
    return (
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );
  const pageCount = Math.ceil(filteredPatients.length / patientsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const resetFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSelectPatient = async (patientId: string) => {
    try {
      setLoading(true);
      setSelectedPatientId(patientId);
      
      const patientDetails = await getPatientDetails(patientId);
      setSelectedPatient(patientDetails);
      
      setLoadingAppointments(true);
      const appointments = await getAppointmentsByPatientId(patientId);
      const sortedAppointments = appointments.sort((a, b) => 
        new Date(b.dateBooking).getTime() - new Date(a.dateBooking).getTime()
      );
      setPatientAppointments(sortedAppointments);
      setLoadingAppointments(false);
      
      setLoading(false);
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin chi tiết của bệnh nhân ${patientId}:`, error);
      setLoading(false);
      setLoadingAppointments(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý bệnh nhân</h1>
            <p className="mt-2 text-base text-gray-600">Xem và quản lý thông tin bệnh nhân của bạn.</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                placeholder="Tìm kiếm theo tên, ID, email hoặc số điện thoại..."
              />
            </div>
            <Button 
              variant="outline" 
              onClick={resetFilters} 
              className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
            >
              <Filter className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <h2 className="text-lg font-semibold text-gray-800">Danh sách bệnh nhân</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Bệnh nhân</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Thông tin liên hệ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                        <p className="mt-3 text-sm text-gray-500">Đang tải dữ liệu...</p>
                      </td>
                    </tr>
                  ) : currentPatients.length > 0 ? (
                    currentPatients.map((patient) => (
                      <tr 
                        key={patient.patientId} 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${patient.patientId === selectedPatientId ? 'bg-blue-50' : ''}`}
                        onClick={() => handleSelectPatient(patient.patientId)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-800">{patient.name}</div>
                              <div className="text-sm text-gray-500">
                                {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} tuổi, {patient.gender}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800 flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {patient.phone || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {patient.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50 font-medium border-blue-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/doctor/create-appointment?patientId=${patient.patientId}`);
                            }}
                          >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Lịch mới
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        Không tìm thấy bệnh nhân nào
                        <Button 
                          onClick={resetFilters} 
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                        >
                          Xóa bộ lọc
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * patientsPerPage + 1}</span> đến{' '}
                    <span className="font-medium">{Math.min(currentPage * patientsPerPage, filteredPatients.length)}</span>{' '}
                    / <span className="font-medium">{filteredPatients.length}</span> bệnh nhân
                  </p>
                  <nav className="flex rounded-lg shadow-sm">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-l-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: pageCount }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`px-4 py-2 border border-gray-200 text-sm ${
                          currentPage === i + 1 ? 'bg-blue-50 border-blue-500 text-blue-600 font-medium' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      className="px-3 py-2 rounded-r-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-3 text-sm text-gray-500">Đang tải thông tin...</p>
                </div>
              ) : selectedPatient ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">{selectedPatient.name}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedPatient.treatmentStage === "Hoàn thành" 
                        ? "bg-green-100 text-green-800" 
                        : selectedPatient.treatmentStage === "Đang điều trị"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedPatient.treatmentStage || "Chưa bắt đầu"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Thông tin cá nhân</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} tuổi, {selectedPatient.gender}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{selectedPatient.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{selectedPatient.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Ghi chú khám</h4>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {isLoadingNote ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin h-4 w-4 border-t-2 border-blue-500 mr-2"></span>
                          Đang tải ghi chú...
                        </span>
                      ) : (
                        <span className="block whitespace-pre-wrap">{latestNote}</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full text-blue-600 hover:bg-blue-50 font-medium border-blue-200"
                      onClick={async () => {
                        try {
                          const appointments = await getAppointmentsByPatientId(selectedPatient.patientId);
                          if (appointments.length === 0) {
                            alert("Bệnh nhân chưa có lịch hẹn nào để cập nhật ghi chú.");
                            return;
                          }
                          const latestAppointment = appointments[0];
                          const testResults = await getPatientTestResults(selectedPatient.patientId);
                          const sortedResults = testResults.sort((a, b) => 
                            new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime()
                          );
                          const currentNote = sortedResults.length > 0 ? sortedResults[0].note : "";
                          const note = prompt("Nhập ghi chú khám bệnh:", currentNote || "");
                          if (note !== null) {
                            setIsLoadingNote(true);
                            await updatePatientNote(
                              selectedPatient.patientId, 
                              JSON.parse(localStorage.getItem("userInfo") || "{}").userId, 
                              note, 
                              latestAppointment.bookingId
                            );
                            const updatedResults = await getPatientTestResults(selectedPatient.patientId);
                            const updatedSortedResults = updatedResults.sort((a, b) => 
                              new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime()
                            );
                            if (updatedSortedResults.length > 0 && updatedSortedResults[0].note) {
                              setLatestNote(updatedSortedResults[0].note);
                            }
                            setIsLoadingNote(false);
                            const updatedPatient = await getPatientDetails(selectedPatient.patientId);
                            setSelectedPatient(updatedPatient);
                            setPatients(patients.map(p => p.patientId === selectedPatient.patientId ? updatedPatient : p));
                            const updatedAppointments = await getAppointmentsByPatientId(selectedPatient.patientId);
                            const sortedAppointments = updatedAppointments.sort((a, b) => 
                              new Date(b.dateBooking).getTime() - new Date(a.dateBooking).getTime()
                            );
                            setPatientAppointments(sortedAppointments);
                          }
                        } catch (error) {
                          console.error("Lỗi khi cập nhật ghi chú bệnh nhân:", error);
                          setIsLoadingNote(false);
                        }
                      }}
                    >
                      Cập nhật ghi chú
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50 font-medium"
                      onClick={() => navigate(`/doctor/create-appointment?patientId=${selectedPatient.patientId}`)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Tạo lịch hẹn mới
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                      <CalendarClock className="h-5 w-5 text-blue-500 mr-2" />
                      Lịch sử cuộc hẹn
                    </h4>
                    {loadingAppointments ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="animate-spin h-5 w-5 border-t-2 border-blue-500 mr-2"></span>
                        <span className="text-sm text-gray-600">Đang tải...</span>
                      </div>
                    ) : patientAppointments.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {patientAppointments.map((appointment) => (
                          <motion.div 
                            key={appointment.bookingId} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-50 rounded-lg border border-gray-200 p-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-blue-600">
                                  {appointment.service?.name || "Dịch vụ không xác định"}
                                </p>
                                <div className="text-sm text-gray-600 space-y-1 mt-2">
                                  <p className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    {new Date(appointment.dateBooking).toLocaleDateString('vi-VN')}
                                  </p>
                                  <p className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    {appointment.slot?.startTime} - {appointment.slot?.endTime}
                                  </p>
                                  {appointment.note && (
                                    <p className="flex items-start">
                                      <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                      <span className="line-clamp-2">{appointment.note}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 'Completed' ? 'Hoàn thành' :
                                 appointment.status === 'Confirmed' ? 'Đã xác nhận' :
                                 appointment.status === 'Pending' ? 'Chờ xác nhận' :
                                 appointment.status === 'Cancelled' ? 'Đã hủy' :
                                 appointment.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CalendarClock className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Chưa có cuộc hẹn nào</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-800">Chọn bệnh nhân</h3>
                  <p className="text-sm text-gray-500 mt-2">Chọn một bệnh nhân từ danh sách để xem chi tiết</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8 bg-blue-50 rounded-xl shadow-sm border border-blue-100"
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Truy cập nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/doctor/appointments">
                <motion.div 
                  className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200"
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Lịch hẹn hôm nay</h3>
                    <p className="text-sm text-gray-600">Xem lịch hẹn</p>
                  </div>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </motion.div>
              </Link>
              <Link to={`/doctor/treatment-records?patientId=${selectedPatient?.patientId}`}>
                <motion.div 
                  className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200"
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Hồ sơ điều trị</h3>
                    <p className="text-sm text-gray-600">Xem hồ sơ</p>
                  </div>
                  <FileText className="h-5 w-5 text-green-600" />
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorPatients;
