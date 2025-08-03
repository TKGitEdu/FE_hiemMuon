import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import treatmentPlanAPI from "../../api/patientApi/treatmentPlanAPI";
import type { TreatmentPlan, TreatmentStep } from "../../api/patientApi/treatmentPlanAPI";
import { bookingApi, getPatientDetailIdByPatientId } from "../../api/patientApi/bookingAPI";
import type { Booking } from "../../api/patientApi/bookingAPI";

export default function ComponentTrackingTRM() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientDetailId, setPatientDetailId] = useState<string | null>(null);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [treatmentSteps, setTreatmentSteps] = useState<Record<string, TreatmentStep[]>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo).userId : null;
  });
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Hàm lấy thông tin patient từ localStorage
  const getPatientInfoFromLocalStorage = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) return null;
      
      const parsedUserInfo = JSON.parse(userInfo);
      const patientId = localStorage.getItem("patientId");
      
      return {
        userId: parsedUserInfo.userId,
        patientId: patientId || null
      };
    } catch (error) {
      console.error("Error parsing userInfo from localStorage:", error);
      return null;
    }
  };

  // Lắng nghe thay đổi localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const patientInfo = getPatientInfoFromLocalStorage();
      const newUserId = patientInfo?.userId || null;
      const newPatientId = patientInfo?.patientId || null;
      
      if (newUserId !== userId) {
        setUserId(newUserId);
        setPatientId(newPatientId);
        setPatientDetailId(null);
        setTreatmentPlans([]);
        setTreatmentSteps({});
        setBookings([]);
        setLoading(true);
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userId]);

  // Lấy patientId từ localStorage và patientDetailId từ API
  useEffect(() => {
    const patientInfo = getPatientInfoFromLocalStorage();
    
    if (patientInfo?.userId && patientInfo?.patientId) {
      setUserId(patientInfo.userId);
      setPatientId(patientInfo.patientId);
      
      setLoading(true);
      setError(null);
      
      getPatientDetailIdByPatientId(patientInfo.patientId)
        .then((detailId) => {
          setPatientDetailId(detailId);
        })
        .catch((err) => {
          console.error("Lỗi lấy patientDetailId:", err);
          setPatientDetailId(null);
          setError("Lỗi lấy thông tin chi tiết bệnh nhân");
        })
        .finally(() => setLoading(false));
    } else {
      setUserId(null);
      setPatientId(null);
      setPatientDetailId(null);
      setTreatmentPlans([]);
      setTreatmentSteps({});
      setBookings([]);
      setLoading(false);
    }
  }, []);

  // Lấy bookings và treatmentPlans
  useEffect(() => {
    if (patientId && patientDetailId) {
      setLoading(true);
      setError(null);
      Promise.all([
        bookingApi.getMyBookings(),
        treatmentPlanAPI.getAllTreatmentPlansByPatient(patientId),
      ])
        .then(async ([bookingsData, plans]) => {
          setBookings(bookingsData);

          const matchedPlans = plans.filter((plan) =>
            bookingsData.some(
              (booking) =>
                booking.patientId === patientId &&
                booking.doctorId === plan.doctorId &&
                booking.serviceId === plan.serviceId &&
                patientDetailId === plan.patientDetailId
            )
          );
          setTreatmentPlans(matchedPlans);

          const stepsPromises = matchedPlans.map(plan => 
            treatmentPlanAPI.getTreatmentStepsByTreatmentPlanId(plan.treatmentPlanId)
              .then(steps => ({ planId: plan.treatmentPlanId, steps }))
              .catch(err => {
                console.error(`Error fetching steps for plan ${plan.treatmentPlanId}:`, err);
                return { planId: plan.treatmentPlanId, steps: [] };
              })
          );

          const stepsResults = await Promise.all(stepsPromises);
          const stepsMap = stepsResults.reduce((acc, { planId, steps }) => {
            acc[planId] = steps;
            return acc;
          }, {} as Record<string, TreatmentStep[]>);
          
          setTreatmentSteps(stepsMap);
        })
        .catch((err) => {
          console.error("Lỗi tải dữ liệu:", err);
          setError("Lỗi tải dữ liệu điều trị hoặc lịch hẹn");
        })
        .finally(() => setLoading(false));
    } else {
      setTreatmentPlans([]);
      setTreatmentSteps({});
      setBookings([]);
    }
  }, [patientId, patientDetailId]);

  // Hàm parse treatmentDescription (deprecated)
  function parseTreatmentDescription(description: string): string[] {
    if (!description) return [];
    return description
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // Hàm tính tiến độ điều trị
  function calculateTreatmentProgressFromSteps(treatmentPlanId: string, currentStatus: string): {
    progress: number;
    currentStage: string;
    nextStage: string;
    totalSteps: number;
    completedSteps: number;
  } {
    const steps = treatmentSteps[treatmentPlanId] || [];
    
    if (steps.length === 0) {
      return {
        progress: 0,
        currentStage: currentStatus || "Chưa bắt đầu",
        nextStage: "Chưa xác định",
        totalSteps: 0,
        completedSteps: 0
      };
    }

    const sortedSteps: TreatmentStep[] = steps.sort((a, b) => a.stepOrder - b.stepOrder);
    
    let completedSteps = 0;
    let currentStage = "Chưa bắt đầu";
    let nextStage = "Hoàn thành";

    if (currentStatus) {
      const currentStepIndex = sortedSteps.findIndex(step => 
        step.stepName.toLowerCase() === currentStatus.toLowerCase()
      );

      if (currentStepIndex !== -1) {
        completedSteps = currentStepIndex + 1;
        currentStage = sortedSteps[currentStepIndex].stepName;
        nextStage = currentStepIndex + 1 < sortedSteps.length 
          ? sortedSteps[currentStepIndex + 1].stepName 
          : "Hoàn thành";
      } else {
        const statusLower = currentStatus.toLowerCase();
        
        if (statusLower === "completed" || statusLower === "hoàn thành") {
          completedSteps = sortedSteps.length;
          currentStage = "Hoàn thành";
          nextStage = "Hoàn thành";
        } else if (statusLower === "cancelled" || statusLower === "đã hủy") {
          completedSteps = 0;
          currentStage = "Đã hủy";
          nextStage = "Không áp dụng";
        } else if (statusLower === "in-progress" || statusLower === "đang tiến hành") {
          completedSteps = 1;
          currentStage = sortedSteps[0]?.stepName || "Đang tiến hành";
          nextStage = sortedSteps[1]?.stepName || "Hoàn thành";
        } else if( statusLower === "pending") {
          completedSteps = 0;
          currentStage = "bắt đầu";
          nextStage = sortedSteps[0]?.stepName || "Chưa xác định";
        } else {
          completedSteps = 0;
          currentStage = currentStatus;
          nextStage = sortedSteps[0]?.stepName || "Chưa xác định";
        }
      }
    } else {
      completedSteps = 0;
      currentStage = "Chưa bắt đầu";
      nextStage = sortedSteps[0]?.stepName || "Chưa xác định";
    }

    const progress = sortedSteps.length > 0 ? Math.round((completedSteps / sortedSteps.length) * 100) : 0;

    return {
      progress,
      currentStage,
      nextStage,
      totalSteps: sortedSteps.length,
      completedSteps
    };
  }

  // Hàm tính tiến độ điều trị cũ (deprecated)
  function calculateTreatmentProgress(status: string, steps: string[]): number {
    if (!status || steps.length === 0) return 0;
    const currentIndex = steps.findIndex(
      (step) => step.toLowerCase() === status.toLowerCase()
    );
    if (currentIndex === -1) return 0;
    if (currentIndex === steps.length - 1) return 100;
    return Math.round(((currentIndex + 1) / steps.length) * 100);
  }

  // Hàm toggle trạng thái mở rộng ghi chú
  const toggleNoteExpansion = (planId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      role="region"
      aria-label="Theo dõi điều trị"
    >
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Theo dõi điều trị</h2>
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 flex justify-center items-center gap-2"
            role="status"
            aria-live="polite"
          >
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 text-sm">Đang tải...</span>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 text-center"
            role="alert"
          >
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <Button
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-sm"
              onClick={() => {
                const patientInfo = getPatientInfoFromLocalStorage();
                
                if (patientInfo?.userId && patientInfo?.patientId) {
                  setLoading(true);
                  setError(null);
                  
                  getPatientDetailIdByPatientId(patientInfo.patientId)
                    .then((detailId) => {
                      setUserId(patientInfo.userId);
                      setPatientId(patientInfo.patientId);
                      setPatientDetailId(detailId);
                    })
                    .catch((err) => {
                      console.error("Lỗi lấy patientDetailId:", err);
                      setError("Lỗi lấy thông tin chi tiết bệnh nhân");
                    })
                    .finally(() => setLoading(false));
                } else {
                  setError("Không tìm thấy thông tin bệnh nhân trong hệ thống");
                }
              }}
              aria-label="Thử lại tải dữ liệu"
              disabled={!getPatientInfoFromLocalStorage()?.userId}
            >
              Thử lại
            </Button>
          </motion.div>
        ) : treatmentPlans.length > 0 ? (
          <motion.div
            key="plans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="divide-y divide-gray-100"
          >
            {treatmentPlans.map((plan) => {
              const progressData = calculateTreatmentProgressFromSteps(plan.treatmentPlanId, plan.status);
              const steps = parseTreatmentDescription(plan.treatmentDescription);
              const fallbackProgress = calculateTreatmentProgress(plan.status, steps);
              const fallbackCurrentStage = plan.status || "Chưa bắt đầu";
              const fallbackNextStage = steps[
                steps.findIndex(
                  (step) => step.toLowerCase() === plan.status?.toLowerCase()
                ) + 1
              ] || "Hoàn thành";

              const progress = progressData.totalSteps > 0 ? progressData.progress : fallbackProgress;
              const currentStage = progressData.totalSteps > 0 ? progressData.currentStage : fallbackCurrentStage;
              const nextStage = progressData.totalSteps > 0 ? progressData.nextStage : fallbackNextStage;
              
              const nextDate = plan.endDate
                ? new Date(plan.endDate).toLocaleDateString("vi-VN")
                : "Chưa xác định";
              const notes = plan.ghiChu || "Không có ghi chú";
              const isNoteLong = notes.length > 100;

              const relatedBooking = bookings.find(
                (booking) =>
                  booking.patientId === patientId &&
                  booking.doctorId === plan.doctorId &&
                  booking.serviceId === plan.serviceId &&
                  patientDetailId === plan.patientDetailId
              );

              return (
                <motion.div
                  key={plan.treatmentPlanId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                    relatedBooking?.status.toLowerCase() === "cancelled" ? "opacity-50" : ""
                  }`}
                  role="article"
                  aria-labelledby={`treatment-${plan.treatmentPlanId}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <h3
                        id={`treatment-${plan.treatmentPlanId}`}
                        className="text-base font-semibold text-gray-900"
                      >
                        {plan.method || "Chưa xác định"}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(plan.startDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          Tiến độ
                          {progressData.totalSteps > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({progressData.completedSteps}/{progressData.totalSteps})
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-medium text-blue-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="bg-blue-600 h-2 rounded-full"
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Hiện tại:</span>
                        <span className="text-xs font-medium text-gray-900">{currentStage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Tiếp theo:</span>
                        <span className="text-xs font-medium text-blue-600">{nextStage}</span>
                        <span className="text-xs text-gray-500">({nextDate})</span>
                      </div>
                    </div>

                    {!!notes && (
                      <div className="bg-yellow-50 p-2 rounded-md border border-yellow-100">
                        <p className="text-xs text-gray-700 font-medium mb-1">Ghi chú:</p>
                        <p 
                          className={`text-xs text-gray-600 ${
                            isNoteLong && !expandedNotes.has(plan.treatmentPlanId) ? 'overflow-hidden' : ''
                          }`}
                          style={{
                            display: isNoteLong && !expandedNotes.has(plan.treatmentPlanId) ? '-webkit-box' : 'block',
                            WebkitLineClamp: isNoteLong && !expandedNotes.has(plan.treatmentPlanId) ? 2 : 'unset',
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.4em',
                            maxHeight: isNoteLong && !expandedNotes.has(plan.treatmentPlanId) ? '2.8em' : 'none'
                          }}
                        >
                          {notes}
                        </p>
                        {isNoteLong && (
                          <button
                            onClick={() => toggleNoteExpansion(plan.treatmentPlanId)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 focus:outline-none"
                          >
                            {expandedNotes.has(plan.treatmentPlanId) ? (
                              <span className="flex items-center gap-1">
                                <ChevronUp className="h-3 w-3" /> Thu gọn
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <ChevronDown className="h-3 w-3" /> Xem thêm
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                  {relatedBooking?.status.toLowerCase() === "cancelled" && (
                    <span className="text-xs text-red-500 font-medium">Booing lịch hẹn đã hủy</span>
                  )}
                  {relatedBooking?.status.toLowerCase() === "pending" && (
                    <span className="text-xs text-yellow-500 font-medium">Booking chờ xác nhận</span>
                  )}
                  {relatedBooking?.status.toLowerCase() === "in-progress" && (
                    <span className="text-xs text-blue-500 font-medium">Booking đang tiến hành</span>
                  )}
                  {relatedBooking?.status.toLowerCase() === "completed" && (
                    <span className="text-xs text-green-500 font-medium">Booking đã hoàn thành</span>
                  )}
                  <Link
                      to={relatedBooking?.status.toLowerCase() === "cancelled" ? "#" : `/patient/treatments/${plan.treatmentPlanId}`}
                      onClick={e => {
                        if (relatedBooking?.status.toLowerCase() === "cancelled") {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Button
                        className={`text-xs ${relatedBooking?.status.toLowerCase() === "cancelled" ? "bg-blue-300 cursor-not-allowed opacity-50" : "bg-blue-600 hover:bg-blue-700"}`}
                        aria-label={`Xem chi tiết điều trị ${plan.method || "Chưa xác định"}`}
                        disabled={relatedBooking?.status.toLowerCase() === "cancelled"}
                      >
                        Chi tiết
                      </Button>
                  </Link>
                </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 text-center"
            role="alert"
          >
            <p className="text-gray-500 text-sm">Chưa có quá trình điều trị</p>
            <Link to="/services" className="mt-2 inline-block">
              <Button
                className="text-xs bg-blue-600 hover:bg-blue-700"
                aria-label="Tìm hiểu dịch vụ điều trị"
              >
                Tìm hiểu dịch vụ
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}