// API host base
export const HOST = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Base API prefix
export const API_PREFIX = "/api";

// Auth
export const AUTH_ROUTES = `${API_PREFIX}/auth`;
export const AUTH_LOGIN = `${AUTH_ROUTES}/login`;
export const AUTH_LOGOUT = `${AUTH_ROUTES}/logout`;
export const AUTH_VALIDATE = `${AUTH_ROUTES}/validate`;

// Admin (system theme etc.)
export const ADMIN_ROUTES = `${API_PREFIX}/admin`;
export const ADMIN_SYSTEM_THEME_GET = `${ADMIN_ROUTES}/system-theme`;
export const ADMIN_SYSTEM_THEME_SET = `${ADMIN_ROUTES}/system-theme`; // POST same endpoint

// User (preferences)
export const USER_ROUTES = `${API_PREFIX}/user`;
export const USER_THEME_PREFERENCE_GET = `${USER_ROUTES}/theme-preference`;
export const USER_THEME_PREFERENCE_SET = `${USER_ROUTES}/theme-preference`; // POST same

// Cases
export const CASE_ROUTES = `${API_PREFIX}/cases`;
export const CASE_LIST = CASE_ROUTES; // GET
export const CASE_CREATE = CASE_ROUTES; // POST
export const CASE_DETAIL = (id) => `${CASE_ROUTES}/${id}`; // GET
export const CASE_UPDATE = (id) => `${CASE_ROUTES}/${id}`; // PUT

// Attendance
export const ATTENDANCE_ROUTES = `${API_PREFIX}/attendance`;
export const ATTENDANCE_TODAY = `${ATTENDANCE_ROUTES}/today`;
export const ATTENDANCE_MARK = ATTENDANCE_ROUTES; // POST
export const ATTENDANCE_REPORT = `${ATTENDANCE_ROUTES}/report`; // GET with query params

// Dashboard
export const DASHBOARD_ROUTES = `${API_PREFIX}/dashboard`;
export const DASHBOARD_STATS = `${DASHBOARD_ROUTES}/stats`;
export const DASHBOARD_RECENT_CASES = `${DASHBOARD_ROUTES}/recent-cases`; // ?limit=

// Notifications
export const NOTIFICATION_ROUTES = `${API_PREFIX}/notifications`;
export const NOTIFICATIONS_LIST = NOTIFICATION_ROUTES; // GET
export const NOTIFICATION_CREATE = NOTIFICATION_ROUTES; // POST
export const NOTIFICATION_MARK_READ = (id) => `${NOTIFICATION_ROUTES}/${id}/read`; // PATCH

// Settings
export const SETTINGS_ROUTES = `${API_PREFIX}/settings`;
export const SETTINGS_GET = (key) => `${SETTINGS_ROUTES}/${key}`; // GET
export const SETTINGS_UPDATE = (key) => `${SETTINGS_ROUTES}/${key}`; // PUT

// Liaison Officer
export const LIAISON_ROUTES = `${API_PREFIX}/liaison`;
export const LIAISON_DASHBOARD = `${LIAISON_ROUTES}/dashboard`;
export const LIAISON_HEARINGS_TODAY = `${LIAISON_ROUTES}/hearings/today`;
export const LIAISON_HEARINGS_UPCOMING = `${LIAISON_ROUTES}/hearings/upcoming`;
export const LIAISON_ATTENDANCE_STATS = `${LIAISON_ROUTES}/attendance/stats`;

// Hearing Sessions
export const HEARING_ROUTES = `${API_PREFIX}/hearings`;
export const HEARING_LIST = HEARING_ROUTES; // GET
export const HEARING_CREATE = HEARING_ROUTES; // POST
export const HEARING_DETAIL = (id) => `${HEARING_ROUTES}/${id}`; // GET
export const HEARING_UPDATE = (id) => `${HEARING_ROUTES}/${id}`; // PUT
export const HEARING_QR_CODE = (id) => `${HEARING_ROUTES}/${id}/qr-code`; // GET
export const HEARING_MARK_ATTENDANCE = (id) => `${HEARING_ROUTES}/${id}/mark-attendance`; // POST
export const HEARING_ATTENDANCE_LIST = (id) => `${HEARING_ROUTES}/${id}/attendance`; // GET

// Absence Reasons
export const ABSENCE_ROUTES = `${API_PREFIX}/absence`;
export const ABSENCE_SUBMIT = ABSENCE_ROUTES; // POST
export const ABSENCE_LIST = ABSENCE_ROUTES; // GET
export const ABSENCE_PENDING = `${ABSENCE_ROUTES}/pending`; // GET

// Witnesses
export const WITNESS_ROUTES = `${API_PREFIX}/witnesses`;
export const WITNESS_LIST = WITNESS_ROUTES; // GET
export const WITNESS_CREATE = WITNESS_ROUTES; // POST
export const WITNESS_DETAIL = (id) => `${WITNESS_ROUTES}/${id}`; // GET
export const WITNESS_UPDATE = (id) => `${WITNESS_ROUTES}/${id}`; // PUT

// Helper to build full URL
export const apiUrl = (path) => `${HOST}${path}`;

