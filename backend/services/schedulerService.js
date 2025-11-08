import HearingSession from "../models/hearingSessionModel.js";
import Attendance from "../models/attendanceModel.js";
import Case from "../models/caseModel.js";
import Auth from "../models/authModel.js";
import Witness from "../models/witnessModel.js";
import { sendHearingReminder, sendAbsenceNotification } from "../utils/notificationUtils.js";
import { checkHearingProximity } from "../utils/qrCodeUtils.js";

/**
 * Check and send hearing reminders for tomorrow and today
 * Should run daily
 */
export const checkAndSendHearingReminders = async () => {
  try {
    console.log("[Scheduler] Checking for hearing reminders...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find hearings scheduled for tomorrow that haven't been reminded
    const upcomingHearings = await HearingSession.find({
      hearingDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
      status: "scheduled",
      reminderSent: false
    }).populate("caseId");

    console.log(`[Scheduler] Found ${upcomingHearings.length} hearings to remind`);

    for (const hearingSession of upcomingHearings) {
      try {
        const caseDoc = await Case.findById(hearingSession.caseId)
          .populate("investigatingOfficer")
          .populate("witnesses");

        if (caseDoc) {
          await sendHearingReminder(caseDoc, hearingSession);
          hearingSession.reminderSent = true;
          await hearingSession.save();
          console.log(`[Scheduler] Sent reminders for hearing ${hearingSession._id}`);
        }
      } catch (error) {
        console.error(`[Scheduler] Error sending reminder for hearing ${hearingSession._id}:`, error);
      }
    }

    console.log("[Scheduler] Hearing reminders check completed");
  } catch (error) {
    console.error("[Scheduler] Error in checkAndSendHearingReminders:", error);
  }
};

/**
 * Check for absent users and send notifications
 * Should run on hearing day evening or after hearing time
 */
export const checkAndNotifyAbsentUsers = async () => {
  try {
    console.log("[Scheduler] Checking for absent users...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's hearings
    const todayHearings = await HearingSession.find({
      hearingDate: { $gte: today, $lt: tomorrow },
      status: { $in: ["scheduled", "ongoing", "completed"] }
    });

    console.log(`[Scheduler] Found ${todayHearings.length} hearings today`);

    for (const hearingSession of todayHearings) {
      try {
        // Find attendance records that are not marked
        const absentRecords = await Attendance.find({
          hearingSessionId: hearingSession._id,
          status: { $in: ["not-marked", "absent"] },
          absenceNotificationSent: false
        });

        if (absentRecords.length === 0) continue;

        const caseDoc = await Case.findById(hearingSession.caseId)
          .populate("investigatingOfficer")
          .populate("liaisonOfficer");

        if (!caseDoc) continue;

        console.log(`[Scheduler] Found ${absentRecords.length} absent records for hearing ${hearingSession._id}`);

        // Send notifications for each absent user
        for (const attendance of absentRecords) {
          try {
            let userName = "Unknown";
            let userModel = null;

            if (attendance.userType === "officer") {
              userModel = await Auth.findById(attendance.userId);
              if (userModel) userName = userModel.username;
            } else if (attendance.userType === "witness") {
              userModel = await Witness.findById(attendance.userId);
              if (userModel) userName = userModel.name;
            }

            // Check if user has submitted absence reason
            const AbsenceReason = (await import("../models/absenceReasonModel.js")).default;
            const absenceReason = await AbsenceReason.findOne({
              hearingSessionId: hearingSession._id,
              userId: attendance.userId
            });

            // Send notification
            await sendAbsenceNotification(
              caseDoc,
              {
                hearingDate: hearingSession.hearingDate,
                reason: absenceReason ? absenceReason.reason : null
              },
              userName,
              attendance.userType
            );

            attendance.absenceNotificationSent = true;
            await attendance.save();

            console.log(`[Scheduler] Sent absence notification for ${userName} (${attendance.userType})`);
          } catch (error) {
            console.error(`[Scheduler] Error notifying absent user ${attendance.userId}:`, error);
          }
        }
      } catch (error) {
        console.error(`[Scheduler] Error processing hearing ${hearingSession._id}:`, error);
      }
    }

    console.log("[Scheduler] Absent users check completed");
  } catch (error) {
    console.error("[Scheduler] Error in checkAndNotifyAbsentUsers:", error);
  }
};

/**
 * Initialize scheduler to run periodic tasks
 */
export const initializeScheduler = () => {
  console.log("[Scheduler] Initializing scheduler...");

  // Run hearing reminders check daily at 9 AM
  const reminderInterval = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(checkAndSendHearingReminders, reminderInterval);
  
  // Run initial check after 1 minute
  setTimeout(checkAndSendHearingReminders, 60 * 1000);

  // Run absent users check daily at 6 PM
  const absenceCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(checkAndNotifyAbsentUsers, absenceCheckInterval);
  
  // Calculate time until 6 PM today
  const now = new Date();
  const target = new Date();
  target.setHours(18, 0, 0, 0);
  
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const timeUntilTarget = target.getTime() - now.getTime();
  setTimeout(() => {
    checkAndNotifyAbsentUsers();
    setInterval(checkAndNotifyAbsentUsers, absenceCheckInterval);
  }, timeUntilTarget);

  console.log("[Scheduler] Scheduler initialized successfully");
};
