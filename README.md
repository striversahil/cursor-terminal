# Cursor Terminal 

Cursor Terminal is an AI-powered website builder that allows you to create websites using natural language commands. It is designed to help developers and non-developers alike to quickly prototype and build websites without needing to write extensive code.


## Features
- **AI-Powered**: Use natural language commands to build websites.
- **Real-Time Collaboration**: Work with your team in real-time.
- **Customizable**: Using follow up questions, you can customize the website to your needs.


## Getting Started
To get started with Cursor Terminal, follow these steps:
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/striversahil/cursor-terminal.git
   ```
2. **Install Dependencies**:
   ```bash
   cd cursor-terminal
   npm install
   ```
4. **Add Your GEMINI and Unsplash API Key**:
   - Copy the `.env.example` file to `.env` and add your API keys.
   ```bash
   cp .env.example .env
   ```
   - Open `.env` and add your GEMINI and Unsplash API keys:
   ```env
   GEMINI_MODEL= your_gemini_model # e.g., gemini-2.5-flash
   GEMINI_API_KEY=your_gemini_api_key
   UNSPLASH_API_KEY=your_unsplash_api_key
   ```
   - If you don't have these keys, you can sign up for them on the respective platforms:
     - [GEMINI API](https://cloud.google.com/gemini)
     - [Unsplash API](https://unsplash.com/developers)
6. **Run the Application**:
   ```bash
   npm run script
   ```
   This will open a terminal window where you can interact with the Cursor AI Agent and start building your web application.🚀

## Usage
Once the application is running, you can start interacting with the AI Agent. Here are some example commands you can use:
- **Create a new website**: "Create a website for my portfolio"
- **Add a feature**: "Add a contact form to the website"
- **Change the design**: "Make the website more visually appealing"
- **Get help**: "Help me with building a website"

- **Exit the application**: "exit" or "quit" inside the terminal.

- **Note** : All generated files will be stored in the `generated` directory. You can view and edit these files as needed.

## Contributing
We welcome contributions to Cursor Terminal! If you have suggestions or improvements, please open an issue or submit a pull request. For major changes, please open an issue first to discuss what you would like to change.
