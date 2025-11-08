import HearingSession from "../models/hearingSessionModel.js";
import Attendance from "../models/attendanceModel.js";
import Case from "../models/caseModel.js";
import Auth from "../models/authModel.js";
import Witness from "../models/witnessModel.js";
import { sendHearingReminder, sendAbsenceNotification } from "../utils/notificationUtils.js";
import { checkHearingProximity } from "../utils/qrCodeUtils.js";
import { 
  sendPreHearingReminder, 
  sendDayOfHearingReminder, 
  sendPostHearingNotifications 
} from "./hearingNotificationService.js";

/**
 * Enhanced hearing reminder system with multi-channel notifications
 * Sends reminders at different intervals: 1 week before, day of hearing
 */
export const checkAndSendHearingReminders = async () => {
  try {
    console.log("[Scheduler] Checking for enhanced hearing reminders...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1 week reminder
    await sendWeeklyReminders(today);
    
    // Day-of reminders
    await sendDayOfReminders(today);

    console.log("[Scheduler] Enhanced hearing reminders check completed");
  } catch (error) {
    console.error("[Scheduler] Error in checkAndSendHearingReminders:", error);
  }
};

/**
 * Send 1-week advance reminders
 */
const sendWeeklyReminders = async (today) => {
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  
  const dayAfterWeek = new Date(oneWeekLater);
  dayAfterWeek.setDate(dayAfterWeek.getDate() + 1);

  const weeklyHearings = await HearingSession.find({
    hearingDate: { $gte: oneWeekLater, $lt: dayAfterWeek },
    status: "scheduled",
    weeklyReminderSent: { $ne: true }
  });

  console.log(`[Scheduler] Found ${weeklyHearings.length} hearings for 1-week reminders`);

  for (const hearingSession of weeklyHearings) {
    try {
      await sendPreHearingReminder(hearingSession);
      
      // Mark as sent
      hearingSession.weeklyReminderSent = true;
      await hearingSession.save();
      
      console.log(`[Scheduler] Sent 1-week reminder for hearing ${hearingSession._id}`);
    } catch (error) {
      console.error(`[Scheduler] Error sending 1-week reminder for hearing ${hearingSession._id}:`, error);
    }
  }
};

/**
 * Send day-of-hearing reminders
 */
const sendDayOfReminders = async (today) => {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayHearings = await HearingSession.find({
    hearingDate: { $gte: today, $lt: tomorrow },
    status: "scheduled",
    dayOfReminderSent: { $ne: true }
  });

  console.log(`[Scheduler] Found ${todayHearings.length} hearings for day-of reminders`);

  for (const hearingSession of todayHearings) {
    try {
      await sendDayOfHearingReminder(hearingSession);
      
      // Mark as sent
      hearingSession.dayOfReminderSent = true;
      await hearingSession.save();
      
      console.log(`[Scheduler] Sent day-of reminder for hearing ${hearingSession._id}`);
    } catch (error) {
      console.error(`[Scheduler] Error sending day-of reminder for hearing ${hearingSession._id}:`, error);
    }
  }
};

/**
 * Enhanced post-hearing notification system
 * Analyzes attendance patterns and sends appropriate alerts
 */
export const checkAndNotifyAbsentUsers = async () => {
  try {
    console.log("[Scheduler] Processing post-hearing notifications...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's hearings that haven't been processed for post-notifications
    const todayHearings = await HearingSession.find({
      hearingDate: { $gte: today, $lt: tomorrow },
      status: { $in: ["scheduled", "ongoing", "completed"] },
      postNotificationsSent: { $ne: true }
    });

    console.log(`[Scheduler] Found ${todayHearings.length} hearings for post-processing`);

    for (const hearingSession of todayHearings) {
      try {
        // Check if hearing time has passed (wait at least 2 hours after scheduled time)
        const hearingDateTime = new Date(hearingSession.hearingDate);
        const [hours, minutes] = hearingSession.hearingTime.split(':');
        hearingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const twoHoursAfterHearing = new Date(hearingDateTime.getTime() + (2 * 60 * 60 * 1000));
        
        if (new Date() < twoHoursAfterHearing) {
          continue; // Wait more time before processing
        }

        // Send comprehensive post-hearing notifications
        await sendPostHearingNotifications(hearingSession);
        
        // Mark as processed
        hearingSession.postNotificationsSent = true;
        await hearingSession.save();
        
        console.log(`[Scheduler] Processed post-hearing notifications for hearing ${hearingSession._id}`);
        
      } catch (error) {
        console.error(`[Scheduler] Error processing hearing ${hearingSession._id}:`, error);
      }
    }

    console.log("[Scheduler] Post-hearing notifications completed");
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
