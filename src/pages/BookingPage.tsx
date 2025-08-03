import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays,  User, Phone, Mail, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { bookingApiForBookingPage} from "../api/patientApi/bookingApiForBookingPage";
import type { Service, Doctor, Slot, BookingRequest } from "../api/patientApi/bookingApiForBookingPage";
import { useRef } from "react";


type FormData = {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  doctorId: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  message: string;
  slotId: string;
};



const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  // const [slots, setSlots] = useState<Slot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState({
    services: true,
    doctors: true,
    slots: false,
    booking: false
  });
  const [error, setError] = useState({
    services: "",
    doctors: "",
    slots: "",
    booking: ""
  });
  
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // hoặc "userInfo" nếu bạn lưu userInfo
    if (!token) {
      alert("Bạn cần đăng nhập hoặc đăng ký để đặt lịch.");
      navigate("/login"); // hoặc "/register" nếu muốn chuyển đến đăng ký
    }
  }, [navigate]);
  // Get services data
  useEffect(() => {
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

    fetchServices();
  }, []);

  // Get doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await bookingApiForBookingPage.getAllDoctors();
        setDoctors(data);
        setLoading(prev => ({ ...prev, doctors: false }));
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(prev => ({ ...prev, doctors: "Không thể tải dữ liệu bác sĩ. Vui lòng thử lại sau." }));
        setLoading(prev => ({ ...prev, doctors: false }));
      }
    };

    fetchDoctors();
  }, []);

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
      doctorId: "",
      appointmentDate: null,
      appointmentTime: "",
      slotId: ""
    }
  });

  const selectedServiceId = watch("serviceId");
  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("appointmentDate");
  const selectedSlotId = watch("slotId");

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      const fetchAvailableSlots = async () => {
        setLoading(prev => ({ ...prev, slots: true }));
        try {
          // Format date as YYYY-MM-DD
          const formattedDate = selectedDate.toISOString().split('T')[0];
          const data = await bookingApiForBookingPage.getAvailableSlots(selectedDoctorId, formattedDate);
          setAvailableSlots(data);
          setLoading(prev => ({ ...prev, slots: false }));
        } catch (err) {
          console.error("Error fetching available slots:", err);
          setError(prev => ({ ...prev, slots: "Không thể tải dữ liệu khung giờ. Vui lòng thử lại sau." }));
          setLoading(prev => ({ ...prev, slots: false }));
        }
      };

      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctorId, selectedDate]);

  // Handle slot selection
  const handleSlotSelection = (slotId: string, time: string) => {
    setValue("slotId", slotId);
    setValue("appointmentTime", time);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(prev => ({ ...prev, booking: true }));
    try {
      // Get user ID from localStorage (assuming it's stored there after login)
      const patientId = localStorage.getItem("userInfo") || "";
      
      if (!patientId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }

const dateString = data.appointmentDate
  ? new Date(Date.UTC(
      data.appointmentDate.getFullYear(),
      data.appointmentDate.getMonth(),
      data.appointmentDate.getDate()
    )).toISOString()
  : new Date().toISOString();

      const bookingData: BookingRequest = {
        patientId: patientId,
        serviceId: data.serviceId,
        paymentId: "pending", // Default value or can be handled differently based on your system
        doctorId: data.doctorId,
        slotId: data.slotId,
        dateBooking: dateString,
        description: data.message || "Không có mô tả",
        note: `Đặt lịch bởi ${data.fullName}, SĐT: ${data.phone}, Email: ${data.email}`
      };

      const response = await bookingApiForBookingPage.createBooking(bookingData);
      setBookingId(response.bookingId);
      setBookingComplete(true);
      setLoading(prev => ({ ...prev, booking: false }));
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(prev => ({ ...prev, booking: "Lịch hẹn đã được đặt trước." }));
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const selectedService = services.find(service => service.serviceId === selectedServiceId);
  const selectedDoctor = doctors.find(doctor => doctor.doctorId === selectedDoctorId);
  // const selectedSlot = availableSlots.find(slot => slot.slotId === selectedSlotId);
  const userInfoSet = useRef(false);

  useEffect(() => {
    if (currentStep === 3 && !userInfoSet.current) {
      const userInfoRaw = localStorage.getItem("userInfo");
      if (userInfoRaw) {
        try {
          const userInfo = JSON.parse(userInfoRaw);
          if (userInfo.fullName) setValue("fullName", userInfo.fullName);
          if (userInfo.email) setValue("email", userInfo.email);
          if (userInfo.phone) setValue("phone", userInfo.phone);
        } catch {
          // Nếu lỗi parse thì bỏ qua
        }
      }
      userInfoSet.current = true;
    }
    // Reset flag nếu quay lại step trước
    if (currentStep !== 3) userInfoSet.current = false;
  }, [currentStep, setValue]);
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đặt lịch tư vấn & điều trị</h1>
        <p className="mt-3 text-lg text-gray-600">
          Đặt lịch hẹn để nhận được tư vấn từ các chuyên gia của chúng tôi
        </p>
      </div>

      {!bookingComplete ? (
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
                    <span className="text-sm font-medium">Chọn bác sĩ & lịch hẹn</span>
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
                    <span className="text-sm font-medium">Thông tin cá nhân</span>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn dịch vụ bạn quan tâm</h2>
                
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

            {/* Step 2: Select Doctor & Date */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Chọn bác sĩ và lịch hẹn</h2>
                
                {loading.doctors ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Đang tải dữ liệu bác sĩ...</span>
                  </div>
                ) : error.doctors ? (
                  <div className="text-center py-10">
                    <p className="text-red-600">{error.doctors}</p>
                    <Button 
                      type="button" 
                      onClick={() => window.location.reload()}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Thử lại
                    </Button>
                  </div>
                ) : (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn bác sĩ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctors.map((doctor) => (
                        <label
                          key={doctor.doctorId}
                          className={`relative block p-4 border rounded-lg cursor-pointer ${
                            selectedDoctorId === doctor.doctorId
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={doctor.doctorId}
                            {...register("doctorId", { required: true })}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-base font-medium text-gray-900">{doctor.doctorName}</h4>
                              <p className="text-sm text-gray-500">{doctor.specialization}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedDoctorId === doctor.doctorId
                                ? 'border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedDoctorId === doctor.doctorId && (
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.doctorId && (
                      <p className="mt-2 text-sm text-red-600">Vui lòng chọn bác sĩ</p>
                    )}
                  </div>
                )}

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
                            disabled={!selectedDoctorId || loading.doctors}
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
                    ) : selectedDoctorId && selectedDate ? (
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
                              {slot.startTime} - {slot.endTime}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-red-600 mt-2">Không có khung giờ nào khả dụng cho ngày đã chọn</p>
                      )
                    ) : (
                      <p className="text-gray-500 mt-2">Vui lòng chọn bác sĩ và ngày trước</p>
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
                    disabled={!selectedDoctorId || !selectedDate || !selectedSlotId || loading.slots}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Tiếp tục
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Personal Information */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin của bạn</h2>
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <User size={20} />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      {...register("fullName", { required: true })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nguyễn Văn A"
                      readOnly 
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">Vui lòng nhập họ tên</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Phone size={20} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      {...register("phone", { 
                        required: true,
                        pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
                      })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0912345678"
                      readOnly // thêm dòng này nếu muốn không cho sửa
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">Vui lòng nhập số điện thoại hợp lệ</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Mail size={20} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      {...register("email", { 
                        required: true,
                        pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                      })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="youremail@example.com"
                      readOnly // thêm dòng này nếu muốn không cho sửa
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">Vui lòng nhập email hợp lệ</p>
                  )}
                </div>
                  <div className="md:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú (không bắt buộc)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-4 text-gray-500">
                        <FileText size={20} />
                      </div>
                      <textarea
                        id="message"
                        rows={4}
                        {...register("message")}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Vui lòng cho biết thông tin bổ sung nếu cần thiết..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin đặt lịch</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Dịch vụ</p>
                      <p className="font-medium">{selectedService?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bác sĩ</p>
                      <p className="font-medium">{selectedDoctor?.doctorName}</p>
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
            Cảm ơn bạn đã đặt lịch tại FertilityCare.
          </p>
          <p className="text-gray-600 mb-6">
            Mã đặt lịch của bạn: <span className="font-bold text-blue-600">{bookingId}</span>
          </p>
          <p className="text-gray-600 mb-8">
            Chúng tôi sẽ liên hệ với bạn qua email hoặc số điện thoại để xác nhận lịch hẹn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" className="border-blue-600 text-blue-600">
                Về trang chủ
              </Button>
            </Link>
            <Link to="/patient/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Xem lịch hẹn của tôi
              </Button>
            </Link>
          </div>        
          </motion.div>
      )}   </div>
  );
};

export default BookingPage;
