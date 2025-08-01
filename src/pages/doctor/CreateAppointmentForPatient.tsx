import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Calendar, 
  ArrowLeft, 
  CalendarDays, 
  FileText, 
  CheckCircle, 
  Loader2 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { createAppointmentForPatient, getPatientDetails } from "../../api/doctorApi/patientsAPI";
import { bookingApiForBookingPage } from "../../api/patientApi/bookingApiForBookingPage";
import { getAllSlots } from "../../api/doctorApi/appointmentsAPI";
import type { Service } from "../../api/patientApi/bookingApiForBookingPage";
import type { Slot } from "../../api/doctorApi/appointmentsAPI";

interface CreateAppointmentProps {
  patientId?: string;
  onAppointmentCreated?: () => void;
}

// Simplified slot interface for UI
interface SlotForUI {
  slotId: string;
  slotName: string;
  startTime: string;
  endTime: string;
}

type FormData = {
  serviceId: string;
  slotId: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  description: string;
  note: string;
};

const CreateAppointmentForPatient = ({ patientId, onAppointmentCreated }: CreateAppointmentProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<SlotForUI[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [loading, setLoading] = useState({
    patient: false,
    services: true,
    slots: false,
    booking: false
  });
  const [error, setError] = useState({
    patient: "",
    services: "",
    slots: "",
    booking: ""
  });

  // Get patientId from URL params if not provided as prop
  const effectivePatientId = patientId || searchParams.get('patientId') || '';

  // React Hook Form
  const { 
    register, 
    handleSubmit, 
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      serviceId: "",
      appointmentDate: null,
      appointmentTime: "",
      slotId: "",
      description: "Lịch hẹn khám định kỳ",
      note: "Bệnh nhân cần đến khám theo lịch hẹn"
    }
  });

  // Get selected values from the form
  const selectedServiceId = watch("serviceId");
  const selectedDate = watch("appointmentDate");
  const selectedSlotId = watch("slotId");

  useEffect(() => {
    // Fetch patient details
    if (effectivePatientId) {
      const fetchPatientInfo = async () => {
        setLoading(prev => ({ ...prev, patient: true }));
        try {
          const patientData = await getPatientDetails(effectivePatientId);
          setPatientInfo(patientData);
          setLoading(prev => ({ ...prev, patient: false }));
        } catch (error) {
          console.error("Error fetching patient details:", error);
          setError(prev => ({ ...prev, patient: "Lỗi khi tải thông tin bệnh nhân" }));
          setLoading(prev => ({ ...prev, patient: false }));
        }
      };
      
      fetchPatientInfo();
    }

    // Fetch services
    const fetchServices = async () => {
      try {
        const data = await bookingApiForBookingPage.getAllServices();
        setServices(data);
        setLoading(prev => ({ ...prev, services: false }));
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(prev => ({ ...prev, services: "Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau." }));
        setLoading(prev => ({ ...prev, services: false }));
      }
    };

    // Fetch all slots
    const fetchAllSlots = async () => {
      try {
        const data = await getAllSlots();
        setAllSlots(data);
      } catch (err) {
        console.error("Error fetching all slots:", err);
      }
    };

    fetchServices();
    fetchAllSlots();
  }, [effectivePatientId]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDate && allSlots.length > 0) {
      setLoading(prev => ({ ...prev, slots: true }));
      try {
        // Filter available slots for the selected date
        // In a real implementation, you'd need to check against existing bookings for that date
        // For now, we'll just provide all slots as available
        
        // Convert the slots from appointmentsAPI format to the format expected by the component
        const slotsForUI = allSlots.map(slot => ({
          slotId: slot.slotId,
          slotName: slot.slotName,
          startTime: slot.startTime,
          endTime: slot.endTime
        }));
        
        setAvailableSlots(slotsForUI);
        setLoading(prev => ({ ...prev, slots: false }));
      } catch (err) {
        console.error("Error processing available slots:", err);
        setError(prev => ({ ...prev, slots: "Không thể xử lý dữ liệu khung giờ. Vui lòng thử lại sau." }));
        setLoading(prev => ({ ...prev, slots: false }));
      }
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, allSlots]);

  // Handle slot selection
  const handleSlotSelection = (slotId: string, time: string) => {
    setValue("slotId", slotId);
    setValue("appointmentTime", time);
  };

  // Submit form
  const onSubmit = async (data: FormData) => {
    if (!effectivePatientId) {
      alert("Patient ID is required");
      return;
    }
    
    setLoading(prev => ({ ...prev, booking: true }));
    try {
      // Get userId from localStorage
      const userInfo = localStorage.getItem("userInfo");
      const userId = userInfo ? JSON.parse(userInfo).userId : null;

      if (!userId) {
        throw new Error("Không tìm thấy userId trong localStorage");
      }
      
      const appointmentData = {
        patientId: effectivePatientId,
        userId: userId,
        serviceId: data.serviceId,
        slotId: data.slotId,
        dateBooking: data.appointmentDate ? data.appointmentDate.toISOString() : new Date().toISOString(),
        description: data.description,
        note: data.note
      };

      const response = await createAppointmentForPatient(appointmentData);
      
      // Save booking ID
      setBookingId(response.bookingId || "");
      setBookingComplete(true);
      
      // If component is used within another component, call the callback
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
      
      setLoading(prev => ({ ...prev, booking: false }));
    } catch (error) {
      console.error(`Lỗi khi tạo lịch hẹn cho bệnh nhân ${effectivePatientId}:`, error);
      setError(prev => ({ ...prev, booking: `Không thể tạo lịch hẹn: ${error instanceof Error ? error.message : 'Lỗi không xác định'}` }));
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  // Step navigation
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Get selected entities
  const selectedService = services.find(service => service.serviceId === selectedServiceId);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // If used as a component within another component, just return the button
  if (patientId) {
    return (
      <Button
        variant="outline"
        className="w-full border-green-500 text-green-600 hover:bg-green-50"
        onClick={() => navigate(`/doctor/create-appointment?patientId=${patientId}`)}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Tạo lịch hẹn mới
      </Button>
    );
  }

  // If used as a standalone page, show a complete UI
  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Tạo lịch hẹn mới</h1>
        </div>

        {loading.patient ? (
          <div className="bg-white p-8 rounded-xl shadow-sm flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : !patientInfo ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500">Không tìm thấy thông tin bệnh nhân hoặc chưa chọn bệnh nhân</p>
            <Button
              onClick={() => navigate('/doctor/patients')}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Chọn bệnh nhân
            </Button>
          </div>
        ) : !bookingComplete ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Progress Steps */}
            <div className="border-b border-gray-200">
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      1
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium">Chọn dịch vụ</span>
                    </div>
                  </div>
                  <div className={`flex-1 border-t-2 ${currentStep > 1 ? 'border-blue-600' : 'border-gray-200'} mx-4`} />
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      2
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium">Chọn lịch hẹn</span>
                    </div>
                  </div>
                  <div className={`flex-1 border-t-2 ${currentStep > 2 ? 'border-blue-600' : 'border-gray-200'} mx-4`} />
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      3
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-medium">Thông tin bổ sung</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Select Service */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto p-6"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin bệnh nhân</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Tên bệnh nhân</p>
                        <p className="text-lg font-medium">{patientInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID</p>
                        <p className="text-lg font-medium">{patientInfo.patientId}</p>
                      </div>
                      {patientInfo.phone && (
                        <div>
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          <p className="text-lg font-medium">{patientInfo.phone}</p>
                        </div>
                      )}
                      {patientInfo.email && (
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-lg font-medium">{patientInfo.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn dịch vụ</h2>
                  
                  {loading.services ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="ml-2 text-gray-600">Đang tải dữ liệu dịch vụ...</span>
                    </div>
                  ) : error.services ? (
                    <div className="text-center py-10">
                      <p className="text-red-600">{error.services}</p>
                      <Button 
                        type="button" 
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        Thử lại
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {services.map((service) => (
                        <label
                          key={service.serviceId}
                          className={`relative block p-6 border rounded-lg cursor-pointer ${
                            selectedServiceId === service.serviceId
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={service.serviceId}
                            {...register("serviceId", { required: true })}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              <p className="text-blue-600 font-medium mt-1">{formatPrice(service.price)}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedServiceId === service.serviceId
                                ? 'border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedServiceId === service.serviceId && (
                                <div className="w-3 h-3 rounded-full bg-blue-600" />
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {errors.serviceId && (
                    <p className="mt-2 text-sm text-red-600">Vui lòng chọn dịch vụ</p>
                  )}

                  <div className="mt-8 flex justify-end">
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!selectedServiceId || loading.services}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Date & Time */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn ngày và giờ</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn ngày</h3>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <CalendarDays size={20} />
                        </div>
                        <Controller
                          control={control}
                          name="appointmentDate"
                          rules={{ required: true }}
                          render={({ field }) => (
                            <ReactDatePicker
                              selected={field.value}
                              onChange={(date) => field.onChange(date)}
                              minDate={new Date()}
                              dateFormat="dd/MM/yyyy"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholderText="Chọn ngày"
                            />
                          )}
                        />
                      </div>
                      {errors.appointmentDate && (
                        <p className="mt-2 text-sm text-red-600">Vui lòng chọn ngày hẹn</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn giờ</h3>
                      {loading.slots ? (
                        <div className="flex items-center h-12 mt-2">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                          <span className="text-gray-600">Đang tải khung giờ...</span>
                        </div>
                      ) : selectedDate ? (
                        availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <div
                                key={slot.slotId}
                                onClick={() => handleSlotSelection(slot.slotId, `${slot.startTime} - ${slot.endTime}`)}
                                className={`p-2 text-center border rounded cursor-pointer ${
                                  selectedSlotId === slot.slotId
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-blue-50'
                                }`}
                              >
                                <div className="text-sm">{slot.slotName}</div>
                                <div>{slot.startTime} - {slot.endTime}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-red-600 mt-2">Không có khung giờ nào khả dụng cho ngày đã chọn</p>
                        )
                      ) : (
                        <p className="text-gray-500 mt-2">Vui lòng chọn ngày trước</p>
                      )}
                      
                      {/* Hidden field for slot ID */}
                      <input type="hidden" {...register("slotId", { required: true })} />
                      
                      {/* Hidden field for appointment time display */}
                      <input type="hidden" {...register("appointmentTime", { required: true })} />
                      
                      {errors.slotId && (
                        <p className="mt-2 text-sm text-red-600">Vui lòng chọn giờ hẹn</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="border-blue-600 text-blue-600"
                    >
                      Quay lại
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!selectedDate || !selectedSlotId || loading.slots}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin bổ sung</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả lịch hẹn
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-500">
                          <FileText size={20} />
                        </div>
                        <textarea
                          id="description"
                          rows={3}
                          {...register("description", { required: true })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Mô tả chi tiết về lịch hẹn..."
                        />
                      </div>
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">Vui lòng nhập mô tả lịch hẹn</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú (nếu có)
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-500">
                          <FileText size={20} />
                        </div>
                        <textarea
                          id="note"
                          rows={3}
                          {...register("note")}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ghi chú thêm cho lịch hẹn..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin đặt lịch</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Dịch vụ</p>
                        <p className="font-medium">{selectedService?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bệnh nhân</p>
                        <p className="font-medium">{patientInfo?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày hẹn</p>
                        <p className="font-medium">
                          {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Giờ hẹn</p>
                        <p className="font-medium">{watch("appointmentTime")}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Giá dịch vụ</p>
                        <p className="font-medium text-blue-600">{selectedService ? formatPrice(selectedService.price) : ''}</p>
                      </div>
                    </div>
                  </div>

                  {error.booking && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                      {error.booking}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="border-blue-600 text-blue-600"
                    >
                      Quay lại
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading.booking}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading.booking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Xác nhận đặt lịch'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đặt lịch thành công!</h2>
            <p className="text-lg text-gray-600 mb-2">
              Lịch hẹn đã được tạo thành công cho bệnh nhân {patientInfo?.name}.
            </p>
            {bookingId && (
              <p className="text-gray-600 mb-6">
                Mã đặt lịch: <span className="font-bold text-blue-600">{bookingId}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600"
                onClick={() => navigate(`/doctor/patients?patientId=${effectivePatientId}`)}
              >
                Quay lại hồ sơ bệnh nhân
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/doctor/appointments')}
              >
                Xem danh sách lịch hẹn
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreateAppointmentForPatient;
