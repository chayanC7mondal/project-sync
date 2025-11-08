import Auth from "../models/authModel.js";
import Attendance from "../models/attendanceModel.js";
import HearingSession from "../models/hearingSessionModel.js";
import Case from "../models/caseModel.js";
import { sendNotification } from "./notificationUtils.js";
import { sendMultiChannelNotification } from "./smsUtils.js";

/**
 * Court Hearing Notification System
 * Handles all types of notifications for court proceedings
 */

/**
 * Send pre-hearing reminder (1 week before)
 */
export const sendPreHearingReminder = async (hearingSession) => {
  try {
    console.log(
      `[REMINDER] Sending pre-hearing reminders for hearing ${hearingSession._id}`
    );

    const caseDoc = await Case.findById(hearingSession.caseId).populate(
      "investigatingOfficer"
    );
    const attendanceRecords = await Attendance.find({
      hearingSessionId: hearingSession._id,
    }).populate("userId");

    const hearingDate = new Date(hearingSession.hearingDate);
    const formattedDate = hearingDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Notify Investigating Officer
    if (caseDoc.investigatingOfficer) {
      const notification = {
        recipient: caseDoc.investigatingOfficer._id,
        type: "reminder",
        priority: "high",
        title: "Court Hearing Reminder - 1 Week Notice",
        message: `You have a court hearing scheduled for case ${caseDoc.caseId} on ${formattedDate} at ${hearingSession.hearingTime} in ${hearingSession.courtName}. Please ensure all case documents are prepared and witnesses are notified.`,
        relatedEntityType: "hearing",
        relatedEntityId: hearingSession._id,
      };

      await sendMultiChannelNotification(
        caseDoc.investigatingOfficer,
        notification
      );
    }

    // Notify all witnesses
    for (const attendance of attendanceRecords) {
      if (attendance.userId && attendance.userType === "witness") {
        const notification = {
          recipient: attendance.userId._id,
          type: "reminder",
          priority: "high",
          title: "Court Hearing Reminder - You are Required to Appear",
          message: `You are required to appear in court for case ${caseDoc.caseId} on ${formattedDate} at ${hearingSession.hearingTime} in ${hearingSession.courtName}. Please arrive 30 minutes early and bring a valid ID. Your presence is mandatory.`,
          relatedEntityType: "hearing",
          relatedEntityId: hearingSession._id,
        };

        await sendMultiChannelNotification(attendance.userId, notification);
      }
    }

    console.log(
      `[REMINDER] Pre-hearing reminders sent successfully for ${caseDoc.caseId}`
    );
    return { success: true };
  } catch (error) {
    console.error("[REMINDER] Error sending pre-hearing reminders:", error);
    throw error;
  }
};

/**
 * Send day-of-hearing reminder (morning of hearing)
 */
export const sendDayOfHearingReminder = async (hearingSession) => {
  try {
    console.log(
      `[REMINDER] Sending day-of-hearing reminders for hearing ${hearingSession._id}`
    );

    const caseDoc = await Case.findById(hearingSession.caseId).populate(
      "investigatingOfficer"
    );
    const attendanceRecords = await Attendance.find({
      hearingSessionId: hearingSession._id,
    }).populate("userId");

    // Notify IO
    if (caseDoc.investigatingOfficer) {
      const notification = {
        recipient: caseDoc.investigatingOfficer._id,
        type: "alert",
        priority: "urgent",
        title: "Court Hearing Today - Immediate Action Required",
        message: `URGENT: Your court hearing for case ${caseDoc.caseId} is TODAY at ${hearingSession.hearingTime} in ${hearingSession.courtName}. Please arrive early with all case documents.`,
        relatedEntityType: "hearing",
        relatedEntityId: hearingSession._id,
      };

      await sendMultiChannelNotification(
        caseDoc.investigatingOfficer,
        notification
      );
    }

    // Notify witnesses
    for (const attendance of attendanceRecords) {
      if (attendance.userId && attendance.userType === "witness") {
        const notification = {
          recipient: attendance.userId._id,
          type: "alert",
          priority: "urgent",
          title: "Court Hearing Today - Your Presence Required",
          message: `URGENT: You must appear in court TODAY at ${hearingSession.hearingTime} for case ${caseDoc.caseId} in ${hearingSession.courtName}. Arrive 30 minutes early with valid ID.`,
          relatedEntityType: "hearing",
          relatedEntityId: hearingSession._id,
        };

        await sendMultiChannelNotification(attendance.userId, notification);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[REMINDER] Error sending day-of-hearing reminders:", error);
    throw error;
  }
};

/**
 * Handle post-hearing notifications based on attendance
 */
export const sendPostHearingNotifications = async (hearingSession) => {
  try {
    console.log(
      `[POST-HEARING] Processing post-hearing notifications for hearing ${hearingSession._id}`
    );

    const caseDoc = await Case.findById(hearingSession.caseId).populate(
      "investigatingOfficer"
    );
    const attendanceRecords = await Attendance.find({
      hearingSessionId: hearingSession._id,
    }).populate("userId");

    const ioAttendance = attendanceRecords.find((a) => a.userType === "io");
    const witnessAttendances = attendanceRecords.filter(
      (a) => a.userType === "witness"
    );

    const ioPresent = ioAttendance && ioAttendance.status === "present";
    const absentWitnesses = witnessAttendances.filter(
      (a) => a.status === "absent"
    );
    const presentWitnesses = witnessAttendances.filter(
      (a) => a.status === "present"
    );

    // Case 1: Witness absent, IO present
    if (!ioPresent && absentWitnesses.length > 0) {
      await handleBothAbsent(
        caseDoc,
        hearingSession,
        ioAttendance,
        absentWitnesses
      );
    }
    // Case 2: IO absent, witnesses present/absent
    else if (!ioPresent) {
      await handleIOAbsent(caseDoc, hearingSession, ioAttendance);
    }
    // Case 3: IO present, some witnesses absent
    else if (absentWitnesses.length > 0) {
      await handleWitnessesAbsent(caseDoc, hearingSession, absentWitnesses);
    }
    // Case 4: All present - send confirmation
    else if (
      ioPresent &&
      witnessAttendances.every((a) => a.status === "present")
    ) {
      await handleAllPresent(
        caseDoc,
        hearingSession,
        ioAttendance,
        presentWitnesses
      );
    }

    return { success: true };
  } catch (error) {
    console.error("[POST-HEARING] Error in post-hearing notifications:", error);
    throw error;
  }
};

/**
 * Handle case when both IO and witnesses are absent
 */
const handleBothAbsent = async (
  caseDoc,
  hearingSession,
  ioAttendance,
  absentWitnesses
) => {
  // Notify absent IO
  if (ioAttendance && ioAttendance.userId) {
    const notification = {
      recipient: ioAttendance.userId._id,
      type: "alert",
      priority: "urgent",
      title: "Court Hearing Missed - Immediate Action Required",
      message: `You missed the court hearing for case ${caseDoc.caseId} scheduled today. This absence has been recorded and may affect case proceedings. Please contact the court immediately and provide a valid reason.`,
      relatedEntityType: "hearing",
      relatedEntityId: hearingSession._id,
    };

    await sendMultiChannelNotification(ioAttendance.userId, notification);
  }

  // Notify absent witnesses
  for (const witnessAttendance of absentWitnesses) {
    if (witnessAttendance.userId) {
      const notification = {
        recipient: witnessAttendance.userId._id,
        type: "alert",
        priority: "urgent",
        title: "Court Hearing Missed - Legal Consequences May Apply",
        message: `You failed to appear for the court hearing in case ${caseDoc.caseId} today. Your absence has been officially recorded. You may face legal consequences for non-compliance with court summons.`,
        relatedEntityType: "hearing",
        relatedEntityId: hearingSession._id,
      };

      await sendMultiChannelNotification(
        witnessAttendance.userId,
        notification
      );
    }
  }

  // Notify supervising officers about both absences
  await notifySupervisors(caseDoc, hearingSession, "both_absent", {
    ioAbsent: true,
    witnessesAbsent: absentWitnesses.length,
  });
};

/**
 * Handle case when IO is absent
 */
const handleIOAbsent = async (caseDoc, hearingSession, ioAttendance) => {
  if (ioAttendance && ioAttendance.userId) {
    const notification = {
      recipient: ioAttendance.userId._id,
      type: "alert",
      priority: "urgent",
      title: "Court Hearing Missed - Explain Absence",
      message: `You missed the court hearing for case ${caseDoc.caseId}. Please provide a valid reason for your absence through the system. Multiple absences may result in disciplinary action.`,
      relatedEntityType: "hearing",
      relatedEntityId: hearingSession._id,
    };

    await sendMultiChannelNotification(ioAttendance.userId, notification);

    // Check for multiple absences
    const recentAbsences = await Attendance.countDocuments({
      userId: ioAttendance.userId._id,
      userType: "io",
      status: "absent",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    if (recentAbsences >= 3) {
      await notifySupervisors(caseDoc, hearingSession, "io_multiple_absences", {
        officerId: ioAttendance.userId._id,
        absentCount: recentAbsences,
      });
    }
  }
};

/**
 * Handle case when witnesses are absent but IO is present
 */
const handleWitnessesAbsent = async (
  caseDoc,
  hearingSession,
  absentWitnesses
) => {
  for (const witnessAttendance of absentWitnesses) {
    if (witnessAttendance.userId) {
      const notification = {
        recipient: witnessAttendance.userId._id,
        type: "alert",
        priority: "urgent",
        title: "Court Hearing Missed - Next Hearing Notice",
        message: `You failed to appear for court hearing in case ${caseDoc.caseId}. A warrant may be issued against you. You will receive notice for the next hearing date. Ensure your attendance to avoid legal complications.`,
        relatedEntityType: "hearing",
        relatedEntityId: hearingSession._id,
      };

      await sendMultiChannelNotification(
        witnessAttendance.userId,
        notification
      );
    }
  }
};

/**
 * Handle case when everyone is present
 */
const handleAllPresent = async (
  caseDoc,
  hearingSession,
  ioAttendance,
  presentWitnesses
) => {
  // Confirm to IO
  if (ioAttendance && ioAttendance.userId) {
    const notification = {
      recipient: ioAttendance.userId._id,
      type: "success",
      priority: "normal",
      title: "Court Hearing Completed Successfully",
      message: `The court hearing for case ${caseDoc.caseId} was completed successfully with all parties present. Thank you for your diligence.`,
      relatedEntityType: "hearing",
      relatedEntityId: hearingSession._id,
    };

    await sendMultiChannelNotification(ioAttendance.userId, notification);
  }

  // Confirm to witnesses
  for (const witnessAttendance of presentWitnesses) {
    if (witnessAttendance.userId) {
      const notification = {
        recipient: witnessAttendance.userId._id,
        type: "success",
        priority: "normal",
        title: "Thank You for Court Attendance",
        message: `Thank you for appearing in court for case ${caseDoc.caseId}. Your cooperation is appreciated. You will be notified if further appearances are required.`,
        relatedEntityType: "hearing",
        relatedEntityId: hearingSession._id,
      };

      await sendMultiChannelNotification(
        witnessAttendance.userId,
        notification
      );
    }
  }
};

/**
 * Notify supervisors and higher officials
 */
const notifySupervisors = async (
  caseDoc,
  hearingSession,
  alertType,
  details
) => {
  try {
    // Find supervisors (SP and higher officials)
    const supervisors = await Auth.find({
      role: "admin", // Assuming admins are supervisors
      isActive: true,
    });

    for (const supervisor of supervisors) {
      let message = "";

      switch (alertType) {
        case "both_absent":
          message = `CRITICAL: Both Investigating Officer and ${
            details.witnessesAbsent
          } witness(es) were absent from court hearing for case ${
            caseDoc.caseId
          } on ${new Date(
            hearingSession.hearingDate
          ).toDateString()}. Immediate investigation required.`;
          break;
        case "io_multiple_absences":
          message = `WARNING: Investigating Officer has been absent from ${details.absentCount} court hearings in the last 30 days. Officer ID: ${details.officerId}. Disciplinary action may be required.`;
          break;
      }

      const notification = {
        recipient: supervisor._id,
        type: "alert",
        priority: "urgent",
        title: "Supervisor Alert - Court Attendance Issue",
        message: message,
        relatedEntityType: "hearing",
        relatedEntityId: hearingSession._id,
      };

      await sendMultiChannelNotification(supervisor, notification);
    }
  } catch (error) {
    console.error("[SUPERVISOR] Error notifying supervisors:", error);
  }
};

export default {
  sendPreHearingReminder,
  sendDayOfHearingReminder,
  sendPostHearingNotifications,
};
