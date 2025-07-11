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
You are an Website builder expert. You have to create the website by analysing the user Input.
Note : Website should be completely functional with HTML , CSS, and JavaScript.
        You have access of tool, which can run or execute any shell or terminal command.

        Tone : Friendly, Professional, and Helpful and use emojis to make it more engaging.
        
        Current user operation system is: ${platform()}
        Give command to the user according to its operating system support.

If operating system is Linux or MacOS, you can use the following shell commands:
- YOU MUST use single quotes around 'EOF' to prevent shell expansion of characters like '$'.
- **Correct Example:**
  cat << 'EOF' > my-project/index.html
  <!DOCTYPE html>
  <html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
  </html>
  EOF
        
        <-- What is your job -->
        1: Analyse the user query to see what type of website the want to build
        2: Give them command one by one , step by step
        

        Note : I have created "generated" directory . Always make directory inside generated folder. example : for making a calculator website folder use mkdir "generated/calculator" instead of mkdir "calculator"

        <-- What are different tools you have -->
        1: Use executeCommand to execute the shell command. The command can be any valid shell command that the user can run in their terminal.
        2: Use unsplashImage to fetch an image from Unsplash based on the requirement of the project add it in html file. The query can be any string that describes the image you want to fetch, like "nature", "city", "technology", etc.

        // Now you can give them command in following below

        0: Check if the user has already created a folder for the website, if not then create a folder for the website.
        1: First create a folder, Ex: mkdir "generated/calculator"
        2: Inside the folder, create index.html , style.css , script.js . Ex: touch "generated/calculator/index.html" "generated/calculator/style.css" "generated/calculator/script.js"
        4: Then write a code in html file , Ex : echo "<!DOCTYPE html> <html> <head> <title>Calculator</title> <link rel='stylesheet' href='style.css'> </head> <body> <h1>Calculator</h1> <script src='script.js'></script> </body> </html>" > "generated/calculator/index.html"
        5: If required of image in html file use the unsplashImage tool to fetch an image and it at relevant place in the HTML file.
        6: Then write a code in css file , Ex : echo "body { font-family: Arial, sans-serif; } h1 { color: #333; }" > "generated/calculator/style.css"
        : Then write a code in js file , Ex : echo "console.log('Calculator loaded');" > "generated/calculator/script.js"


    <-- Final Steps -->
        
        7: If the user asks for any additional features, you can add them in the respective files. Example : If the user asks for a dark mode feature, you can add a toggle button in the HTML file, write the necessary CSS for dark mode in the CSS file, and write the JavaScript code to toggle dark mode in the JS file.

        

`
const History: { role: string, parts: ({ text: string } | { functionCall: any } | { functionResponse : any})[] }[] = []


const welcomeMessage = `
Welcome to the Google GenAI Terminal Agent! 🤖👋

You can ask me to build a website by providing the details, and I will guide you through the process step by step.
Type your query below and I will respond with the necessary commands to execute in your terminal.
Type "exit" or "quit" to end the conversation.
................................................................................................................................................................................
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



const unsplashImage = async ({ query }: { query: string }) => {
    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}`, {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || ""}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            return {
                status: "success",
                imageurl : data.results || "",
            }
        } else {
            // console.error("Error fetching image from Unsplash:", data)
            return {
                status: "error",
                message: data.errors ? data.errors.join(", ") : "Failed to fetch image."
            }
        }
    } catch (error) {
        // console.error("Error fetching image from Unsplash:", error)
        return {
            status: "error",
            message: "Error occurred while fetching image."
        }
    }
}


const UnsplashImageDescription = {
    name: "unsplashImage",
    description: "Fetches an image from Unsplash based on the provided query.",
    parameters: {
        type: "OBJECT",
        properties: {
            query: {
                type: "STRING",
                description: "The search query for the image. ex: 'nature', 'city', 'technology'."
            }
        },
        required: ["query"]
    }
};


const AvailableTools : Record<string , any> = {
    "executeCommand": executeCommand,
    "unsplashImage": unsplashImage
}




const runAgent = async () => {
    try {
        console.log("\n AI is thinking...⚙️")
        const response = await genai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: History,
            config: {
                systemInstruction: systemMessage,
                maxOutputTokens: 1000,
                tools: [{ functionDeclarations: [ExecuteCommandDescription as any , UnsplashImageDescription as any] }],
            }
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0]
            console.log("\nGoogle GenAI Function Call: ", functionCall)
            const tool = functionCall.name ? AvailableTools[functionCall.name] : undefined
            if (tool) {

                // Getting the result of the tool function call with arguments
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

    const message = readline.question(">>>  ").trim()
    if (message.toLocaleLowerCase() === "exit" || message.toLocaleLowerCase() === "quit") {
        console.log(`Thank you for using the Google GenAI Terminal Agent! Goodbye! 👋`)
        // sleep for 500 milliseconds before exiting
        await new Promise(resolve => setTimeout(resolve, 500))
        return
    }

    try {

        // Push the user message to the history
        History.push({
            role: "user",
            parts: [{ text: message }]
        })

        const response = await runAgent()

        // Putting last response to the history
        History.push({
            role: "model",
            parts: [{ text: response! }]
        })
        console.log("[Agent] : ", response)
        console.log("\n") // Add some space for better readability

        main() // Call main again to continue the conversation
    } catch (error) {
        console.error("Error sending message to Google GenAI:", error)
    }
}

main()