import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Calendar,
  User,
  ArrowRight,
  FileBarChart,
  ListTodo,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { getDoctorTreatmentPlans, updateTreatmentPlanStandard } from "../../api/doctorApi/dashboardAPI";
import { getTreatmentSteps, createOrUpdateTreatmentSteps } from "../../api/doctorApi/treatmentRecordAPI";
import type { TreatmentPlan, UpdateTreatmentPlanRequest } from "../../api/doctorApi/dashboardAPI";
import type { TreatmentStep, CreateStepRequest } from "../../api/doctorApi/treatmentRecordAPI";

// Define interface for user info from localStorage
interface UserInfo {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  username: string;
  roleId: string;
  address: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  role: {
    roleId: string | null;
    roleName: string;
  };
  doctor: {
    doctorId: string;
    userId: string;
    doctorName: string | null;
    specialization: string | null;
    phone: string | null;
    email: string | null;
    experience: number | null;
    qualification: string | null;
    status: string | null;
  } | null;
  patients: any[];
}

const DoctorTreatmentRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'treatmentstep'>('overview');
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [allTreatmentSteps, setAllTreatmentSteps] = useState<{ [key: string]: TreatmentStep[] }>({});
  const [stepFormData, setStepFormData] = useState<CreateStepRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<UserInfo | null>(null);
  const [updateFormData, setUpdateFormData] = useState<Partial<UpdateTreatmentPlanRequest>>({});
  const location = useLocation();
  
  // Get treatmentPlanId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const treatmentPlanIdFromUrl = queryParams.get('treatmentPlanId');
  
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user info from localStorage
        const userInfoString = localStorage.getItem('userInfo');
        if (!userInfoString) {
          setError("User information not found. Please log in again.");
          setLoading(false);
          return;
        }
        
        const parsedUserInfo: UserInfo = JSON.parse(userInfoString);
        console.log("User info from localStorage:", parsedUserInfo);
        setDoctorInfo(parsedUserInfo);
        
        // Use doctor info directly from localStorage
        if (parsedUserInfo.doctor && parsedUserInfo.doctor.doctorId) {
          const doctorId = parsedUserInfo.doctor.doctorId;
          setDoctorId(doctorId);
          console.log("Doctor ID from localStorage:", doctorId);
          
          // Get treatment plans from API using the doctor ID from localStorage
          const treatmentPlansResponse = await getDoctorTreatmentPlans(doctorId);
          console.log("Treatment plans response:", treatmentPlansResponse);
          setTreatmentPlans(treatmentPlansResponse);
          
          // Load treatment steps for all treatment plans
          const stepsPromises = treatmentPlansResponse.map(async (plan: TreatmentPlan) => {
            try {
              const stepsResponse = await getTreatmentSteps(plan.treatmentPlanId);
              return { 
                treatmentPlanId: plan.treatmentPlanId, 
                steps: stepsResponse.steps 
              };
            } catch (error) {
              console.error(`Error loading steps for plan ${plan.treatmentPlanId}:`, error);
              return { 
                treatmentPlanId: plan.treatmentPlanId, 
                steps: [] 
              };
            }
          });
          
          const allStepsData = await Promise.all(stepsPromises);
          const stepsMap: { [key: string]: TreatmentStep[] } = {};
          allStepsData.forEach(({ treatmentPlanId, steps }) => {
            stepsMap[treatmentPlanId] = steps;
          });
          setAllTreatmentSteps(stepsMap);
          
          // If treatmentPlanId is provided in URL, set it as selected
          if (treatmentPlanIdFromUrl) {
            setSelectedRecord(treatmentPlanIdFromUrl);
            if (stepsMap[treatmentPlanIdFromUrl]) {
              setTreatmentSteps(stepsMap[treatmentPlanIdFromUrl]);
            }
          }
        } else {
          setError("Doctor information not found in user data.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [treatmentPlanIdFromUrl]);
  
  const recordsPerPage = 3;

  // Filter records
  const filteredRecords = treatmentPlans.filter((record) => {
    const matchesSearch = record.patientDetailName.includes(searchTerm.toLowerCase()) ||
      record.treatmentPlanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.method.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType ? record.method === selectedType : true;
    const matchesStage = selectedStage ? record.status.includes(selectedStage) : true;
    
    return matchesSearch && matchesType && matchesStage;
  });

  // Get current records for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  // Get selected record details
  const recordDetails = treatmentPlans.find(record => record.treatmentPlanId === selectedRecord);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const pageCount = Math.ceil(filteredRecords.length / recordsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType(null);
    setSelectedStage(null);
    setCurrentPage(1);
    setError(null);
    setSuccessMessage(null);
  };

  // Clear error and success messages when user interacts with form
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Load treatment steps for selected record
  // NOTE: Hàm này load tất cả steps cho treatment plan được chọn
  // và cập nhật vào allTreatmentSteps để dùng cho dropdown status
  const loadTreatmentSteps = async (treatmentPlanId: string) => {
    try {
      const stepsResponse = await getTreatmentSteps(treatmentPlanId);
      setTreatmentSteps(stepsResponse.steps);
      
      // Update allTreatmentSteps state để các component khác có thể dùng
      setAllTreatmentSteps(prev => ({
        ...prev,
        [treatmentPlanId]: stepsResponse.steps
      }));
      
      // Initialize form data with existing steps cho tab "Các bước điều trị"
      setStepFormData(stepsResponse.steps.map(step => ({
        stepOrder: step.stepOrder,
        stepName: step.stepName
      })));
    } catch (error) {
      console.error("Error loading treatment steps:", error);
      // If no steps exist, start with empty form
      setTreatmentSteps([]);
      setStepFormData([{ stepOrder: 1, stepName: "" }]);
    }
  };

  // Handle update treatment steps
  const handleUpdateTreatmentSteps = async () => {
    if (!selectedRecord) return;

    try {
      setUpdating(true); // Bắt đầu loading
      // Validate step data
      const validSteps = stepFormData.filter(step => step.stepName.trim() !== '');
      if (validSteps.length === 0) {
        setError("Vui lòng thêm ít nhất một bước điều trị");
        return;
      }

      console.log("Updating treatment steps:", validSteps);
      const success = await createOrUpdateTreatmentSteps(selectedRecord, validSteps);

      if (success) {
        console.log("Treatment steps updated successfully");
        await loadTreatmentSteps(selectedRecord); // Reload steps (this will also update allTreatmentSteps)
        setError(null);
        setSuccessMessage("Các bước điều trị đã được cập nhật thành công!");
        
        // Cuộn lên đầu trang để thấy thông báo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating treatment steps:", error);
      if (error instanceof Error) {
        setError(`Không thể cập nhật các bước điều trị: ${error.message}`);
      } else {
        setError("Không thể cập nhật các bước điều trị. Vui lòng thử lại.");
      }
    } finally {
      setUpdating(false); // Kết thúc loading
    }
  };

  // Add new step to form
  const addNewStep = () => {
    const newStepOrder = stepFormData.length > 0 ? Math.max(...stepFormData.map(s => s.stepOrder)) + 1 : 1;
    setStepFormData([...stepFormData, { stepOrder: newStepOrder, stepName: "" }]);
  };

  // Remove step from form
  const removeStep = (index: number) => {
    const newSteps = stepFormData.filter((_, i) => i !== index);
    setStepFormData(newSteps);
  };

  // Update step in form
  const updateStep = (index: number, field: keyof CreateStepRequest, value: string | number) => {
    const newSteps = [...stepFormData];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setStepFormData(newSteps);
  };
  const handleUpdateTreatmentPlan = async () => {
    if (!selectedRecord || !doctorId) return;

    try {
      setUpdating(true); // Bắt đầu loading
      // Validate form data
      const currentRecord = treatmentPlans.find(record => record.treatmentPlanId === selectedRecord);
      if (!currentRecord) {
        setError("Không tìm thấy kế hoạch điều trị");
        return;
      }

      // Validate dates
      const startDate = updateFormData.startDate || currentRecord.startDate.split('T')[0];
      const endDate = updateFormData.endDate || currentRecord.endDate.split('T')[0];
      
      if (new Date(startDate) > new Date(endDate)) {
        setError("Ngày bắt đầu không thể sau ngày kết thúc");
        return;
      }

      // IMPORTANT: status field sẽ chứa stepName được chọn từ dropdown
      // Backend expect status = stepName của step hiện tại, không phải trạng thái chung
      const updateData: UpdateTreatmentPlanRequest = {
        treatmentPlanId: selectedRecord,
        doctorId: doctorId,
        method: updateFormData.method?.trim() || currentRecord.method,
        patientDetailId: currentRecord.patientDetailId,
        startDate: startDate,
        endDate: endDate,
        treatmentDescription: updateFormData.treatmentDescription?.trim() || currentRecord.treatmentDescription,
        status: updateFormData.status?.trim() || currentRecord.status, // Đây là stepName được chọn
        giaidoan: updateFormData.giaidoan?.trim() || currentRecord.giaidoan || "",
        ghiChu: updateFormData.ghiChu?.trim() || currentRecord.ghiChu || undefined,
      };

      console.log("Sending update request:", updateData);

      const success = await updateTreatmentPlanStandard(updateData);

      if (success) {
        console.log("Treatment plan updated successfully");
        // Refresh treatment plans
        const updatedTreatmentPlans = await getDoctorTreatmentPlans(doctorId);
        setTreatmentPlans(updatedTreatmentPlans);
        setUpdateFormData({});
        setActiveTab('overview');
        setError(null); // Clear any previous errors
        setSuccessMessage("Kế hoạch điều trị đã được cập nhật thành công!");
        // Cuộn lên đầu trang để thấy thông báo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating treatment plan:", error);
      if (error instanceof Error) {
        setError(`Không thể cập nhật kế hoạch điều trị: ${error.message}`);
      } else {
        setError("Không thể cập nhật kế hoạch điều trị. Vui lòng thử lại.");
      }
    } finally {
      setUpdating(false); // Kết thúc loading
    }
  };

  // Calculate progress percentage based on treatment steps completion
  // NOTE: Progress được tính dựa trên status hiện tại (step name) và tổng số steps
  // Vì status thực chất là tên của step hiện tại, ta có thể dùng nó để ước tính tiến độ
  const getProgressPercentage = (status: string, treatmentPlanId?: string, steps?: TreatmentStep[]) => {
    // If we have step data for this specific treatment plan, calculate based on steps
    if (treatmentPlanId && steps && steps.length > 0) {
      // Sort steps by stepOrder to get proper sequence
      const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
      
      // Tìm step hiện tại dựa trên status (status = stepName)
      const currentStepIndex = sortedSteps.findIndex(step => step.stepName === status);
      
      if (currentStepIndex >= 0) {
        // Tính progress dựa trên vị trí của step hiện tại
        const progressPercentage = Math.round(((currentStepIndex + 1) / sortedSteps.length) * 100);
        return Math.min(100, Math.max(0, progressPercentage));
      }
      
      // Fallback: nếu không tìm thấy step, dùng logic cũ
      let completedSteps = 0;
      const totalSteps = sortedSteps.length;
      
      switch (status.toLowerCase()) {
        case 'completed':
          completedSteps = totalSteps;
          break;
        case 'near-completion':
          // 90% completion - nearly all steps done
          completedSteps = Math.max(1, Math.floor(totalSteps * 0.9));
          break;
        case 'in-progress':
        case 'ongoing':
          // 50-60% completion - about half the steps done
          completedSteps = Math.max(1, Math.floor(totalSteps * 0.5));
          break;
        case 'started':
          // 25% completion - first few steps done
          completedSteps = Math.max(1, Math.floor(totalSteps * 0.25));
          break;
        case 'pending':
          // 10% completion - planning phase
          completedSteps = 0;
          break;
        case 'cancelled':
          completedSteps = 0;
          break;
        default:
          // Default to 30% if status is unknown
          completedSteps = Math.max(1, Math.floor(totalSteps * 0.3));
      }
      
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
      return Math.min(100, Math.max(0, progressPercentage));
    }
    
    // Fallback to status-based calculation when no steps available
    const statusMap: { [key: string]: number } = {
      'pending': 10,
      'started': 25,
      'in-progress': 50,
      'ongoing': 60,
      'near-completion': 80,
      'completed': 100,
      'cancelled': 0,
    };
    return statusMap[status.toLowerCase()] || 30;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusColorMap: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return statusColorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Get stage display text
  const getStageDisplayText = (giaidoan: string | null | undefined) => {
    if (!giaidoan) return 'Chưa xác định giai đoạn';
    
    const stageMap: { [key: string]: string } = {
      'completed': 'Hoàn thành',
      'in-progress': 'Đang tiến hành',
      'cancelled': 'Đã hủy',
    };
    
    return stageMap[giaidoan.toLowerCase()] || giaidoan;
  };

  // Helper function to get current treatment step for a plan
  // Helper function to get all available steps for dropdown
  // NOTE: Theo logic backend, cột 'status' trong treatment plan thực chất chứa tên của một step cụ thể
  // (ví dụ: "Kích thích nhẹ buồng trứng") chứ không phải trạng thái chung như "Đang điều trị", "Hoàn thành"
  // Hàm này trả về danh sách tất cả steps có thể để user chọn làm status hiện tại
  const getAvailableSteps = (treatmentPlanId: string): Array<{value: string, label: string}> => {
    const steps = allTreatmentSteps[treatmentPlanId];
    if (!steps || steps.length === 0) {
      return [];
    }
    
    // Sắp xếp steps theo thứ tự stepOrder và format cho dropdown
    const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
    return sortedSteps.map(step => ({
      value: step.stepName, // Chỉ lưu stepName vì backend expect status = stepName
      label: `${step.stepOrder}. ${step.stepName}`
    }));
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ điều trị</h1>
            <p className="mt-1 text-gray-600">
              Quản lý và theo dõi tất cả các quá trình điều trị hiện tại
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              className="bg-gray-400 hover:bg-gray-700"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Trở lại
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tìm kiếm theo tên bệnh nhân, ID hoặc phương pháp điều trị..."
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="block border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả phương pháp</option>
                {/* Dynamic options based on available methods */}
                {Array.from(new Set(treatmentPlans.map(plan => plan.method))).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              
              <select
                value={selectedStage || ""}
                onChange={(e) => setSelectedStage(e.target.value || null)}
                className="block border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                {/* Dynamic options based on available statuses */}
                {Array.from(new Set(treatmentPlans.map(plan => plan.status))).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="border-gray-300 text-gray-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Treatment Records List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Danh sách hồ sơ</h2>
                <span className="text-sm text-gray-500">
                  {filteredRecords.length} hồ sơ điều trị
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {currentRecords.length > 0 ? (
                currentRecords.map((record) => (
                  <div 
                    key={record.treatmentPlanId} 
                    onClick={async () => {
                      const newSelectedId = record.treatmentPlanId === selectedRecord ? null : record.treatmentPlanId;
                      setSelectedRecord(newSelectedId);
                      if (newSelectedId) {
                        // Reset form data
                        setUpdateFormData({});
                        
                        // Use existing steps from allTreatmentSteps or load fresh
                        if (allTreatmentSteps[newSelectedId]) {
                          setTreatmentSteps(allTreatmentSteps[newSelectedId]);
                          setStepFormData(allTreatmentSteps[newSelectedId].map(step => ({
                            stepOrder: step.stepOrder,
                            stepName: step.stepName
                          })));
                        } else {
                          await loadTreatmentSteps(newSelectedId);
                        }
                      }
                    }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${record.treatmentPlanId === selectedRecord ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="mr-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{record.patientDetailName}</h3>
                            <p className="text-xs text-gray-500">ID: {record.treatmentPlanId}</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {record.method}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">{record.status}</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${getProgressPercentage(record.status, record.treatmentPlanId, allTreatmentSteps[record.treatmentPlanId])}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Tiến độ: {getProgressPercentage(record.status, record.treatmentPlanId, allTreatmentSteps[record.treatmentPlanId])}%</span>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Bắt đầu: {new Date(record.startDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Kết thúc: {new Date(record.endDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">Không tìm thấy hồ sơ điều trị nào phù hợp với bộ lọc</p>
                  <Button onClick={resetFilters} className="mt-2 bg-blue-600 hover:bg-blue-700">
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {pageCount > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-500">
                  Trang {currentPage} / {pageCount}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="p-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>

         
         
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {recordDetails ? (
              <div>
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Chi tiết điều trị</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recordDetails.status)}`}>
                      {recordDetails.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{recordDetails.patientDetailName}</h3>
                      <div className="flex items-center text-gray-600">
                        <span className="text-sm mr-2">ID: {recordDetails.treatmentPlanId}</span>
                        <span className="text-sm">Bác sĩ: {doctorInfo?.fullName || doctorInfo?.doctor?.doctorName || recordDetails.doctorId}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-100">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
                        activeTab === 'overview'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tổng quan
                    </button>
                    <button
                      onClick={() => setActiveTab('medications')}
                      className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
                        activeTab === 'medications'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={() => setActiveTab('treatmentstep')}
                      className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
                        activeTab === 'treatmentstep'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Các bước điều trị
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div>
                      <div className="mb-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {recordDetails.method}
                            </h3>
                            <p className="text-gray-600">Bắt đầu ngày: {new Date(recordDetails.startDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600">Kết thúc dự kiến: {new Date(recordDetails.endDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Tiến độ điều trị</span>
                            <span className="text-sm font-medium text-gray-700">
                              {getProgressPercentage(recordDetails.status, recordDetails.treatmentPlanId, allTreatmentSteps[recordDetails.treatmentPlanId])}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ 
                                width: `${getProgressPercentage(recordDetails.status, recordDetails.treatmentPlanId, allTreatmentSteps[recordDetails.treatmentPlanId])}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Giai đoạn hiện tại</h4>
                          <p className="text-gray-900">{getStageDisplayText(recordDetails.giaidoan)}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Phương pháp điều trị</h4>
                          <p className="text-gray-900">{recordDetails.method}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Trạng thái (Bước điều trị hiện tại)</h4>
                          {/* 
                            Hiển thị status hiện tại - đây chính là tên của step hiện tại 
                            Ví dụ: "Kích thích nhẹ buồng trứng" thay vì "Đang điều trị"
                          */}
                          <p className="text-gray-900">{recordDetails.status}</p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Mô tả điều trị</h4>
                        <p className="text-gray-700">{recordDetails.treatmentDescription || 'Chưa có mô tả'}</p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Ghi chú của bác sĩ</h4>
                        <p className="text-gray-700">{recordDetails.ghiChu || 'Chưa có ghi chú'}</p>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => setActiveTab('medications')}
                        >
                          <FileBarChart className="mr-2 h-4 w-4" />
                          Cập nhật kế hoạch
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-gray-300 text-gray-700"
                          onClick={() => setActiveTab('treatmentstep')}
                        >
                          <ListTodo className="mr-2 h-4 w-4" />
                          Quản lý bước điều trị
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'medications' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Cập nhật kế hoạch điều trị</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phương pháp điều trị
                          </label>
                          <input
                            type="text"
                            value={updateFormData.method || recordDetails.method}
                            onChange={(e) => {
                              setUpdateFormData({...updateFormData, method: e.target.value});
                              clearMessages();
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ngày bắt đầu
                            </label>
                            <input
                              type="date"
                              value={updateFormData.startDate || recordDetails.startDate.split('T')[0]}
                              onChange={(e) => {
                                setUpdateFormData({...updateFormData, startDate: e.target.value});
                                clearMessages();
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ngày kết thúc
                            </label>
                            <input
                              type="date"
                              value={updateFormData.endDate || recordDetails.endDate.split('T')[0]}
                              onChange={(e) => {
                                setUpdateFormData({...updateFormData, endDate: e.target.value});
                                clearMessages();
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái (Bước điều trị hiện tại)
                          </label>
                          {/* 
                            NOTE: Dropdown này hiển thị tất cả steps có thể, user chọn step name làm status
                            Backend logic: treatmentPlan.status === stepName của step hiện tại
                            Khi update, ta gửi stepName được chọn làm status mới
                          */}
                          <select
                            value={updateFormData.status || recordDetails.status}
                            onChange={(e) => {
                              setUpdateFormData({...updateFormData, status: e.target.value});
                              clearMessages();
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Chọn bước điều trị</option>
                            {getAvailableSteps(recordDetails.treatmentPlanId).map((step) => (
                              <option key={step.value} value={step.value}>{step.label}</option>
                            ))}
                          </select>
                          {getAvailableSteps(recordDetails.treatmentPlanId).length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Chưa có bước điều trị. Vui lòng thêm ở tab "Các bước điều trị"
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả điều trị
                          </label>
                          <textarea
                            value={updateFormData.treatmentDescription || recordDetails.treatmentDescription || ''}
                            onChange={(e) => setUpdateFormData({...updateFormData, treatmentDescription: e.target.value})}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mô tả chi tiết về quá trình điều trị..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giai đoạn
                          </label>
                          <select
                            value={updateFormData.giaidoan || recordDetails.giaidoan || ''}
                            onChange={(e) => setUpdateFormData({...updateFormData, giaidoan: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Chọn giai đoạn</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="in-progress">Đang tiến hành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú
                          </label>
                          <textarea
                            value={updateFormData.ghiChu || recordDetails.ghiChu || ''}
                            onChange={(e) => setUpdateFormData({...updateFormData, ghiChu: e.target.value})}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập ghi chú cho kế hoạch điều trị..."
                          />
                        </div>



                        <div className="flex gap-4 pt-4">
                          <Button
                            onClick={handleUpdateTreatmentPlan}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={updating}
                          >
                            {updating ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Đang cập nhật...
                              </span>
                            ) : (
                              <>
                                <FileBarChart className="mr-2 h-4 w-4" />
                                Cập nhật kế hoạch
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setActiveTab('overview');
                              setUpdateFormData({});
                            }}
                            className="flex-1 border-gray-300 text-gray-700"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'treatmentstep' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Các bước điều trị</h3>
                        <span className="text-sm text-gray-500">
                          {treatmentSteps.length} bước đã có
                        </span>
                      </div>
                      
                      {/* Display current treatment steps */}
                      {treatmentSteps.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Các bước hiện tại</h4>
                          <div className="space-y-3">
                            {treatmentSteps.map((step) => (
                              <div key={step.treatmentStepId} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-medium text-blue-600">{step.stepOrder}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{step.stepName}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {step.treatmentStepId}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Form to add/update treatment steps */}
                      <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Cập nhật các bước điều trị</h4>
                          <Button
                            onClick={addNewStep}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ListTodo className="mr-2 h-4 w-4" />
                            Thêm bước
                          </Button>
                        </div>
                        
                        {stepFormData.length > 0 || treatmentSteps.length > 0 ? (
                          <div className="space-y-4">
                            {/* Nếu stepFormData rỗng nhưng có treatmentSteps, khởi tạo stepFormData */}
                            {stepFormData.length === 0 && treatmentSteps.length > 0 && (
                              <div className="mb-4">
                                <Button
                                  onClick={() => {
                                    setStepFormData(treatmentSteps.map(step => ({
                                      stepOrder: step.stepOrder,
                                      stepName: step.stepName
                                    })));
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Chỉnh sửa các bước hiện tại
                                </Button>
                              </div>
                            )}
                            
                            {stepFormData.map((step, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Thứ tự
                                    </label>
                                    <input
                                      type="number"
                                      value={step.stepOrder}
                                      onChange={(e) => updateStep(index, 'stepOrder', parseInt(e.target.value) || 1)}
                                      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      min="1"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Tên bước
                                    </label>
                                    <input
                                      type="text" 
                                      value={step.stepName}
                                      onChange={(e) => updateStep(index, 'stepName', e.target.value)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Nhập tên bước điều trị..."
                                    />
                                  </div>
                                  <div className="flex-shrink-0">
                                    <Button
                                      onClick={() => removeStep(index)}
                                      size="sm"
                                      variant="outline"
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                      Xóa
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {stepFormData.length > 0 && (
                              <div className="flex gap-4 pt-4">
                                <Button
                                  onClick={handleUpdateTreatmentSteps}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  disabled={updating}
                                >
                                  {updating ? (
                                    <span className="flex items-center justify-center">
                                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                      </svg>
                                      Đang cập nhật...
                                    </span>
                                  ) : (
                                    <>Cập nhật các bước</>
                                  )}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setActiveTab('overview')}
                                  className="flex-1 border-gray-300 text-gray-700"
                                >
                                  Hủy
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ListTodo className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có bước điều trị</h3>
                            <p className="text-gray-500 mb-6">
                              Bắt đầu thêm các bước điều trị để theo dõi tiến độ
                            </p>
                            <Button
                              onClick={addNewStep}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ListTodo className="mr-2 h-4 w-4" />
                              Thêm bước đầu tiên
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Chọn hồ sơ điều trị</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Vui lòng chọn một hồ sơ điều trị từ danh sách bên trái để xem chi tiết
                </p>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700"
                  onClick={() => treatmentPlans.length > 0 && setSelectedRecord(treatmentPlans[0].treatmentPlanId)}
                >
                  Xem hồ sơ đầu tiên
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-8 bg-blue-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tài liệu và hướng dẫn</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-1">Quy trình IUI</h3>
                <p className="text-sm text-gray-600 mb-2">Hướng dẫn chi tiết về các bước trong quy trình IUI</p>
                <Link to="#" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                  Xem tài liệu <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-1">Quy trình IVF</h3>
                <p className="text-sm text-gray-600 mb-2">Hướng dẫn chi tiết về các bước trong quy trình IVF</p>
                <Link to="#" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                  Xem tài liệu <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-1">Chuẩn đoán và đánh giá</h3>
                <p className="text-sm text-gray-600 mb-2">Hướng dẫn đánh giá và chuẩn đoán hiếm muộn</p>
                <Link to="#" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                  Xem tài liệu <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorTreatmentRecords;
