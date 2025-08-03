//src/api/treatmentPlanAPI.ts
import axios from 'axios';
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Tạo instance axios với cấu hình xác thực
const treatmentAxios = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để thêm token vào mỗi request
treatmentAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interfaces for TreatmentPlan
export interface Doctor {
  doctorId: string;
  userId: string;
  doctorName: string;
  specialization: string;
  phone: string;
  email: string;
}

export interface Patient {
  patientId: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
}

export interface PatientDetail {
  patientDetailId: string;
  patientId: string;
  treatmentStatus: string;
  patient: Patient;
}

export interface TreatmentProcess {
  treatmentProcessId: string;
  method: string;
  scheduledDate: string;
  actualDate: string;
  status: string;
  result: string;
}

export interface TreatmentPlan {
  treatmentPlanId: string;
  doctorId: string;
  serviceId: string;
  method: string;
  patientDetailId: string;
  startDate: string;
  endDate: string;
  status: string;
  doctor: Doctor;
  patientDetail: PatientDetail;
  treatmentDescription: string;
  giaidoan?: string; // in-progress , completed, cancelled
  ghiChu?: string;
  treatmentProcesses: TreatmentProcess[];

}

// Interface for Medication
export interface Medication {
  medicationId: string;
  treatmentPlanId: string;
  drugType: string;
  drugName: string;
  description: string;
}

// Interface for Booking related to Treatment Plan
export interface TreatmentPlanBooking {
  bookingId: string;
  patientId: string;
  serviceId: string;
  paymentId: string | null;
  doctorId: string;
  slotId: string;
  dateBooking: string;
  description: string;
  createAt: string;
  status: string;
  note: string;
  slotName: string;
}

// Interface for Examination
export interface Examination {
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

// Interface for Treatment Step
export interface TreatmentStep {
  treatmentStepId: string;
  treatmentPlanId: string;
  stepOrder: number;
  stepName: string;
  description: string;
  treatmentPlan: any | null;
}

// TreatmentPlan API
const treatmentPlanAPI = {
  // Get treatment plan by ID
  getTreatmentPlanById: async (id: string): Promise<TreatmentPlan> => {
    try {
      const response = await treatmentAxios.get(`/api/TreatmentPlan/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching treatment plan with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get patient detail by patient ID
  getPatientDetailByPatientId: async (patientId: string): Promise<PatientDetail> => {
    try {
      console.log(`Fetching patient detail for patientId: ${patientId}`);
      const response = await treatmentAxios.get(`/api/PatientDetail/Patient/${patientId}`);
      console.log("Patient detail response:", response.data);
      
      // API returns an array of patient details, take the first one
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }
      
      // If response is not an array but a single object
      if (response.data && response.data.patientDetailId) {
        return response.data;
      }
      
      throw new Error("No patient detail found for this patient ID");
    } catch (error) {
      console.error(`Error fetching patient detail for patient ${patientId}:`, error);
      throw error;
    }
  },
    // Get all treatment plans for a patient across all patient details
  getAllTreatmentPlansByPatient: async (patientId: string): Promise<TreatmentPlan[]> => {
    try {
      console.log(`Fetching all treatment plans for patientId: ${patientId}`);
      // Sử dụng đúng endpoint như trong backend: api/PatientDetail/Patient/{patientId}/TreatmentPlans
      const response = await treatmentAxios.get(`/api/PatientDetail/Patient/${patientId}/TreatmentPlans`);
      console.log("All treatment plans response:", response.data);
      
      // Xử lý kết quả trả về
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data) {
        return [response.data];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching all treatment plans for patient ${patientId}:`, error);
      // Trả về một mảng rỗng thay vì throw error để tránh crash UI
      return [];
    }
  },
  
  // Get patientId from userId
  getPatientIdFromUserId: async (userId: string): Promise<string> => {
    try {
      console.log(`Fetching patientId for userId: ${userId}`);
      const response = await treatmentAxios.get(`/api/PatientDetail/User/${userId}/PatientId`);
      console.log("Patient ID response:", response.data);
      
      // API trả về string là patientId
      if (response.data) {
        return response.data;
      }
      
      throw new Error(`No patient ID found for user ${userId}`);
    } catch (error) {
      console.error(`Error fetching patientId for user ${userId}:`, error);
      throw error;
    }
  },

  // Get medications by treatment plan ID
  getMedicationsByTreatmentPlanId: async (treatmentPlanId: string): Promise<Medication[]> => {
    try {
      console.log(`Fetching medications for treatment plan: ${treatmentPlanId}`);
      const response = await treatmentAxios.get(`/api/TreatmentPlan/${treatmentPlanId}/medications`);
      console.log("Medications response:", response.data);
      
      // Handle array response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data) {
        return [response.data];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching medications for treatment plan ${treatmentPlanId}:`, error);
      return [];
    }
  },

  // Get bookings by treatment plan ID
  getBookingsByTreatmentPlanId: async (treatmentPlanId: string): Promise<TreatmentPlanBooking[]> => {
    try {
      console.log(`Fetching bookings for treatment plan: ${treatmentPlanId}`);
      const response = await treatmentAxios.get(`/api/TreatmentPlan/${treatmentPlanId}/bookings`);
      console.log("Bookings response:", response.data);
      
      // Handle array response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data) {
        return [response.data];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching bookings for treatment plan ${treatmentPlanId}:`, error);
      return [];
    }
  },

  // Get examinations for a specific booking
  getExaminationsByBooking: async (bookingId: string, patientId: string, doctorId: string): Promise<Examination[]> => {
    try {
      console.log(`Fetching examinations for booking: ${bookingId}`);
      const response = await treatmentAxios.get(
        `/api/TreatmentPlan/examinations?bookingId=${bookingId}&patientId=${patientId}&doctorId=${doctorId}`
      );
      console.log("Examinations response:", response.data);
      
      // Handle array response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data) {
        return [response.data];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching examinations for booking ${bookingId}:`, error);
      return [];
    }
  },

  // Get treatment steps by treatment plan ID
  getTreatmentStepsByTreatmentPlanId: async (treatmentPlanId: string): Promise<TreatmentStep[]> => {
    try {
      console.log(`Fetching treatment steps for treatment plan: ${treatmentPlanId}`);
      const response = await treatmentAxios.get(`/api/TreatmentPlan/${treatmentPlanId}/steps`);
      console.log("Treatment steps response:", response.data);
      
      // Handle array response
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data) {
        return [response.data];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching treatment steps for treatment plan ${treatmentPlanId}:`, error);
      return [];
    }
  }
};

export default treatmentPlanAPI;