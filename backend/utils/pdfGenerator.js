import PDFDocument from "pdfkit";
import { Readable } from "stream";

/**
 * Generate Monthly Attendance Report PDF
 * @param {Object} reportData - Report data containing officer information and attendance
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generateMonthlyReportPDF = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Monthly Attendance Report", { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(reportData.month || "January 2025", { align: "center" });

      doc.moveDown(1);
      drawHorizontalLine(doc);
      doc.moveDown(0.5);

      // Officer Information Section
      doc.fontSize(14).font("Helvetica-Bold").text("Officer Information");
      doc.moveDown(0.3);

      doc.fontSize(10).font("Helvetica");
      doc.text(`Name: ${reportData.officer.name}`);
      doc.text(`Rank: ${reportData.officer.rank}`);
      doc.text(`Station: ${reportData.officer.station}`);
      doc.text(`Officer ID: ${reportData.officer.id}`);

      doc.moveDown(1);
      drawHorizontalLine(doc);
      doc.moveDown(0.5);

      // Attendance Summary Section
      doc.fontSize(14).font("Helvetica-Bold").text("Attendance Summary");
      doc.moveDown(0.3);

      const { attendance } = reportData;
      doc.fontSize(10).font("Helvetica");
      doc.text(`Total Hearings: ${attendance.total_hearings}`);
      doc.text(`Present: ${attendance.present}`, { continued: true });
      doc.fillColor("green").text(` (${Math.round((attendance.present / attendance.total_hearings) * 100)}%)`, { continued: false });
      doc.fillColor("black");
      
      doc.text(`Absent: ${attendance.absent}`, { continued: true });
      doc.fillColor("red").text(` (${Math.round((attendance.absent / attendance.total_hearings) * 100)}%)`, { continued: false });
      doc.fillColor("black");
      
      doc.text(`Late: ${attendance.late}`, { continued: true });
      doc.fillColor("orange").text(` (${Math.round((attendance.late / attendance.total_hearings) * 100)}%)`, { continued: false });
      doc.fillColor("black");
      
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text(`Overall Attendance Rate: ${attendance.attendance_rate}%`);

      doc.moveDown(1);
      drawHorizontalLine(doc);
      doc.moveDown(0.5);

      // Cases Assigned Section
      doc.fontSize(14).font("Helvetica-Bold").text("Assigned Cases");
      doc.moveDown(0.3);

      doc.fontSize(10).font("Helvetica");
      reportData.cases.forEach((caseItem, index) => {
        doc.text(`${index + 1}. ${caseItem.caseId} - ${caseItem.type} (${caseItem.status})`);
      });

      doc.moveDown(1);
      drawHorizontalLine(doc);
      doc.moveDown(0.5);

      // Detailed Timeline Section
      doc.fontSize(14).font("Helvetica-Bold").text("Attendance Timeline");
      doc.moveDown(0.3);

      doc.fontSize(9).font("Helvetica");
      
      // Group by status
      const presentDays = reportData.timeline.filter(t => t.status === "present");
      const absentDays = reportData.timeline.filter(t => t.status === "absent");
      const lateDays = reportData.timeline.filter(t => t.status === "late");

      if (presentDays.length > 0) {
        doc.font("Helvetica-Bold").fillColor("green").text("Present Days:", { underline: true });
        doc.font("Helvetica").fillColor("black");
        presentDays.forEach(record => {
          doc.text(`  • ${record.date} - ${record.hearingTime} - Case: ${record.caseId}`);
        });
        doc.moveDown(0.5);
      }

      if (lateDays.length > 0) {
        doc.font("Helvetica-Bold").fillColor("orange").text("Late Days:", { underline: true });
        doc.font("Helvetica").fillColor("black");
        lateDays.forEach(record => {
          doc.text(`  • ${record.date} - ${record.hearingTime} - Case: ${record.caseId}`);
        });
        doc.moveDown(0.5);
      }

      if (absentDays.length > 0) {
        doc.font("Helvetica-Bold").fillColor("red").text("Absent Days:", { underline: true });
        doc.font("Helvetica").fillColor("black");
        absentDays.forEach(record => {
          const reasonText = record.reason ? ` (Reason: ${record.reason})` : " (No reason provided)";
          doc.text(`  • ${record.date} - ${record.hearingTime} - Case: ${record.caseId}${reasonText}`);
        });
        doc.moveDown(0.5);
      }

      // Add new page if needed for summary
      if (doc.y > 650) {
        doc.addPage();
      }

      doc.moveDown(1);
      drawHorizontalLine(doc);
      doc.moveDown(0.5);

      // Summary Section
      doc.fontSize(14).font("Helvetica-Bold").fillColor("black").text("Monthly Summary");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      doc.text(reportData.summary, { align: "justify" });

      // Footer
      doc.moveDown(2);
      drawHorizontalLine(doc);
      doc.fontSize(8).font("Helvetica").text(
        `Generated on: ${new Date().toLocaleString()}`,
        { align: "center" }
      );
      doc.text("H4S - Hearing for Success System", { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Consolidated Report for Multiple Officers
 */
export const generateConsolidatedReportPDF = async (reportDataArray, month) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc.fontSize(20).font("Helvetica-Bold").text("Consolidated Attendance Report", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica").text(month || "January 2025", { align: "center" });
      doc.moveDown(1);
      drawHorizontalLine(doc);
      doc.moveDown(0.5);

      // Overall Statistics
      const totalHearings = reportDataArray.reduce((sum, r) => sum + r.attendance.total_hearings, 0);
      const totalPresent = reportDataArray.reduce((sum, r) => sum + r.attendance.present, 0);
      const totalAbsent = reportDataArray.reduce((sum, r) => sum + r.attendance.absent, 0);
      const totalLate = reportDataArray.reduce((sum, r) => sum + r.attendance.late, 0);
      const overallRate = totalHearings > 0 ? ((totalPresent / totalHearings) * 100).toFixed(2) : 0;

      doc.fontSize(14).font("Helvetica-Bold").text("Overall Statistics");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Total Officers: ${reportDataArray.length}`);
      doc.text(`Total Hearings: ${totalHearings}`);
      doc.text(`Total Present: ${totalPresent} (${Math.round((totalPresent/totalHearings)*100)}%)`);
      doc.text(`Total Absent: ${totalAbsent} (${Math.round((totalAbsent/totalHearings)*100)}%)`);
      doc.text(`Total Late: ${totalLate} (${Math.round((totalLate/totalHearings)*100)}%)`);
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text(`Overall Attendance Rate: ${overallRate}%`);

      doc.moveDown(1);
      drawHorizontalLine(doc);
      doc.moveDown(0.5);

      // Individual Officer Summaries
      doc.fontSize(14).font("Helvetica-Bold").text("Officer-wise Summary");
      doc.moveDown(0.5);

      reportDataArray.forEach((officer, index) => {
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.fontSize(11).font("Helvetica-Bold");
        doc.text(`${index + 1}. ${officer.officer.name} (${officer.officer.id})`);
        
        doc.fontSize(9).font("Helvetica");
        doc.text(`   Rank: ${officer.officer.rank} | Station: ${officer.officer.station}`);
        doc.text(`   Hearings: ${officer.attendance.total_hearings} | Present: ${officer.attendance.present} | Absent: ${officer.attendance.absent} | Rate: ${officer.attendance.attendance_rate}%`);
        doc.moveDown(0.3);
      });

      // Footer
      doc.moveDown(2);
      drawHorizontalLine(doc);
      doc.fontSize(8).font("Helvetica").text(
        `Generated on: ${new Date().toLocaleString()}`,
        { align: "center" }
      );
      doc.text("H4S - Hearing for Success System", { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Helper function to draw horizontal line
 */
function drawHorizontalLine(doc) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();
}
