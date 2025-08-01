import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Pill,
  Syringe,
  FileText,
  Calendar,
  TestTube,
  ArrowUpRight,
  Microscope,
  Bookmark,
  BarChart,
  Info,
  ArrowLeftCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import treatmentPlanAPI from "../../api/patientApi/treatmentPlanAPI";
import type { TreatmentPlan, Medication as APIMedication, TreatmentPlanBooking, Examination, TreatmentStep } from "../../api/patientApi/treatmentPlanAPI";

// Interface cho dữ liệu điều trị hiển thị trong component
interface Medication {
  drugType: string;
  drugName: string;
  description: string;
}

// Hàm ánh xạ API Medication sang component Medication
const mapAPIMedicationToMedication = (apiMedication: APIMedication): Medication => {
  return {
    drugType: apiMedication.drugType,
    drugName: apiMedication.drugName,
    description: apiMedication.description
  };
};

// Hàm ánh xạ TreatmentPlanBooking sang Appointment
const mapTreatmentPlanBookingToAppointment = (booking: TreatmentPlanBooking): Appointment => {
  return {
    id: booking.bookingId,
    date: new Date(booking.dateBooking).toLocaleDateString('vi-VN'),
    time: booking.slotId || "N/A",
    purpose: booking.description || "Tư vấn điều trị",
    status: booking.status.toLowerCase(),
    note: booking.note,
    slotName: booking.slotName || "Không xác định"
  };
};

// Hàm ánh xạ Examination sang TestResult
const mapExaminationToTestResult = (examination: Examination): TestResult => {
  return {
    id: examination.examinationId,
    date: new Date(examination.examinationDate).toLocaleDateString('vi-VN'),
    type: examination.examinationDescription.includes('IVF') ? 'Khám IVF' : 
          examination.examinationDescription.includes('IUI') ? 'Khám IUI' : 'Khám tổng quát',
    result: examination.result,
    details: examination.examinationDescription,
    status: examination.status,
    note: examination.note
  };
};

interface Appointment {
  id: string;
  date: string;
  time: string;
  purpose: string;
  status: string;
  note?: string;
  slotName?: string;
}

interface Examinations {
  examinationId: string;
  doctorId: string;
  patientId: string;
  bookingId: string;
  examinationDate: string;
  examinationDescription: string;
  status: string;
  result: string;
  createAt: string;
  note: string;
}

interface TestResult {
  id: string;
  date: string;
  type: string;
  result: string;
  details: string;
  status: string;
  note: string;
}

interface Stage {
  stepOrder: number;
  stepName: string;
  description: string;
}

interface Treatment {
  id: string;
  type: string;
  startDate: string;
  endDate?: string;
  doctor: string;
  status: string;
  progress: number;
  currentStage?: string;
  nextStage?: string;
  nextDate?: string;
  notes: string;
  result?: string;
  giaidoan: string;
  medications: Medication[];
  appointments: Appointment[];
  testResults: TestResult[];
  stages: Stage[];
}

// Hàm ánh xạ TreatmentStep sang Stage
const mapTreatmentStepToStage = (treatmentStep: TreatmentStep): Stage => {
  return {
    stepOrder: treatmentStep.stepOrder,
    stepName: treatmentStep.stepName,
    description: treatmentStep.description
  };
};

// Hàm ánh xạ TreatmentPlan sang Treatment
const mapToTreatment = (plan: TreatmentPlan, medications: Medication[], appointments: Appointment[], testResults: TestResult[], steps: TreatmentStep[] = []): Treatment => {
  const completedProcesses = plan.treatmentProcesses.filter(p => p.status === "completed").length;
  const totalProcesses = plan.treatmentProcesses.length;
  const progress = totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;

  const currentProcess = plan.treatmentProcesses.find(p => p.status === "in-progress");
  const nextProcess = plan.treatmentProcesses.find(p => p.status === "pending");

  const stages: Stage[] = steps.map(step => mapTreatmentStepToStage(step));

  return {
    id: plan.treatmentPlanId,
    type: plan.method,
    startDate: plan.startDate,
    endDate: plan.endDate,
    doctor: plan.doctor.doctorName,
    status: plan.status.toLowerCase(),
    progress,
    currentStage: currentProcess?.method,
    nextStage: nextProcess?.method,
    nextDate: nextProcess?.scheduledDate,
    notes: plan.treatmentDescription || "Không có ghi chú",
    result: plan.treatmentProcesses.find(p => p.result)?.result,
    medications,
    appointments,
    testResults,
    stages,
    giaidoan: plan.giaidoan ?? "" // Ensure giaidoan is always a string
  };
};

const PatientTreatments = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedStages, setExpandedStages] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();
  const { treatmentPlanId } = useParams();

  const toggleStageDescription = (index: number) => {
    setExpandedStages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = localStorage.getItem("userInfo");
        const userId = currentUser ? JSON.parse(currentUser).userId : null;
        if (!userId) {
          throw new Error("Vui lòng đăng nhập để xem thông tin điều trị");
        }

        const patientId = await treatmentPlanAPI.getPatientIdFromUserId(userId);
        const treatmentPlans = await treatmentPlanAPI.getAllTreatmentPlansByPatient(patientId);

        const treatmentPlansWithData = await Promise.all(
          treatmentPlans.map(async (plan) => {
            try {
              const apiMedications = await treatmentPlanAPI.getMedicationsByTreatmentPlanId(plan.treatmentPlanId);
              const medications = apiMedications.map(mapAPIMedicationToMedication);

              const treatmentPlanBookings = await treatmentPlanAPI.getBookingsByTreatmentPlanId(plan.treatmentPlanId);
              const appointments = treatmentPlanBookings.map(mapTreatmentPlanBookingToAppointment);

              const allExaminations: Examinations[] = [];
              for (const booking of treatmentPlanBookings) {
                try {
                  const examinations = await treatmentPlanAPI.getExaminationsByBooking(
                    booking.bookingId, 
                    booking.patientId, 
                    booking.doctorId
                  );
                  allExaminations.push(...examinations);
                } catch (error) {
                  console.error(`Error fetching examinations for booking ${booking.bookingId}:`, error);
                }
              }
              
              const testResults = allExaminations.map(mapExaminationToTestResult);
              const treatmentSteps = await treatmentPlanAPI.getTreatmentStepsByTreatmentPlanId(plan.treatmentPlanId);

              return { plan, medications, appointments, testResults, treatmentSteps };
            } catch (error) {
              console.error(`Error fetching data for plan ${plan.treatmentPlanId}:`, error);
              return { plan, medications: [], appointments: [], testResults: [], treatmentSteps: [] };
            }
          })
        );

        const mappedTreatments = treatmentPlansWithData.map(({ plan, medications, appointments, testResults, treatmentSteps }) => 
          mapToTreatment(plan, medications, appointments, testResults, treatmentSteps)
        );
        setTreatments(mappedTreatments);
        
        if (treatmentPlanId) {
          const targetTreatment = mappedTreatments.find(treatment => treatment.id === treatmentPlanId);
          if (targetTreatment) {
            setSelectedTreatment(targetTreatment);
          } else {
            setSelectedTreatment(mappedTreatments[0] || null);
          }
        } else {
          setSelectedTreatment(mappedTreatments[0] || null);
        }
      } catch (err) {
        setError("Không thể tải dữ liệu điều trị. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [treatmentPlanId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || treatment.giaidoan === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Quá Trình Điều Trị</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeftCircle className="h-5 w-5" />
            Quay lại
          </button>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Tất cả" },
                { value: "in-progress", label: "Đang thực hiện" },
                { value: "pending", label: "Chờ xác nhận" },
                { value: "completed", label: "Đã hoàn thành" },
                { value: "cancelled", label: "Đã hủy" }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo mã điều trị, bác sĩ, loại điều trị..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2">
                Tìm kiếm
              </Button>
            </form>
          </div>
        </motion.div>

        {filteredTreatments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Treatments List */}
            <div className="lg:col-span-1 space-y-4">
              {filteredTreatments.map((treatment) => (
                <motion.div
                  key={treatment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTreatment?.id === treatment.id
                      ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                      : 'border-gray-100'
                  } ${treatmentPlanId === treatment.id ? 'bg-blue-50 border-blue-300' : ''}`}
                  onClick={() => {
                    setSelectedTreatment(treatment);
                    setActiveTab("overview");
                    setExpandedStages({});
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      treatment.giaidoan === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : treatment.giaidoan === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : treatment.giaidoan === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {treatment.giaidoan === 'in-progress'
                        ? 'Đang thực hiện'
                        : treatment.giaidoan === 'completed'
                          ? 'Đã hoàn thành'
                          : treatment.giaidoan === 'pending'
                            ? 'Chờ xác nhận'
                            : 'Đã hủy'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Điều trị {treatment.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">{treatment.doctor}</p>
                  <div className="flex items-center mt-3 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Bắt đầu: {treatment.startDate}</span>
                  </div>
                  {treatment.status === 'completed' && treatment.result && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gray-700">Kết quả: </span>
                      <span className={`font-medium ${treatment.result === 'Thành công' ? 'text-green-600' : 'text-red-600'}`}>
                        {treatment.result}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Treatment Detail */}
            <div className="lg:col-span-3">
              {selectedTreatment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  {/* Treatment Header */}
                  <div className="p-6 border-b border-gray-200 bg-blue-50">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Điều Trị {selectedTreatment.type}
                        </h2>
                        <p className="text-gray-600 text-sm">Bác sĩ phụ trách: {selectedTreatment.doctor}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedTreatment.giaidoan === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedTreatment.giaidoan === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : selectedTreatment.giaidoan === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedTreatment.giaidoan === 'in-progress'
                          ? 'Đang thực hiện'
                          : selectedTreatment.giaidoan === 'completed'
                            ? 'Đã hoàn thành'
                            : selectedTreatment.giaidoan === 'pending'
                              ? 'Chờ xác nhận'
                              : 'Đã hủy'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                          <p className="font-medium text-gray-800">{selectedTreatment.startDate}</p>
                        </div>
                      </div>
                      {selectedTreatment.status === 'completed' && selectedTreatment.endDate && (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Ngày kết thúc</p>
                            <p className="font-medium text-gray-800">{selectedTreatment.endDate}</p>
                          </div>
                        </div>
                      )}
                      {selectedTreatment.status === 'in-progress' && selectedTreatment.nextDate && (
                        <div className="flex items-center">
                          <CalendarClock className="h-5 w-5 mr-2 text-yellow-600" />
                          <div>
                            <p className="text-sm text-gray-500">Ngày tiếp theo</p>
                            <p className="font-medium text-gray-800">{selectedTreatment.nextDate}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                      {[
                        { value: "overview", label: "Tổng quan" },
                        { value: "medications", label: "Thuốc điều trị" },
                        { value: "appointments", label: "Lịch hẹn" },
                        { value: "test-results", label: "Kết quả khám" },
                        { value: "stages", label: "Các giai đoạn" }
                      ].map(tab => (
                        <button
                          key={tab.value}
                          onClick={() => {
                            setActiveTab(tab.value);
                            if (tab.value === "stages") setExpandedStages({});
                          }}
                          className={`py-3 px-6 font-medium text-sm focus:outline-none whitespace-nowrap transition-all ${
                            activeTab === tab.value
                              ? "border-b-2 border-blue-600 text-blue-600"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {selectedTreatment.status === 'in-progress' && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tiến độ điều trị</h3>
                            <div className="mb-4">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Hoàn thành</span>
                                <span className="text-sm font-medium text-gray-700">{selectedTreatment.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div
                                  className="bg-blue-600 h-3 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${selectedTreatment.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                ></motion.div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-start">
                                  <Bookmark className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Giai đoạn hiện tại</p>
                                    <p className="font-medium text-gray-800">{selectedTreatment.currentStage || "Không xác định"}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                  <ArrowUpRight className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">Giai đoạn tiếp theo</p>
                                    <p className="font-medium text-gray-800">{selectedTreatment.nextStage || "Không xác định"}</p>
                                    {selectedTreatment.nextDate && (
                                      <p className="text-sm text-blue-600 mt-1">Ngày: {selectedTreatment.nextDate}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedTreatment.status === 'completed' && selectedTreatment.result && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kết quả điều trị</h3>
                            <div className={`p-4 rounded-lg border ${
                              selectedTreatment.result === 'Thành công'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-start">
                                {selectedTreatment.result === 'Thành công' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                                )}
                                <div>
                                  <p className={`font-medium ${
                                    selectedTreatment.result === 'Thành công' ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {selectedTreatment.result}
                                  </p>
                                  <p className="text-gray-600 mt-1">{selectedTreatment.notes}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ghi chú từ bác sĩ</h3>
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="flex items-start">
                              <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                              <p className="text-gray-700">{selectedTreatment.notes}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { icon: Pill, label: "Thuốc điều trị", value: `${selectedTreatment.medications.length} loại thuốc` },
                              { icon: Calendar, label: "Lịch hẹn", value: `${selectedTreatment.appointments.length} lịch hẹn` },
                              { icon: TestTube, label: "Kết quả khám", value: `${selectedTreatment.testResults.length} kết quả` }
                            ].map((item, index) => (
                              <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                  <item.icon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                                    <p className="text-sm text-gray-600">{item.value}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Medications Tab */}
                    {activeTab === "medications" && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thuốc điều trị</h3>
                        {selectedTreatment.medications.length > 0 ? (
                          <div className="space-y-4">
                            {selectedTreatment.medications.map((medication, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                              >
                                <div className="flex items-center mb-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    {medication.drugName.includes('inject') ? (
                                      <Syringe className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <Pill className="h-5 w-5 text-blue-600" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800">{medication.drugName}</h4>
                                    <p className="text-sm text-gray-500">{medication.drugType}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Loại thuốc</p>
                                    <p className="font-medium text-gray-800">{medication.drugType}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Mô tả thuốc</p>
                                    <p className="font-medium text-gray-800">{medication.description}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Pill className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">Không có thông tin về thuốc điều trị.</p>
                          </div>
                        )}
                        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-800">Lưu ý quan trọng</p>
                              <p className="text-gray-600 mt-1">
                                Luôn tuân thủ chính xác liều lượng và thời gian dùng thuốc. Nếu có bất kỳ tác dụng phụ nào, hãy liên hệ ngay với bác sĩ.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === "appointments" && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch hẹn điều trị</h3>
                        {selectedTreatment.appointments.length > 0 ? (
                          <div className="space-y-4">
                            {selectedTreatment.appointments.map((appointment, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                              >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                  <div className="flex items-center mb-3 md:mb-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                      <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-800">{appointment.purpose}</h4>
                                      <div className="flex items-center mt-1 text-gray-500 text-sm">
                                        <Calendar className="h-4 w-4 mr-1" /> {appointment.date}
                                        <Clock className="h-4 w-4 ml-3 mr-1" /> {appointment.time} : {appointment.slotName}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      appointment.status === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : appointment.status === 'confirmed'
                                          ? 'bg-blue-100 text-blue-800'
                                          : appointment.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                      {appointment.status === 'pending' 
                                        ? 'Chờ xác nhận' 
                                        : appointment.status === 'confirmed'
                                          ? 'Đã xác nhận'
                                          : appointment.status === 'completed'
                                            ? 'Đã hoàn thành'
                                            : 'Đã hủy'}
                                    </span>
                                  </div>
                                </div>
                                {appointment.note && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <p className="text-sm text-gray-600">
                                        <span className="font-medium">Ghi chú:</span> {appointment.note}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                                    <Link to={`/patient/appointments`}>
                                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                        Xem chi tiết
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Calendar className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">Chưa có lịch hẹn nào cho kế hoạch điều trị này.</p>
                            <Link to="/booking">
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                Đặt lịch hẹn mới
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Test Results Tab */}
                    {activeTab === "test-results" && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kết quả khám bệnh</h3>
                        {selectedTreatment.testResults.length > 0 ? (
                          <div className="space-y-4">
                            {selectedTreatment.testResults.map((result, index) => (
                              <motion.div
                                key={result.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                              >
                                <div className="flex items-center mb-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    {result.type.includes('IVF') ? (
                                      <Microscope className="h-5 w-5 text-blue-600" />
                                    ) : result.type.includes('IUI') ? (
                                      <TestTube className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <BarChart className="h-5 w-5 text-blue-600" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-800">{result.type}</h4>
                                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        result.status === 'completed'
                                          ? 'bg-green-100 text-green-800'
                                          : result.status === 'in-progress'
                                            ? 'bg-blue-100 text-blue-800'
                                            : result.status === 'cancelled'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {result.status === 'completed'
                                          ? 'Đã hoàn thành'
                                          : result.status === 'in-progress'
                                            ? 'Đang thực hiện'
                                            : result.status === 'cancelled'
                                              ? 'Đã hủy'
                                              : 'Chờ xác nhận'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{result.date}</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">Mô tả khám bệnh:</span>
                                    <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">Kết quả:</span>
                                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                                      <p className="text-sm text-gray-700">{result.result}</p>
                                    </div>
                                  </div>
                                  {result.note && (
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                      <div className="flex items-start">
                                        <Info className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-yellow-800">Ghi chú từ bác sĩ:</p>
                                          <p className="text-sm text-yellow-700 mt-1">{result.note}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <TestTube className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">Chưa có kết quả khám bệnh nào cho kế hoạch điều trị này.</p>
                            <p className="text-sm text-gray-400">Kết quả khám sẽ được cập nhật sau mỗi lần thăm khám.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stages Tab */}
                    {activeTab === "stages" && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Các giai đoạn điều trị</h3>
                        {selectedTreatment.stages.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            <div className="space-y-6">
                              {selectedTreatment.stages
                                .sort((a, b) => a.stepOrder - b.stepOrder)
                                .map((stage, index) => {
                                  const isExpanded = expandedStages[index];
                                  const shouldTruncate = stage.description.length > 150;
                                  const displayDescription = isExpanded || !shouldTruncate 
                                    ? stage.description 
                                    : truncateDescription(stage.description);
                                  
                                  return (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: index * 0.1 }}
                                      className="relative flex items-start"
                                    >
                                      <div className="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center z-10 bg-blue-100 border-2 border-white shadow-sm">
                                        <span className="text-sm font-medium text-blue-600">{stage.stepOrder}</span>
                                      </div>
                                      <div className="ml-16 bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full">
                                        <h4 className="font-semibold text-blue-600 mb-2">{stage.stepName}</h4>
                                        <div className="text-gray-600 leading-relaxed">
                                          <p className="whitespace-pre-wrap">{displayDescription}</p>
                                          {shouldTruncate && (
                                            <button
                                              onClick={() => toggleStageDescription(index)}
                                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus:underline transition-colors"
                                            >
                                              {isExpanded ? (
                                                <span className="flex items-center">
                                                  Ẩn bớt
                                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                  </svg>
                                                </span>
                                              ) : (
                                                <span className="flex items-center">
                                                  Xem thêm
                                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                  </svg>
                                                </span>
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-2">Không có thông tin về các giai đoạn điều trị.</p>
                            <p className="text-sm text-gray-400">Các giai đoạn điều trị sẽ được cập nhật khi có kế hoạch chi tiết.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Không tìm thấy quá trình điều trị</h3>
            <p className="text-gray-500 mb-6">
              {activeFilter === "all" 
                ? "Bạn chưa có quá trình điều trị nào. Hãy đặt lịch tư vấn để bắt đầu." 
                : `Không tìm thấy quá trình điều trị nào ở trạng thái "${
                    activeFilter === "in-progress" 
                      ? "đang thực hiện" 
                      : activeFilter === "completed" 
                        ? "đã hoàn thành" 
                        : activeFilter === "pending"
                          ? "chờ xác nhận"
                          : "đã hủy"
                  }".`}
            </p>
            <Link to="/booking">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                Đặt lịch tư vấn
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Treatment Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-10 bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hướng dẫn về quá trình điều trị</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Quá trình IUI",
                description: "Quá trình IUI thường kéo dài 2-3 tuần cho một chu kỳ, bao gồm kích thích buồng trứng, theo dõi nang trứng, và bơm tinh trùng vào tử cung.",
                points: [
                  "Ít xâm lấn hơn IVF",
                  "Chi phí thấp hơn",
                  "Thường được thử trước IVF"
                ]
              },
              {
                title: "Quá trình IVF",
                description: "Quá trình IVF thường kéo dài 4-6 tuần cho một chu kỳ, bao gồm kích thích buồng trứng, chọc hút trứng, thụ tinh trong phòng thí nghiệm và chuyển phôi.",
                points: [
                  "Tỷ lệ thành công cao hơn IUI",
                  "Phù hợp cho nhiều loại vô sinh",
                  "Có thể trữ đông phôi cho lần sau"
                ]
              }
            ].map((guide, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-800 mb-2">{guide.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                <div className="space-y-2">
                  {guide.points.map((point, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientTreatments;