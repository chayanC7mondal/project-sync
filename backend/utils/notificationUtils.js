import Notification from "../models/notificationModel.js";
import Auth from "../models/authModel.js";
import Case from "../models/caseModel.js";

/**
 * Send notification to a user
 */
export const sendNotification = async ({ 
  recipient, 
  type, 
  priority, 
  title, 
  message, 
  relatedEntityType, 
  relatedEntityId 
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      priority: priority || "normal",
      title,
      message,
      relatedEntityType,
      relatedEntityId
    });
    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * Send hearing reminder to officer and witnesses
 */
export const sendHearingReminder = async (caseDoc, hearingSession) => {
  const hearingDateStr = new Date(hearingSession.hearingDate).toLocaleDateString();
  
  // Notify investigating officer
  if (caseDoc.investigatingOfficer) {
    await sendNotification({
      recipient: caseDoc.investigatingOfficer,
      type: "reminder",
      priority: "high",
      title: "Hearing Reminder",
      message: `You have a hearing scheduled for case ${caseDoc.caseId} on ${hearingDateStr} at ${hearingSession.hearingTime} in ${hearingSession.courtName}`,
      relatedEntityType: "hearing",
      relatedEntityId: hearingSession._id
    });
  }
  
  // Notify all witnesses
  if (caseDoc.witnesses && caseDoc.witnesses.length > 0) {
    for (const witnessId of caseDoc.witnesses) {
      await sendNotification({
        recipient: witnessId,
        type: "reminder",
        priority: "high",
        title: "Hearing Reminder",
        message: `You have a hearing scheduled for case ${caseDoc.caseId} on ${hearingDateStr} at ${hearingSession.hearingTime} in ${hearingSession.courtName}`,
        relatedEntityType: "hearing",
        relatedEntityId: hearingSession._id
      });
    }
  }
};

/**
 * Send absence notification to all upper officers and inspector
 */
export const sendAbsenceNotification = async (caseDoc, absenceReason, userName, userType) => {
  const hearingDateStr = new Date(absenceReason.hearingDate).toLocaleDateString();
  const hasReason = absenceReason.reason ? "with reason" : "without reason";
  
  const title = `${userType === "officer" ? "Officer" : "Witness"} Absence Alert`;
  const message = absenceReason.reason
    ? `${userName} will not attend the hearing for case ${caseDoc.caseId} on ${hearingDateStr}. Reason: ${absenceReason.reason}`
    : `${userName} has not responded to the hearing notification for case ${caseDoc.caseId} on ${hearingDateStr}`;
  
  // Notify all officers with higher roles
  const upperOfficers = await Auth.find({
    role: { $in: ["admin", "liaison"] },
    isActive: true
  });
  
  for (const officer of upperOfficers) {
    await sendNotification({
      recipient: officer._id,
      type: "alert",
      priority: "urgent",
      title,
      message,
      relatedEntityType: "case",
      relatedEntityId: caseDoc._id
    });
  }
  
  // Notify investigating officer if different
  if (caseDoc.investigatingOfficer) {
    await sendNotification({
      recipient: caseDoc.investigatingOfficer,
      type: "alert",
      priority: "urgent",
      title,
      message,
      relatedEntityType: "case",
      relatedEntityId: caseDoc._id
    });
  }
  
  // Notify liaison officer if assigned
  if (caseDoc.liaisonOfficer) {
    await sendNotification({
      recipient: caseDoc.liaisonOfficer,
      type: "alert",
      priority: "urgent",
      title,
      message,
      relatedEntityType: "case",
      relatedEntityId: caseDoc._id
    });
  }
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (notifications) => {
  try {
    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    throw error;
  }
};
