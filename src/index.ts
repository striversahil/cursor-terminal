import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv"
import readline from "readline-sync"
// Load environment variables from .env file
config()


const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
})

const systemMessage = `
You are a helpful assistant that can answer questions about the Google Gemini API and how to use it in JavaScript applications. Provide clear and concise explanations, examples, and best practices for using the API effectively.

`
const History : { role : string , parts : { text : string }[] }[] = []


const runAgent = async (message: string) => {
    let responseText = ""

    try {
        const response = await genai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: History,
            config: {
                systemInstruction: systemMessage,
                maxOutputTokens: 1000,
            }
        })
        
        for await (const chunk of response) {
            if (chunk.text) {
                responseText += chunk.text
                console.log(chunk.text)
            }
        }
        return responseText

    } catch (error) {
        console.error("Error sending message to Google GenAI:", error)
    }
}




async function main() {
    const message = readline.question("Enter your Query to Google GenAI: \n")
    if (message.toLocaleLowerCase() === "exit" || message.toLocaleLowerCase() === "quit") {
        console.log("Exiting the conversation. Goodbye! 👋 \n")
        // sleep for 1 second before exiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        return
    }

    try {
        History.push({
            role: "user",
            parts: [{ text: message }]
        })

        const response = await runAgent(message)
        if (response) {
            History.push({
                role: "assistant",
                parts: [{ text: response }]
            })
        } else {
            console.log("No response received from Google GenAI.")
        }

        main() // Call main again to continue the conversation
    } catch (error) {
        console.error("Error sending message to Google GenAI:", error)
    }
}

main()