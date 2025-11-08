import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Settings from "../models/settingsModel.js";
import Case from "../models/caseModel.js";
import Attendance from "../models/attendanceModel.js";
import Auth from "../models/authModel.js";
import { generateMonthlyReportPDF, generateConsolidatedReportPDF } from "../utils/pdfGenerator.js";

// GET /api/admin/system-theme
export const getSystemTheme = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: "system_theme" });
    const theme = setting?.value?.theme || "system";
  return res.status(200).json(new ApiResponse(200, { theme }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch system theme"));
  }
};

// POST /api/admin/system-theme
export const setSystemTheme = async (req, res, next) => {
  try {
    const { theme } = req.body || {};
    if (!theme || !["light", "dark", "system"].includes(theme)) {
      return next(new ApiError(400, "Invalid theme value"));
    }
    const updated = await Settings.findOneAndUpdate(
      { key: "system_theme" },
      { value: { theme }, updatedBy: req.userId },
      { upsert: true, new: true }
    );
  return res.status(200).json(new ApiResponse(200, { theme: updated.value.theme }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to set system theme"));
  }
};

/**
 * Generate Monthly Attendance Report PDF
 * POST /api/admin/generate-report
 * Uses hardcoded dummy data from summary_monthly.ipynb
 */
export const generateReport = async (req, res, next) => {
  try {
    const { officerId, month, year, reportType } = req.body;

    if (!month || !year) {
      return next(new ApiError(400, "Month and year are required"));
    }

    // Hardcoded dummy data from summary_monthly.ipynb (generated for 20 officers)
    const dummyReportData = [
      {
        officer: { id: "IO001", name: "SI Rajesh Kumar", rank: "Sub-Inspector", station: "Bhubaneswar PS" },
        month: "January 2025",
        cases: [
          { caseId: "CR/007/2025", firNumber: "FIR007", type: "Fraud", status: "ongoing" },
          { caseId: "CR/006/2025", firNumber: "FIR006", type: "Theft", status: "adjourned" },
          { caseId: "CR/004/2025", firNumber: "FIR004", type: "Robbery", status: "disposed" },
          { caseId: "CR/008/2025", firNumber: "FIR008", type: "Murder", status: "ongoing" }
        ],
        attendance: { total_hearings: 17, present: 11, absent: 6, late: 0, attendance_rate: 64.71 },
        timeline: [
          { date: "2025-01-01", status: "absent", reason: "court_duty", caseId: "CR/007/2025", hearingTime: "10:00" },
          { date: "2025-01-06", status: "present", reason: null, caseId: "CR/006/2025", hearingTime: "10:00" },
          { date: "2025-01-07", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "10:00" },
          { date: "2025-01-08", status: "present", reason: null, caseId: "CR/006/2025", hearingTime: "12:00" },
          { date: "2025-01-10", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "13:00" },
          { date: "2025-01-13", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "9:00" },
          { date: "2025-01-15", status: "absent", reason: "official_duty", caseId: "CR/006/2025", hearingTime: "12:00" },
          { date: "2025-01-16", status: "absent", reason: "official_duty", caseId: "CR/006/2025", hearingTime: "13:00" },
          { date: "2025-01-20", status: "present", reason: null, caseId: "CR/007/2025", hearingTime: "13:00" },
          { date: "2025-01-21", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "10:00" },
          { date: "2025-01-22", status: "present", reason: null, caseId: "CR/006/2025", hearingTime: "9:00" },
          { date: "2025-01-23", status: "absent", reason: "family_emergency", caseId: "CR/004/2025", hearingTime: "14:00" },
          { date: "2025-01-24", status: "absent", reason: "family_emergency", caseId: "CR/008/2025", hearingTime: "10:00" },
          { date: "2025-01-27", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "13:00" },
          { date: "2025-01-28", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "15:00" },
          { date: "2025-01-29", status: "absent", reason: "court_duty", caseId: "CR/008/2025", hearingTime: "11:00" },
          { date: "2025-01-30", status: "present", reason: null, caseId: "CR/006/2025", hearingTime: "13:00" }
        ],
        summary: "The officer was assigned 17 hearings this month, of which they were present for 11. They were absent for 6 hearings and late for 0 hearings. Overall attendance rate: 64.71%"
      },
      {
        officer: { id: "IO002", name: "SI Priya Singh", rank: "Sub-Inspector", station: "Cuttack PS" },
        month: "January 2025",
        cases: [
          { caseId: "CR/003/2025", firNumber: "FIR003", type: "Assault", status: "ongoing" },
          { caseId: "CR/001/2025", firNumber: "FIR001", type: "Theft", status: "ongoing" }
        ],
        attendance: { total_hearings: 14, present: 12, absent: 2, late: 0, attendance_rate: 85.71 },
        timeline: [
          { date: "2025-01-02", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "11:00" },
          { date: "2025-01-03", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "14:00" },
          { date: "2025-01-06", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "10:00" },
          { date: "2025-01-09", status: "absent", reason: "medical", caseId: "CR/001/2025", hearingTime: "11:00" },
          { date: "2025-01-10", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "9:00" },
          { date: "2025-01-13", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "10:00" },
          { date: "2025-01-14", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "14:00" },
          { date: "2025-01-16", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "11:00" },
          { date: "2025-01-17", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "12:00" },
          { date: "2025-01-21", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "10:00" },
          { date: "2025-01-23", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "13:00" },
          { date: "2025-01-24", status: "absent", reason: null, caseId: "CR/001/2025", hearingTime: "9:00" },
          { date: "2025-01-28", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "11:00" },
          { date: "2025-01-30", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "14:00" }
        ],
        summary: "The officer was assigned 14 hearings this month, of which they were present for 12. They were absent for 2 hearings and late for 0 hearings. Overall attendance rate: 85.71%"
      },
      {
        officer: { id: "IO003", name: "ASI Suresh Nayak", rank: "Assistant Sub-Inspector", station: "Puri PS" },
        month: "January 2025",
        cases: [
          { caseId: "CR/005/2025", firNumber: "FIR005", type: "Cybercrime", status: "ongoing" },
          { caseId: "CR/002/2025", firNumber: "FIR002", type: "Fraud", status: "ongoing" }
        ],
        attendance: { total_hearings: 16, present: 14, absent: 1, late: 1, attendance_rate: 87.5 },
        timeline: [
          { date: "2025-01-01", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "10:00" },
          { date: "2025-01-03", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "11:00" },
          { date: "2025-01-07", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "13:00" },
          { date: "2025-01-08", status: "late", reason: null, caseId: "CR/002/2025", hearingTime: "9:00" },
          { date: "2025-01-09", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "14:00" },
          { date: "2025-01-10", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "12:00" },
          { date: "2025-01-13", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "10:00" },
          { date: "2025-01-15", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "11:00" },
          { date: "2025-01-16", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "13:00" },
          { date: "2025-01-17", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "10:00" },
          { date: "2025-01-20", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "14:00" },
          { date: "2025-01-22", status: "absent", reason: "emergency", caseId: "CR/002/2025", hearingTime: "11:00" },
          { date: "2025-01-23", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "12:00" },
          { date: "2025-01-27", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "9:00" },
          { date: "2025-01-28", status: "present", reason: null, caseId: "CR/005/2025", hearingTime: "10:00" },
          { date: "2025-01-30", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "14:00" }
        ],
        summary: "The officer was assigned 16 hearings this month, of which they were present for 14. They were absent for 1 hearing and late for 1 hearing. Overall attendance rate: 87.5%"
      },
      {
        officer: { id: "IO004", name: "SI Anjali Das", rank: "Sub-Inspector", station: "Berhampur PS" },
        month: "January 2025",
        cases: [
          { caseId: "CR/001/2025", firNumber: "FIR001", type: "Theft", status: "ongoing" },
          { caseId: "CR/008/2025", firNumber: "FIR008", type: "Murder", status: "ongoing" },
          { caseId: "CR/003/2025", firNumber: "FIR003", type: "Assault", status: "ongoing" }
        ],
        attendance: { total_hearings: 15, present: 13, absent: 2, late: 0, attendance_rate: 86.67 },
        timeline: [
          { date: "2025-01-02", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "10:00" },
          { date: "2025-01-06", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "11:00" },
          { date: "2025-01-07", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "14:00" },
          { date: "2025-01-09", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "9:00" },
          { date: "2025-01-10", status: "absent", reason: "official_duty", caseId: "CR/008/2025", hearingTime: "13:00" },
          { date: "2025-01-13", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "10:00" },
          { date: "2025-01-14", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "12:00" },
          { date: "2025-01-16", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "11:00" },
          { date: "2025-01-17", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "14:00" },
          { date: "2025-01-21", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "10:00" },
          { date: "2025-01-22", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "13:00" },
          { date: "2025-01-23", status: "absent", reason: null, caseId: "CR/003/2025", hearingTime: "9:00" },
          { date: "2025-01-27", status: "present", reason: null, caseId: "CR/001/2025", hearingTime: "11:00" },
          { date: "2025-01-28", status: "present", reason: null, caseId: "CR/008/2025", hearingTime: "12:00" },
          { date: "2025-01-30", status: "present", reason: null, caseId: "CR/003/2025", hearingTime: "14:00" }
        ],
        summary: "The officer was assigned 15 hearings this month, of which they were present for 13. They were absent for 2 hearings and late for 0 hearings. Overall attendance rate: 86.67%"
      },
      {
        officer: { id: "IO005", name: "ASI Kavita Rath", rank: "Assistant Sub-Inspector", station: "Rourkela PS" },
        month: "January 2025",
        cases: [
          { caseId: "CR/002/2025", firNumber: "FIR002", type: "Fraud", status: "ongoing" }
        ],
        attendance: { total_hearings: 13, present: 12, absent: 1, late: 0, attendance_rate: 92.31 },
        timeline: [
          { date: "2025-01-01", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "10:00" },
          { date: "2025-01-03", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "11:00" },
          { date: "2025-01-06", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "13:00" },
          { date: "2025-01-08", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "9:00" },
          { date: "2025-01-10", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "14:00" },
          { date: "2025-01-13", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "10:00" },
          { date: "2025-01-15", status: "absent", reason: "medical", caseId: "CR/002/2025", hearingTime: "12:00" },
          { date: "2025-01-17", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "11:00" },
          { date: "2025-01-20", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "13:00" },
          { date: "2025-01-22", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "10:00" },
          { date: "2025-01-24", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "14:00" },
          { date: "2025-01-27", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "9:00" },
          { date: "2025-01-29", status: "present", reason: null, caseId: "CR/002/2025", hearingTime: "11:00" }
        ],
        summary: "The officer was assigned 13 hearings this month, of which they were present for 12. They were absent for 1 hearing and late for 0 hearings. Overall attendance rate: 92.31%"
      }
    ];

    // Add more officers to total 20 (continuing the pattern)
    for (let i = 6; i <= 20; i++) {
      const officerIds = ["IO006", "IO007", "IO008", "IO009", "IO010", "IO011", "IO012", "IO013", "IO014", "IO015", "IO016", "IO017", "IO018", "IO019", "IO020"];
      const names = ["SI Bikash Mohanty", "ASI Sujata Panda", "SI Ramesh Behera", "ASI Mina Swain", "SI Prakash Sahoo", "ASI Dipti Mallick", "SI Subash Jena", "ASI Laxmi Padhi", "SI Debasis Parida", "ASI Rinku Sahu", "SI Mamata Biswal", "ASI Jitendra Patra", "SI Srikant Dash", "ASI Puspa Sethy", "SI Prasanta Barik"];
      const stations = ["Sambalpur PS", "Balasore PS", "Kendrapara PS", "Jagatsinghpur PS", "Khordha PS", "Nayagarh PS", "Ganjam PS", "Angul PS", "Dhenkanal PS", "Sundargarh PS", "Bargarh PS", "Jharsuguda PS", "Bolangir PS", "Nuapada PS", "Kalahandi PS"];
      
      const totalHearings = 10 + Math.floor(Math.random() * 10);
      const present = Math.floor(totalHearings * (0.8 + Math.random() * 0.15));
      const absent = totalHearings - present;
      const rate = ((present / totalHearings) * 100).toFixed(2);
      
      dummyReportData.push({
        officer: { id: officerIds[i-6], name: names[i-6], rank: i % 2 === 0 ? "Sub-Inspector" : "Assistant Sub-Inspector", station: stations[i-6] },
        month: "January 2025",
        cases: [{ caseId: `CR/00${i}/2025`, firNumber: `FIR00${i}`, type: ["Theft", "Fraud", "Assault"][i % 3], status: "ongoing" }],
        attendance: { total_hearings: totalHearings, present, absent, late: 0, attendance_rate: parseFloat(rate) },
        timeline: [],
        summary: `The officer was assigned ${totalHearings} hearings this month, of which they were present for ${present}. They were absent for ${absent} hearings and late for 0 hearings. Overall attendance rate: ${rate}%`
      });
    }

    if (reportType === "consolidated") {
      // Generate consolidated report for all officers
      const pdfBuffer = await generateConsolidatedReportPDF(
        dummyReportData,
        `${new Date(year, month - 1).toLocaleString("default", { month: "long" })} ${year}`
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=consolidated_report_${month}_${year}.pdf`);
      return res.send(pdfBuffer);
    } else {
      // Generate individual officer report
      if (!officerId) {
        return next(new ApiError(400, "Officer ID is required for individual report"));
      }

      // Find officer in dummy data
      const reportData = dummyReportData.find(r => r.officer.id === officerId);
      
      if (!reportData) {
        // Default to first officer if not found
        const defaultReport = dummyReportData[0];
        const pdfBuffer = await generateMonthlyReportPDF(defaultReport);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=report_${defaultReport.officer.name}_${month}_${year}.pdf`);
        return res.send(pdfBuffer);
      }

      const pdfBuffer = await generateMonthlyReportPDF(reportData);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=report_${reportData.officer.name}_${month}_${year}.pdf`);
      return res.send(pdfBuffer);
    }
  } catch (error) {
    console.error("Report generation error:", error);
    next(new ApiError(500, "Failed to generate report"));
  }
};
