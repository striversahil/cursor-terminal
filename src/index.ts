import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv"
// Load environment variables from .env file
config()


const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
})

const systemMessage = `
You are a helpful assistant that can answer questions about the Google Gemini API and how to use it in JavaScript applications. Provide clear and concise explanations, examples, and best practices for using the API effectively.
`




const chat = genai.chats.create({
    model: "gemini-2.5-flash",
    config: {
        systemInstruction: systemMessage,
    }
})


async function main() {
    try {
        const response = await chat.sendMessage({ message : "How are Your ?" })
        console.log("Response from Google GenAI:\n", response.text)
    } catch (error) {
        console.error("Error sending message to Google GenAI:", error)
    }
}
main()