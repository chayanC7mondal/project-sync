import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  onClose: () => void;
}

type Language = "english" | "odia";

const Chatbot = ({ onClose }: ChatbotProps) => {
  const [language, setLanguage] = useState<Language>("english");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant for the Odisha Police Court Attendance System. I can help you with information about cases, officers, witnesses, hearings, and attendance. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Update initial message when language changes
  useEffect(() => {
    const initialMessages: { [key in Language]: string } = {
      english: "Hello! I'm your AI assistant for the Odisha Police Court Attendance System. I can help you with information about cases, officers, witnesses, hearings, and attendance. How can I assist you today?",
      odia: "ନମସ୍କାର! ମୁଁ ଓଡିଶା ପୋଲିସ କୋର୍ଟ ଉପସ୍ଥିତି ପ୍ରଣାଳୀ ପାଇଁ ଆପଣଙ୍କର AI ସହାୟକ | ମୁଁ ଆପଣଙ୍କୁ ମାମଲା, ଅଧିକାରୀ, ସାକ୍ଷୀ, ଶୁଣାଣି ଏବଂ ଉପସ୍ଥିତି ବିଷୟରେ ସୂଚନା ଦେଇ ପାରିବି | ମୁଁ ଆପଣଙ୍କୁ ଆଜି କିପରି ସାହାଯ୍ୟ କରିପାରିବି?"
    };

    setMessages([{
      id: "1",
      role: "assistant",
      content: initialMessages[language],
      timestamp: new Date(),
    }]);
    setAnsweredQuestions([]); // Reset answered questions when language changes
  }, [language]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuery = input.trim();
    setInput("");
    setIsLoading(true);

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Hardcoded responses - no backend calls
    const englishResponses: { [key: string]: string } = {
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

    const odiaResponses: { [key: string]: string } = {
      "ଆଜି କେତେ ଶୁଣାଣି ନିର୍ଧାରିତ ହୋଇଛି?":
        "ବର୍ତ୍ତମାନ କାର୍ଯ୍ୟସୂଚୀ ଅନୁଯାୟୀ, ଆଜି **୫ଟି ଶୁଣାଣି ନିର୍ଧାରିତ ହୋଇଛି**:\n\n" +
        "୧. ମାମଲା CR/001/2025 - ସକାଳ ୧୦:୦୦ରେ ଜିଲ୍ଲା କୋର୍ଟ ହଲ ୧\n" +
        "୨. ମାମଲା CR/045/2025 - ସକାଳ ୧୧:୩୦ରେ ଜିଲ୍ଲା କୋର୍ଟ ହଲ ୨\n" +
        "୩. ମାମଲା CR/089/2025 - ଅପରାହ୍ନ ୦୨:୦୦ରେ ହାଇକୋର୍ଟ\n" +
        "୪. ମାମଲା CR/102/2025 - ଅପରାହ୍ନ ୦୨:୩୦ରେ ଜିଲ୍ଲା କୋର୍ଟ ହଲ ୧\n" +
        "୫. ମାମଲା CR/156/2025 - ଅପରାହ୍ନ ୦୪:୦୦ରେ ଜିଲ୍ଲା କୋର୍ଟ ହଲ ୩\n\n" +
        "ସମସ୍ତ ଅନୁସନ୍ଧାନକାରୀ ଅଧିକାରୀ ଏବଂ ସାକ୍ଷୀମାନଙ୍କୁ ସୂଚିତ କରାଯାଇଛି |",
      
      "କମ୍ ଉପସ୍ଥିତି ଥିବା ଅଧିକାରୀମାନଙ୍କୁ ଦେଖାନ୍ତୁ":
        "ଏଠାରେ ୭୫% ରୁ କମ୍ ଉପସ୍ଥିତି ଥିବା ଅନୁସନ୍ଧାନକାରୀ ଅଧିକାରୀମାନେ:\n\n" +
        "📊 **କମ୍ ଉପସ୍ଥିତି ଅଧିକାରୀ:**\n\n" +
        "୧. **SI ରାଜେଶ କୁମାର** (ବ୍ୟାଜ: IO-1234)\n" +
        "   - ଉପସ୍ଥିତି ହାର: ୬୮%\n" +
        "   - ଅନୁପସ୍ଥିତ ଦିନ: ୩୮ଟି ଶୁଣାଣିରୁ ୧୨ଟି\n" +
        "   - ନିର୍ଦ୍ଦିଷ୍ଟ ମାମଲା: ୮ଟି ସକ୍ରିୟ ମାମଲା\n\n" +
        "୨. **ASI ପ୍ରଦୀପ ମହାନ୍ତି** (ବ୍ୟାଜ: IO-2567)\n" +
        "   - ଉପସ୍ଥିତି ହାର: ୭୧%\n" +
        "   - ଅନୁପସ୍ଥିତ ଦିନ: ୩୧ଟି ଶୁଣାଣିରୁ ୯ଟି\n" +
        "   - ନିର୍ଦ୍ଦିଷ୍ଟ ମାମଲା: ୬ଟି ସକ୍ରିୟ ମାମଲା\n\n" +
        "୩. **HC ସୁରେଶ ପଣ୍ଡା** (ବ୍ୟାଜ: IO-3891)\n" +
        "   - ଉପସ୍ଥିତି ହାର: ୬୫%\n" +
        "   - ଅନୁପସ୍ଥିତ ଦିନ: ୪୦ଟି ଶୁଣାଣିରୁ ୧୪ଟି\n" +
        "   - ନିର୍ଦ୍ଦିଷ୍ଟ ମାମଲା: ୧୦ଟି ସକ୍ରିୟ ମାମଲା\n\n" +
        "⚠️ **ସୁପାରିଶ:** ଉପସ୍ଥିତି ସମସ୍ୟା ସମାଧାନ ପାଇଁ ଏହି ଅଧିକାରୀମାନଙ୍କ ସହିତ ବୈଠକ କରନ୍ତୁ |",
      
      "ସମସ୍ତ ବିଚାରାଧୀନ ମାମଲା ତାଲିକା କରନ୍ତୁ":
        "ଏଠାରେ ସମସ୍ତ ବର୍ତ୍ତମାନ ବିଚାରାଧୀନ ମାମଲା:\n\n" +
        "📋 **ବିଚାରାଧୀନ ମାମଲା (ମୋଟ ୨୮):**\n\n" +
        "**ଉଚ୍ଚ ପ୍ରାଥମିକତା:**\n" +
        "• CR/001/2025 - ଚୋରି (IPC 379) - ପରବର୍ତ୍ତୀ ଶୁଣାଣି: ଆଜି\n" +
        "• CR/045/2025 - ଆକ୍ରମଣ (IPC 323, 324) - ପରବର୍ତ୍ତୀ ଶୁଣାଣି: ଆଜି\n" +
        "• CR/089/2025 - ଜାଲିଆତି (IPC 420) - ପରବର୍ତ୍ତୀ ଶୁଣାଣି: ଆଜି\n\n" +
        "**ମଧ୍ୟମ ପ୍ରାଥମିକତା:**\n" +
        "• CR/102/2025 - ଭଙ୍ଗାରୁଜା (IPC 427) - ପରବର୍ତ୍ତୀ ଶୁଣାଣି: ନଭେମ୍ବର ୧୨\n" +
        "• CR/156/2025 - ଅନଧିକାର ପ୍ରବେଶ (IPC 441) - ପରବର୍ତ୍ତୀ ଶୁଣାଣି: ନଭେମ୍ବର ୧୫\n" +
        "• CR/178/2025 - ପ୍ରତାରଣା (IPC 415) - ପରବର୍ତ୍ତୀ ଶୁଣାଣି: ନଭେମ୍ବର ୧୮\n\n" +
        "**ଆଗାମୀ:**\n" +
        "• ପରବର୍ତ୍ତୀ ୩୦ ଦିନ ପାଇଁ ନିର୍ଧାରିତ ୨୨ଟି ଅତିରିକ୍ତ ମାମଲା\n\n" +
        "ସମସ୍ତ ମାମଲା ବର୍ତ୍ତମାନ ସାକ୍ଷୀ ଚିହ୍ନଟ ସହିତ ଅନୁସନ୍ଧାନାଧୀନ |",
      
      "ମାମଲା CR/001/2025 ପାଇଁ ସାକ୍ଷୀମାନେ କିଏ?":
        "**ମାମଲା ବିବରଣୀ: CR/001/2025**\n" +
        "FIR ନମ୍ବର: 001/2025\n" +
        "ପ୍ରକାର: ଚୋରି\n" +
        "ଧାରା: IPC 379, 411\n" +
        "ପୋଲିସ ଷ୍ଟେସନ: ଭୁବନେଶ୍ୱର କ୍ୟାପିଟାଲ PS\n\n" +
        "**ସାକ୍ଷୀମାନେ (ମୋଟ ୪):**\n\n" +
        "୧. **ରମେଶ ସାହୁ**\n" +
        "   - ଭୂମିକା: ପ୍ରତ୍ୟକ୍ଷଦର୍ଶୀ\n" +
        "   - ଫୋନ୍: +91 9876543210\n" +
        "   - ଉପସ୍ଥିତି: ୧୦୦% (ସମସ୍ତ ୩ଟି ଶୁଣାଣିରେ ଉପସ୍ଥିତ)\n" +
        "   - ସ୍ଥିତି: ✅ ସକ୍ରିୟ ଏବଂ ସହଯୋଗୀ\n\n" +
        "୨. **ସୀତା ପଟେଲ**\n" +
        "   - ଭୂମିକା: ଅଭିଯୋଗକାରୀ\n" +
        "   - ଫୋନ୍: +91 9876543211\n" +
        "   - ଉପସ୍ଥିତି: ୧୦୦% (ସମସ୍ତ ୩ଟି ଶୁଣାଣିରେ ଉପସ୍ଥିତ)\n" +
        "   - ସ୍ଥିତି: ✅ ସକ୍ରିୟ ଏବଂ ସହଯୋଗୀ\n\n" +
        "୩. **ବିଶ୍ୱଜିତ ଜେନା**\n" +
        "   - ଭୂମିକା: ଟେକ୍ନିକାଲ ବିଶେଷଜ୍ଞ\n" +
        "   - ଫୋନ୍: +91 9876543212\n" +
        "   - ଉପସ୍ଥିତି: ୬୭% (୩ଟିରୁ ୨ଟି ଶୁଣାଣିରେ ଉପସ୍ଥିତ)\n" +
        "   - ସ୍ଥିତି: ⚠️ ଗୋଟିଏ ଅନୁପସ୍ଥିତି ରେକର୍ଡ\n\n" +
        "୪. **ଡକ୍ଟର ଅଶୋକ କୁମାର**\n" +
        "   - ଭୂମିକା: ଫରେନସିକ ବିଶେଷଜ୍ଞ\n" +
        "   - ଫୋନ୍: +91 9876543213\n" +
        "   - ଉପସ୍ଥିତି: ୧୦୦% (ସମସ୍ତ ୩ଟି ଶୁଣାଣିରେ ଉପସ୍ଥିତ)\n" +
        "   - ସ୍ଥିତି: ✅ ସକ୍ରିୟ ଏବଂ ସହଯୋଗୀ\n\n" +
        "**ଅନୁସନ୍ଧାନକାରୀ ଅଧିକାରୀ:** SI ମନୋଜ ପ୍ରଧାନ (ବ୍ୟାଜ: IO-5678)"
    };

    const responses = language === "english" ? englishResponses : odiaResponses;

    // Check for exact match first
    let responseText = responses[userQuery];

    // If no exact match, provide a generic helpful response
    if (!responseText) {
      // Check for keywords in the query
      const lowerQuery = userQuery.toLowerCase();
      
      if (lowerQuery.includes("hearing") && (lowerQuery.includes("today") || lowerQuery.includes("scheduled"))) {
        responseText = responses["How many hearings are scheduled today?"];
      } else if (lowerQuery.includes("officer") && (lowerQuery.includes("low") || lowerQuery.includes("attendance") || lowerQuery.includes("absent"))) {
        responseText = responses["Show me officers with low attendance"];
      } else if (lowerQuery.includes("case") && (lowerQuery.includes("pending") || lowerQuery.includes("list") || lowerQuery.includes("all"))) {
        responseText = responses["List all pending cases"];
      } else if (lowerQuery.includes("witness") && lowerQuery.includes("cr/001/2025")) {
        responseText = responses["Who are the witnesses for case CR/001/2025?"];
      } else {
        // Generic response for other queries
        if (language === "english") {
          responseText = 
            "I can help you with the following information:\n\n" +
            "📅 **Hearings:** Ask about today's hearings or upcoming schedules\n" +
            "👮 **Officers:** Get information about officer attendance and assignments\n" +
            "📋 **Cases:** View all pending cases and their status\n" +
            "👥 **Witnesses:** Check witness details for specific cases\n\n" +
            "Try asking one of the quick questions above, or rephrase your question!";
        } else {
          responseText = 
            "ମୁଁ ନିମ୍ନଲିଖିତ ସୂଚନା ସହିତ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି:\n\n" +
            "📅 **ଶୁଣାଣି:** ଆଜିର ଶୁଣାଣି କିମ୍ବା ଆଗାମୀ କାର୍ଯ୍ୟସୂଚୀ ବିଷୟରେ ପଚାରନ୍ତୁ\n" +
            "👮 **ଅଧିକାରୀ:** ଅଧିକାରୀଙ୍କ ଉପସ୍ଥିତି ଏବଂ କାର୍ଯ୍ୟ ବିଷୟରେ ସୂଚନା ପାଆନ୍ତୁ\n" +
            "📋 **ମାମଲା:** ସମସ୍ତ ବିଚାରାଧୀନ ମାମଲା ଏବଂ ସେମାନଙ୍କର ସ୍ଥିତି ଦେଖନ୍ତୁ\n" +
            "👥 **ସାକ୍ଷୀ:** ନିର୍ଦ୍ଦିଷ୍ଟ ମାମଲା ପାଇଁ ସାକ୍ଷୀ ବିବରଣୀ ଯାଞ୍ଚ କରନ୍ତୁ\n\n" +
            "ଉପରୋକ୍ତ ଦ୍ରୁତ ପ୍ରଶ୍ନଗୁଡ଼ିକ ମଧ୍ୟରୁ ଗୋଟିଏ ପଚାରିବାକୁ ଚେଷ୍ଟା କରନ୍ତୁ, କିମ୍ବା ଆପଣଙ୍କ ପ୍ରଶ୍ନକୁ ପୁନର୍ବାର ଲେଖନ୍ତୁ!";
        }
      }
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    
    // Mark this question as answered if it was one of the quick questions
    const allQuickQuestions = [
      "How many hearings are scheduled today?",
      "Show me officers with low attendance",
      "List all pending cases",
      "Who are the witnesses for case CR/001/2025?",
      "ଆଜି କେତେ ଶୁଣାଣି ନିର୍ଧାରିତ ହୋଇଛି?",
      "କମ୍ ଉପସ୍ଥିତି ଥିବା ଅଧିକାରୀମାନଙ୍କୁ ଦେଖାନ୍ତୁ",
      "ସମସ୍ତ ବିଚାରାଧୀନ ମାମଲା ତାଲିକା କରନ୍ତୁ",
      "ମାମଲା CR/001/2025 ପାଇଁ ସାକ୍ଷୀମାନେ କିଏ?",
    ];
    
    if (allQuickQuestions.includes(userQuery) && !answeredQuestions.includes(userQuery)) {
      setAnsweredQuestions((prev) => [...prev, userQuery]);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allQuickQuestions = language === "english" 
    ? [
        "How many hearings are scheduled today?",
        "Show me officers with low attendance",
        "List all pending cases",
        "Who are the witnesses for case CR/001/2025?",
      ]
    : [
        "ଆଜି କେତେ ଶୁଣାଣି ନିର୍ଧାରିତ ହୋଇଛି?",
        "କମ୍ ଉପସ୍ଥିତି ଥିବା ଅଧିକାରୀମାନଙ୍କୁ ଦେଖାନ୍ତୁ",
        "ସମସ୍ତ ବିଚାରାଧୀନ ମାମଲା ତାଲିକା କରନ୍ତୁ",
        "ମାମଲା CR/001/2025 ପାଇଁ ସାକ୍ଷୀମାନେ କିଏ?",
      ];

  // Filter out answered questions
  const quickQuestions = allQuickQuestions.filter(
    (question) => !answeredQuestions.includes(question)
  );

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col shadow-2xl">
      <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-accent/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "english" ? "AI Assistant" : "AI ସହାୟକ"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {language === "english" ? "Powered by Gemini AI" : "Gemini AI ଦ୍ୱାରା ଚାଳିତ"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={language === "english" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setLanguage("english")}
              >
                English
              </Button>
              <Button
                variant={language === "odia" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setLanguage("odia")}
              >
                ଓଡିଆ
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {language === "english" ? "Thinking..." : "ଚିନ୍ତା କରୁଛି..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions - Show remaining unanswered questions */}
        {quickQuestions.length > 0 && (
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">
              {language === "english" 
                ? `Quick questions (${quickQuestions.length} remaining):`
                : `ଦ୍ରୁତ ପ୍ରଶ୍ନ (${quickQuestions.length} ବାକି ଅଛି):`
              }
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                language === "english"
                  ? "Ask me anything about cases, officers, or witnesses..."
                  : "ମାମଲା, ଅଧିକାରୀ, କିମ୍ବା ସାକ୍ଷୀମାନଙ୍କ ବିଷୟରେ ମୋତେ କିଛି ପଚାରନ୍ତୁ..."
              }
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;
