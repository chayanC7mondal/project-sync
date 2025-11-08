import { GoogleGenerativeAI } from "@google/generative-ai";
import Case from "./caseModel.js";
import User from "./authModel.js";
import Witness from "./witnessModel.js";
import HearingSession from "./hearingSessionModel.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyAVBQQmLyoZ0ke0hx_OH8IKvRW0OaSEsa8");

/**
 * Generate AI response for chatbot queries
 * @param {string} userQuery - The user's question
 * @param {Object} contextData - Data context (cases, officers, witnesses)
 * @returns {Promise<string>} - AI generated response
 */
export const generateChatbotResponse = async (userQuery, contextData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare context for the AI
    const systemContext = `You are an intelligent assistant for the Odisha Police Court Attendance System. You help liaison officers, investigating officers, and administrators with information about court cases, hearings, attendance, and witnesses.

Context Data Available:
${JSON.stringify(contextData, null, 2)}

Your responsibilities:
1. Answer questions about cases (status, details, FIR numbers, sections)
2. Provide information about investigating officers (names, ranks, assignments, attendance)
3. Share witness details (names, cases, attendance records)
4. Explain hearing schedules and attendance patterns
5. Provide statistics and summaries when asked
6. Be professional, concise, and helpful

Guidelines:
- If data is not available, politely inform the user
- Provide specific information from the context when available
- Use professional police/legal terminology
- Keep responses clear and actionable
- Format lists and data in an easy-to-read manner`;

    const prompt = `${systemContext}

User Question: ${userQuery}

Please provide a helpful, accurate response based on the available data. If the question is about specific cases, officers, or witnesses, reference the context data provided above.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
};

/**
 * Prepare context data for chatbot
 * @param {Array} cases - List of cases
 * @param {Array} officers - List of investigating officers
 * @param {Array} witnesses - List of witnesses
 * @param {Array} hearings - List of hearings
 * @returns {Object} - Formatted context data
 */
export const prepareChatbotContext = (cases, officers, witnesses, hearings) => {
  return {
    summary: {
      totalCases: cases?.length || 0,
      totalOfficers: officers?.length || 0,
      totalWitnesses: witnesses?.length || 0,
      totalHearings: hearings?.length || 0,
    },
    cases: cases?.map(c => ({
      caseId: c.caseId,
      firNumber: c.firNumber,
      status: c.status,
      policeStation: c.policeStation,
      sections: c.sections,
      nextHearingDate: c.nextHearingDate,
      investigatingOfficer: c.investigatingOfficer?.username || "Not assigned",
    })) || [],
    officers: officers?.map(o => ({
      name: o.username,
      employeeId: o.employeeId,
      rank: o.rank,
      email: o.email,
      role: o.role,
    })) || [],
    witnesses: witnesses?.map(w => ({
      name: w.name,
      phone: w.phone,
      caseId: w.caseId,
      status: w.status,
    })) || [],
    hearings: hearings?.map(h => ({
      date: h.date,
      time: h.time,
      caseId: h.caseId,
      courtName: h.courtName,
      status: h.status,
    })) || [],
  };
};
