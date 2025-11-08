// Test with the new .env file
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

console.log("Testing with .env.test:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("JWT_KEY:", process.env.JWT_KEY ? "SET" : "NOT SET");
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);

if (process.env.MONGO_URI) {
  console.log("\n✅ Environment variables loaded successfully!");
  console.log("MONGO_URI:", process.env.MONGO_URI.substring(0, 30) + "...");
} else {
  console.log("\n❌ Failed to load environment variables");
}
