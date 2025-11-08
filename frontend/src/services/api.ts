// API Service for backend communication
// Update the BASE_URL with your actual backend endpoint

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Theme preference APIs
export const themeAPI = {
  // Get user's theme preference from backend
  getThemePreference: async (): Promise<ApiResponse<{ theme: 'light' | 'dark' | 'system' }>> => {
    return fetchAPI('/user/theme-preference', {
      method: 'GET',
    });
  },

  // Save user's theme preference to backend
  saveThemePreference: async (theme: 'light' | 'dark' | 'system'): Promise<ApiResponse<void>> => {
    return fetchAPI('/user/theme-preference', {
      method: 'POST',
      body: JSON.stringify({ theme }),
    });
  },

  // Get system-wide theme setting (admin only)
  getSystemTheme: async (): Promise<ApiResponse<{ theme: 'light' | 'dark' | 'system' }>> => {
    return fetchAPI('/admin/system-theme', {
      method: 'GET',
    });
  },

  // Set system-wide theme (admin only)
  setSystemTheme: async (theme: 'light' | 'dark' | 'system'): Promise<ApiResponse<void>> => {
    return fetchAPI('/admin/system-theme', {
      method: 'POST',
      body: JSON.stringify({ theme }),
    });
  },
};

// Authentication APIs
export const authAPI = {
  login: async (credentials: {
    username: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return fetchAPI('/auth/logout', {
      method: 'POST',
    });
  },

  validateToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    return fetchAPI('/auth/validate', {
      method: 'GET',
    });
  },
};

// Case Management APIs
export const caseAPI = {
  getAllCases: async (): Promise<ApiResponse<any[]>> => {
    return fetchAPI('/cases', {
      method: 'GET',
    });
  },

  getCaseById: async (id: string): Promise<ApiResponse<any>> => {
    return fetchAPI(`/cases/${id}`, {
      method: 'GET',
    });
  },

  createCase: async (caseData: any): Promise<ApiResponse<any>> => {
    return fetchAPI('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  updateCase: async (id: string, caseData: any): Promise<ApiResponse<any>> => {
    return fetchAPI(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    });
  },
};

// Attendance APIs
export const attendanceAPI = {
  getTodayAttendance: async (): Promise<ApiResponse<any[]>> => {
    return fetchAPI('/attendance/today', {
      method: 'GET',
    });
  },

  markAttendance: async (data: {
    caseId: string;
    officerId: string;
    status: 'present' | 'absent' | 'late';
    timestamp: string;
  }): Promise<ApiResponse<any>> => {
    return fetchAPI('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAttendanceReport: async (params: {
    startDate: string;
    endDate: string;
    officerId?: string;
  }): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams(params as any).toString();
    return fetchAPI(`/attendance/report?${queryParams}`, {
      method: 'GET',
    });
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<any>> => {
    return fetchAPI('/dashboard/stats', {
      method: 'GET',
    });
  },

  getRecentCases: async (limit: number = 10): Promise<ApiResponse<any[]>> => {
    return fetchAPI(`/dashboard/recent-cases?limit=${limit}`, {
      method: 'GET',
    });
  },
};

export default {
  themeAPI,
  authAPI,
  caseAPI,
  attendanceAPI,
  dashboardAPI,
};
