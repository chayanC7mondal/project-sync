import apiClient from "@/utils/apiClient";
import {
  LIAISON_DASHBOARD,
  LIAISON_HEARINGS_TODAY,
  LIAISON_HEARINGS_UPCOMING,
  LIAISON_ATTENDANCE_STATS,
  HEARING_ROUTES,
  HEARING_DETAIL,
  HEARING_QR_CODE,
  HEARING_MARK_ATTENDANCE,
  HEARING_ATTENDANCE_LIST,
  ABSENCE_ROUTES,
  ABSENCE_PENDING,
} from "@/utils/constants";

export interface HearingSession {
  id: number;
  case_id: number;
  hearing_date: string;
  hearing_time: string;
  case_number: string;
  case_title: string;
  location: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  qr_code_data?: string;
  attendance_marked?: boolean;
  total_expected?: number;
  total_present?: number;
}

export interface AttendanceRecord {
  id: number;
  hearing_session_id: number;
  user_id: number;
  user_name: string;
  user_role: "inspector" | "witness";
  status: "present" | "absent" | "late";
  marked_at: string;
  marked_by?: string;
}

export interface AbsenceReason {
  id: number;
  hearing_session_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  reason: string;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
}

export interface DashboardStats {
  hearings_today: number;
  hearings_upcoming: number;
  attendance_rate_today: number;
  pending_absences: number;
  cases_assigned: number;
}

// Get liaison officer dashboard stats
export const getLiaisonDashboard = async () => {
  const response = await apiClient.get(LIAISON_DASHBOARD);
  return response.data;
};

// Get today's hearings
export const getTodayHearings = async () => {
  const response = await apiClient.get(LIAISON_HEARINGS_TODAY);
  return response.data;
};

// Get upcoming hearings
export const getUpcomingHearings = async (days: number = 7) => {
  const response = await apiClient.get(LIAISON_HEARINGS_UPCOMING, {
    params: { days },
  });
  return response.data;
};

// Get attendance statistics
export const getAttendanceStats = async (startDate?: string, endDate?: string) => {
  const response = await apiClient.get(LIAISON_ATTENDANCE_STATS, {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

// Create new hearing session
export const createHearing = async (hearingData: {
  case_id: number;
  hearing_date: string;
  hearing_time: string;
  location: string;
  inspector_id?: number;
  witness_ids?: number[];
}) => {
  const response = await apiClient.post(HEARING_ROUTES, hearingData);
  return response.data;
};

// Get hearing details
export const getHearingDetails = async (hearingId: number) => {
  const response = await apiClient.get(HEARING_DETAIL(hearingId));
  return response.data;
};

// Get QR code for hearing
export const getHearingQRCode = async (hearingId: number) => {
  const response = await apiClient.get(HEARING_QR_CODE(hearingId));
  return response.data;
};

// Mark attendance manually
export const markAttendance = async (
  hearingId: number,
  attendanceData: {
    user_id: number;
    user_role: "inspector" | "witness";
    status: "present" | "absent" | "late";
  }
) => {
  const response = await apiClient.post(
    HEARING_MARK_ATTENDANCE(hearingId),
    attendanceData
  );
  return response.data;
};

// Get attendance list for a hearing
export const getHearingAttendance = async (hearingId: number) => {
  const response = await apiClient.get(HEARING_ATTENDANCE_LIST(hearingId));
  return response.data;
};

// Get pending absence reasons
export const getPendingAbsences = async () => {
  const response = await apiClient.get(ABSENCE_PENDING);
  return response.data;
};

// Get all absence reasons with filters
export const getAbsenceReasons = async (filters?: {
  hearing_id?: number;
  user_role?: string;
  status?: string;
}) => {
  const response = await apiClient.get(ABSENCE_ROUTES, {
    params: filters,
  });
  return response.data;
};
