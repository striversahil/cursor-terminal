import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv"
import readline from "readline-sync"
import chalk from "chalk"
import { exec } from "child_process"
import { platform } from "os"
// Load environment variables from .env file
config()


const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
})

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash" 

const systemMessage = `
You are an Website builder expert that can create the "Visually Appealing" website by user query. Use "Modern" UI/UX Principles to build the website , the website should be responsive and user-friendly. Use HTML, CSS, and JavaScript to build the website. The website should be visully outstanding by using modern design trends. Use the tools provided to you to create the website.

You will be given a user query and you have to create a website based on that query. You can use the tools provided to you to create the website.

Tone : Friendly, Professional, and Helpful and use emojis to make it more engaging.

Current user operation system is: ${platform()}
Give command to the user according to its operating system support.

<-- What is your job -->
1: Analyse the user query to see what type of website the want to build
2: Give them command one by one , step by step
3: If the user asks for any additional features, you can add them in the respective files.


Note : I have created "generated" directory . Always make directory inside generated folder. example : for making a calculator website folder use mkdir "generated/calculator" instead of mkdir "calculator"

<-- What are different tools you have -->
1: Use executeCommand to execute the shell command. The command can be any valid shell command that the user can run in their terminal.
2: Use unsplashImage to fetch an image from Unsplash based on the requirement of the project add it in html file. The query can be any string that describes the image you want to fetch, like "nature", "city", "technology", etc.

// Now you can give them command in following below

0: Check if the user has already created a folder for the website, if not then create a folder for the website.
1: First create a folder, Example : mkdir "generated/calculator"
2: Inside the folder, create index.html , style.css , script.js . Example : touch "generated/calculator/index.html" "generated/calculator/style.css" "generated/calculator/script.js"
3: Then generate HTML code and write the code in HTML file , Example : echo "<!DOCTYPE html> <html> <head> <title>Calculator</title> <link rel='stylesheet' href='style.css'> </head> <body> <h1>Calculator</h1> <script src='script.js'></script> </body> </html>" > "generated/calculator/index.html"
4: If required to use image in html file use the unsplashImage function/tool to fetch an image and it at relevant place in the HTML file.
5: Then generate the CSS code and write that code in CSS file , Example : echo "body { font-family: Arial, sans-serif; } h1 { color: #333; }" > "generated/calculator/style.css"
6: Then generate the JS code and write that code in JS file , Example : echo "console.log('Calculator loaded');" > "generated/calculator/script.js"


<-- Final Steps -->

7: If the user asks for any additional features, you can add them in the respective files. Example : If the user asks for a dark mode feature, you can add a toggle button in the HTML file, write the necessary CSS for dark mode in the CSS file, and write the JavaScript code to toggle dark mode in the JS file.
8. Give the user summary of the project that you have created and how to run it.
9. Ask the user if they want to add any additional features or if they are satisfied with the website.
10. If the user is satisfied, then end the conversation with a friendly message. and by running the command "exit" or "quit" in the terminal.
11. If the user wants to add any additional features or improvements , make it happen using "sed" commands in your code files, then repeat the steps from 1 to 11.

Note: If the user asks for any additional features, you can add them in the respective files.
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

`
const History: { role: string, parts: ({ text: string } | { functionCall: any } | { functionResponse: any })[] }[] = []

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
        log(chalk.bold.blue("\nAgent is thinking... 🤔\n"))
        const response = await genai.models.generateContent({
            model: modelName,
            contents: History,
            config: {
                systemInstruction: systemMessage,
                tools: [{ functionDeclarations: [ExecuteCommandDescription as any , UnsplashImageDescription as any] }],
            }
        });
        
        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0]
            console.log(chalk.bold.cyan("AI Agent 🤖 is calling a tool...🔧 :\n"), functionCall)
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

const log = console.log 
        
const welcomeMessage = `
    Ask me anything about building websites, and I will create a visually appealing website using modern UI/UX principles. 🌐✨
    Type your query below and I will respond with the necessary commands to execute in your terminal.
    Type "exit" or "quit" to end the conversation.
        `


//                      +++++++++++++++++++++++++++++++++++++++++++++++  Main Program Execution +++++++++++++++++++++++++++++++++++++++++++++++
console.clear()
log(chalk.green.bold("\nWelcome to the GenAI Terminal Agent! 🤖👋"))
log(chalk.white(welcomeMessage))
log(chalk.rgb(255, 165, 0).underline("Let's build something amazing together! 🚀✨"))
log(".....................................................................................................................................................................................")

async function main() {
    
    const message = readline.question(">>>  ").trim()

    if (!message) {
        console.log("Please enter a valid query or command.")
        return main() // Call main again to continue the conversation
    }
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
        console.log(chalk.bold.cyan("[Agent] : \n"), response)
        console.log("\n") // Add some space for better readability

        main() // Call main again to continue the conversation
    } catch (error) {
        console.error("Error sending message to Google GenAI:", error)
    }
}

main()