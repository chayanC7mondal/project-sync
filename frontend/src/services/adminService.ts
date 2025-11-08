// Admin Service - Centralized API calls for admin operations
import apiClient from "@/utils/apiClient";
import {
  ADMIN_USERS_LIST,
  ADMIN_USER_CREATE,
  ADMIN_USER_DETAIL,
  ADMIN_USER_UPDATE,
  ADMIN_USER_DELETE,
  ADMIN_REPORTS,
  ADMIN_AUDIT_LOGS,
  ADMIN_SYSTEM_STATS,
  ADMIN_SETTINGS_LIST,
  ADMIN_SETTINGS_UPDATE,
  ADMIN_SYSTEM_THEME_GET,
  ADMIN_SYSTEM_THEME_SET,
} from "@/utils/constants";

// =====================
// User Management APIs
// =====================

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "investigating_officer" | "liaison_officer" | "witness";
  fullName?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: string;
  fullName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  fullName?: string;
  phone?: string;
  isActive?: boolean;
}

export const adminUserService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(ADMIN_USERS_LIST);
    return response.data.success ? response.data.data : [];
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User | null> => {
    const response = await apiClient.get(ADMIN_USER_DETAIL(userId));
    return response.data.success ? response.data.data : null;
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<User | null> => {
    const response = await apiClient.post(ADMIN_USER_CREATE, userData);
    return response.data.success ? response.data.data : null;
  },

  // Update user
  updateUser: async (userId: string, userData: UpdateUserData): Promise<User | null> => {
    const response = await apiClient.put(ADMIN_USER_UPDATE(userId), userData);
    return response.data.success ? response.data.data : null;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<boolean> => {
    const response = await apiClient.delete(ADMIN_USER_DELETE(userId));
    return response.data.success;
  },

  // Toggle user active status
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<User | null> => {
    const response = await apiClient.put(ADMIN_USER_UPDATE(userId), { isActive });
    return response.data.success ? response.data.data : null;
  },
};

// =====================
// Reports APIs
// =====================

export interface AttendanceReport {
  totalHearings: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

export interface CaseReport {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingCases: number;
  casesByType: Record<string, number>;
}

export interface OfficerPerformance {
  officerId: string;
  officerName: string;
  casesHandled: number;
  hearingsAttended: number;
  attendanceRate: number;
}

export interface WitnessCompliance {
  totalWitnesses: number;
  compliantWitnesses: number;
  nonCompliantWitnesses: number;
  averageAttendanceRate: number;
}

export interface ReportData {
  attendance: AttendanceReport;
  cases: CaseReport;
  officers: OfficerPerformance[];
  witnesses: WitnessCompliance;
}

export const adminReportService = {
  // Get comprehensive reports
  getReports: async (dateRange: string, type: string = "all"): Promise<ReportData | null> => {
    const response = await apiClient.get(ADMIN_REPORTS, {
      params: { dateRange, type },
    });
    return response.data.success ? response.data.data : null;
  },

  // Get attendance report only
  getAttendanceReport: async (dateRange: string): Promise<AttendanceReport | null> => {
    const response = await apiClient.get(ADMIN_REPORTS, {
      params: { dateRange, type: "attendance" },
    });
    return response.data.success ? response.data.data.attendance : null;
  },

  // Get case report only
  getCaseReport: async (dateRange: string): Promise<CaseReport | null> => {
    const response = await apiClient.get(ADMIN_REPORTS, {
      params: { dateRange, type: "cases" },
    });
    return response.data.success ? response.data.data.cases : null;
  },

  // Get officer performance
  getOfficerPerformance: async (dateRange: string): Promise<OfficerPerformance[]> => {
    const response = await apiClient.get(ADMIN_REPORTS, {
      params: { dateRange, type: "officers" },
    });
    return response.data.success ? response.data.data.officers : [];
  },

  // Get witness compliance
  getWitnessCompliance: async (dateRange: string): Promise<WitnessCompliance | null> => {
    const response = await apiClient.get(ADMIN_REPORTS, {
      params: { dateRange, type: "witnesses" },
    });
    return response.data.success ? response.data.data.witnesses : null;
  },
};

// =====================
// Audit Logs APIs
// =====================

export interface AuditLog {
  _id: string;
  action: string;
  actionType: "create" | "update" | "delete" | "login" | "logout" | "view" | "export";
  module: string;
  userId: string;
  username: string;
  userRole: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}

export interface AuditLogFilters {
  actionType?: string;
  module?: string;
  status?: string;
  days?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const adminAuditService = {
  // Get audit logs with filters
  getAuditLogs: async (filters: AuditLogFilters = {}): Promise<AuditLog[]> => {
    const response = await apiClient.get(ADMIN_AUDIT_LOGS, {
      params: filters,
    });
    return response.data.success ? response.data.data : [];
  },

  // Get audit log by ID
  getAuditLogById: async (logId: string): Promise<AuditLog | null> => {
    const response = await apiClient.get(`${ADMIN_AUDIT_LOGS}/${logId}`);
    return response.data.success ? response.data.data : null;
  },

  // Get logs for specific user
  getUserAuditLogs: async (userId: string, days: string = "30"): Promise<AuditLog[]> => {
    const response = await apiClient.get(ADMIN_AUDIT_LOGS, {
      params: { userId, days },
    });
    return response.data.success ? response.data.data : [];
  },

  // Get logs for specific module
  getModuleAuditLogs: async (module: string, days: string = "30"): Promise<AuditLog[]> => {
    const response = await apiClient.get(ADMIN_AUDIT_LOGS, {
      params: { module, days },
    });
    return response.data.success ? response.data.data : [];
  },
};

// =====================
// System Settings APIs
// =====================

export interface SystemSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    absenceNotifications: boolean;
    hearingReminders: boolean;
    reminderHours: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
    twoFactorEnabled: boolean;
  };
  qrCode: {
    expiryMinutes: number;
    refreshInterval: number;
    enableLocationValidation: boolean;
  };
  general: {
    systemName: string;
    organizationName: string;
    contactEmail: string;
    supportPhone: string;
    timezone: string;
  };
}

export const adminSettingsService = {
  // Get all system settings
  getAllSettings: async (): Promise<SystemSettings | null> => {
    const response = await apiClient.get(ADMIN_SETTINGS_LIST);
    return response.data.success ? response.data.data : null;
  },

  // Update system settings
  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings | null> => {
    const response = await apiClient.put(ADMIN_SETTINGS_UPDATE, settings);
    return response.data.success ? response.data.data : null;
  },

  // Get system theme
  getSystemTheme: async (): Promise<"light" | "dark" | "system"> => {
    const response = await apiClient.get(ADMIN_SYSTEM_THEME_GET);
    return response.data.success ? response.data.data.theme : "system";
  },

  // Set system theme
  setSystemTheme: async (theme: "light" | "dark" | "system"): Promise<boolean> => {
    const response = await apiClient.post(ADMIN_SYSTEM_THEME_SET, { theme });
    return response.data.success;
  },
};

// =====================
// System Statistics APIs
// =====================

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCases: number;
  activeCases: number;
  totalWitnesses: number;
  totalHearings: number;
  todayHearings: number;
  overallAttendanceRate: number;
  systemUptime: number;
  lastBackupTime: string;
  storageUsed: number;
  storageTotal: number;
}

export const adminStatsService = {
  // Get comprehensive system statistics
  getSystemStats: async (): Promise<SystemStats | null> => {
    const response = await apiClient.get(ADMIN_SYSTEM_STATS);
    return response.data.success ? response.data.data : null;
  },
};

// =====================
// Export all services
// =====================

export default {
  user: adminUserService,
  report: adminReportService,
  audit: adminAuditService,
  settings: adminSettingsService,
  stats: adminStatsService,
};
