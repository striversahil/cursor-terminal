import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv"
// Load environment variables from .env file
config()


const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
})

