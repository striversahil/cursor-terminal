import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv"
import readline from "readline-sync"
import { exec } from "child_process"
import { platform } from "os"
// Load environment variables from .env file
config()


const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
})

const systemMessage = `
You are an Website builder expert. You have to create the frontend of the website by analysing the user Input.
        You have access of tool, which can run or execute any shell or terminal command.
        
        Current user operation system is: ${platform()}
        Give command to the user according to its operating system support.


        <-- What is your job -->
        1: Analyse the user query to see what type of website the want to build
        2: Give them command one by one , step by step
        3: Use available tool executeCommand

        // Now you can give them command in following below
        1: First create a folder, Ex: mkdir "calulator"
        2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
        3: Then create style.css same as above
        4: Then create script.js
        5: Then write a code in html file

        You have to provide the terminal or shell command to user, they will directly execute it

        

`
const History: { role: string, parts: ({ text: string } | { functionCall: any } | { functionResponse : any})[] }[] = []


const welcomeMessage = `Welcome to the Google GenAI Chat Interface! 🤖
Type 'exit' or 'quit' to end the conversation.
You can ask me to build a website, write HTML, CSS, or JavaScript code. 🌈
Type your message below:\n
`

// Function to execute shell commands

const executeCommand = ({ command }: { command: string }): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`)
      } else if (stderr) {
        reject(`Stderr: ${stderr}`)
      } else {
        resolve(`Success: ${stdout}`)
      }
    })
  })
}

const ExecuteCommandDescription = {
    name: "executeCommand",
    description: "Executes a shell command and returns the output. A command can be any valid shell command that the user can run in their terminal.",
    parameters: {
        type: "OBJECT",
        properties: {
            command: {
                type: "STRING",
                description: "The shell command to execute. ex: 'mkdir My Folder' or 'touch my-file.txt'. Make sure to use the correct command for your operating system."
            }
        },
        required: ["command"]
    }
}


const AvailableTools : Record<string , any> = {
    "executeCommand": executeCommand
}




const runAgent = async () => {
    try {
        console.log("\nGoogle GenAI is thinking...")
        const response = await genai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: History,
            config: {
                systemInstruction: systemMessage,
                maxOutputTokens: 1000,
                tools: [{ functionDeclarations: [ExecuteCommandDescription as any] }],
            }
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0]
            console.log("\nGoogle GenAI Function Call: ", functionCall)
            const tool = functionCall.name ? AvailableTools[functionCall.name] : undefined
            if (tool) {
                const result = await tool(functionCall.args)

                const toolResult = {
                    name: functionCall.name,
                    response: {
                        result: result
                    }
                }
                // Push the tool Selection to the history
                History.push({
                    role: "model",
                    parts: [{ functionCall: response.functionCalls[0] }]
                })

                // Push the tool result to the history
                History.push({
                    role: "user",
                    parts: [{ functionResponse: toolResult }]
                })
                
                return await runAgent() // Call runAgent again and return its result
            }
        } else {
            const responseText = response?.text || "No response received from Google GenAI."
            return responseText // Return the text response
        }
    } catch (error) {
        console.error("Error sending message to Google GenAI:", error)
        return "Error occurred while processing your request."
    }
}



//                      +++++++++++++++++++++++++++++++++++++++++++++++  Main Program Execution +++++++++++++++++++++++++++++++++++++++++++++++
console.clear()
console.log(welcomeMessage)

async function main() {

    const message = readline.question("> ").trim()
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

        const response = await runAgent()

        History.push({
            role: "model",
            parts: [{ text: response! }]
        })
        console.log("\nGoogle GenAI Response: \n", response)
        

        main() // Call main again to continue the conversation
    } catch (error) {
        console.error("Error sending message to Google GenAI:", error)
    }
}

main()