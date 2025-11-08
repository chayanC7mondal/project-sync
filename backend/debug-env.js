// Debug environment variables
import dotenv from "dotenv";

dotenv.config();

console.log("Environment variables loaded:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("JWT_KEY:", process.env.JWT_KEY ? "SET" : "NOT SET");
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);

console.log("\nAll loaded env vars:", Object.keys(process.env).filter(key => 
  key.includes('MONGO') || key.includes('PORT') || key.includes('JWT') || key.includes('CORS')
));