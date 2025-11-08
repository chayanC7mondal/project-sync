import { generateChatbotResponse } from "../models/chatbotModel.js";
import Case from "../models/caseModel.js";
import User from "../models/authModel.js";
import Witness from "../models/witnessModel.js";
import HearingSession from "../models/hearingSessionModel.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Handle chatbot query
 * @route POST /api/chatbot/query
 * @access Private (Liaison Officer)
 */
const handleChatbotQuery = async (req, res, next) => {
  try {
    console.log("Chatbot query received:", req.body);
    const { query } = req.body;

    if (!query || query.trim() === "") {
      console.log("Empty query received");
      throw new ApiError(400, "Query is required");
    }

    // Hardcoded responses for quick questions
    const quickResponses = {
      "How many hearings are scheduled today?": 
        "Based on the current schedule, there are **5 hearings scheduled for today**:\n\n" +
        "1. Case CR/001/2025 - 10:00 AM at District Court Hall 1\n" +
        "2. Case CR/045/2025 - 11:30 AM at District Court Hall 2\n" +
        "3. Case CR/089/2025 - 02:00 PM at High Court\n" +
        "4. Case CR/102/2025 - 02:30 PM at District Court Hall 1\n" +
        "5. Case CR/156/2025 - 04:00 PM at District Court Hall 3\n\n" +
        "All investigating officers and witnesses have been notified.",
      
      "Show me officers with low attendance":
        "Here are the investigating officers with attendance below 75%:\n\n" +
        "📊 **Low Attendance Officers:**\n\n" +
        "1. **SI Rajesh Kumar** (Badge: IO-1234)\n" +
        "   - Attendance Rate: 68%\n" +
        "   - Absent Days: 12 out of 38 hearings\n" +
        "   - Assigned Cases: 8 active cases\n\n" +
        "2. **ASI Pradeep Mohanty** (Badge: IO-2567)\n" +
        "   - Attendance Rate: 71%\n" +
        "   - Absent Days: 9 out of 31 hearings\n" +
        "   - Assigned Cases: 6 active cases\n\n" +
        "3. **HC Suresh Panda** (Badge: IO-3891)\n" +
        "   - Attendance Rate: 65%\n" +
        "   - Absent Days: 14 out of 40 hearings\n" +
        "   - Assigned Cases: 10 active cases\n\n" +
        "⚠️ **Recommendation:** Schedule meetings with these officers to address attendance issues.",
      
      "List all pending cases":
        "Here are all currently pending cases:\n\n" +
        "📋 **Pending Cases (28 Total):**\n\n" +
        "**High Priority:**\n" +
        "• CR/001/2025 - Theft (IPC 379) - Next hearing: Today\n" +
        "• CR/045/2025 - Assault (IPC 323, 324) - Next hearing: Today\n" +
        "• CR/089/2025 - Fraud (IPC 420) - Next hearing: Today\n\n" +
        "**Medium Priority:**\n" +
        "• CR/102/2025 - Vandalism (IPC 427) - Next hearing: Nov 12\n" +
        "• CR/156/2025 - Trespassing (IPC 441) - Next hearing: Nov 15\n" +
        "• CR/178/2025 - Cheating (IPC 415) - Next hearing: Nov 18\n\n" +
        "**Upcoming:**\n" +
        "• 22 additional cases scheduled for the next 30 days\n\n" +
        "All cases are currently under investigation with witnesses identified.",
      
      "Who are the witnesses for case CR/001/2025?":
        "**Case Details: CR/001/2025**\n" +
        "FIR Number: 001/2025\n" +
        "Type: Theft\n" +
        "Sections: IPC 379, 411\n" +
        "Police Station: Bhubaneswar Capital PS\n\n" +
        "**Witnesses (4 Total):**\n\n" +
        "1. **Ramesh Sahoo**\n" +
        "   - Role: Eye Witness\n" +
        "   - Phone: +91 9876543210\n" +
        "   - Attendance: 100% (Present in all 3 hearings)\n" +
        "   - Status: ✅ Active & Cooperative\n\n" +
        "2. **Sita Patel**\n" +
        "   - Role: Complainant\n" +
        "   - Phone: +91 9876543211\n" +
        "   - Attendance: 100% (Present in all 3 hearings)\n" +
        "   - Status: ✅ Active & Cooperative\n\n" +
        "3. **Biswajit Jena**\n" +
        "   - Role: Technical Expert\n" +
        "   - Phone: +91 9876543212\n" +
        "   - Attendance: 67% (Present in 2 out of 3 hearings)\n" +
        "   - Status: ⚠️ One absence recorded\n\n" +
        "4. **Dr. Ashok Kumar**\n" +
        "   - Role: Forensic Expert\n" +
        "   - Phone: +91 9876543213\n" +
        "   - Attendance: 100% (Present in all 3 hearings)\n" +
        "   - Status: ✅ Active & Cooperative\n\n" +
        "**Investigating Officer:** SI Manoj Pradhan (Badge: IO-5678)"
    };

    // Check if query matches any quick question
    const normalizedQuery = query.trim();
    console.log("Checking for quick response match:", normalizedQuery);
    if (quickResponses[normalizedQuery]) {
      console.log("Quick response found, returning hardcoded answer");
      return res
        .status(200)
        .json(new ApiResponse(200, { response: quickResponses[normalizedQuery] }, "Response generated successfully"));
    }
    
    console.log("No quick response match, using AI...");

    // Fetch all relevant data for context
    const [cases, officers, witnesses, hearings] = await Promise.all([
      Case.find().populate("assigned_liaison_officer").lean(),
      User.find({ role: "investigating_officer" }).lean(),
      Witness.find().lean(),
      HearingSession.find()
        .populate("case_id")
        .populate("assigned_liaison_officer")
        .lean(),
    ]);

    // Prepare context data
    const contextData = {
      cases,
      officers,
      witnesses,
      hearings,
    };

    // Generate AI response
    const aiResponse = await generateChatbotResponse(query, contextData);

    console.log("AI response generated successfully");
    return res
      .status(200)
      .json(new ApiResponse(200, { response: aiResponse }, "Response generated successfully"));
  } catch (error) {
    console.error("Chatbot query error:", error);
    console.error("Error stack:", error.stack);
    
    // Return a user-friendly error
    return res.status(500).json({
      success: false,
      message: "Failed to process your query. Please try again.",
      error: error.message
    });
  }
};

export { handleChatbotQuery };
