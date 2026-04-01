ARIA — Personal AI Agent 🤖
A powerful personal AI assistant that runs natively on your computer with full system access — powered by Claude AI.

✨ What ARIA Can Do
CapabilityExamples🌐 Open websites"Open YouTube", "Go to GitHub", "Open Google Maps"🚀 Launch apps"Open VS Code", "Launch Spotify", "Start WhatsApp"📁 Browse files"Show my Downloads", "List files on Desktop"🔍 Find files"Find all PDF files", "Search for my resume"📖 Read & create files"Read my notes.txt", "Create a todo list"⚙️ System info"How much RAM am I using?", "Show CPU info"⚡ Run commands"What's my IP?", "Check Node version"

🚀 Setup (3 steps)
1. Install dependencies
bashcd personal-ai-agent
npm install
2. Add your API key
bashcp .env.example .env
Open .env and replace sk-ant-your-key-here with your actual key from console.anthropic.com.
3. Run ARIA
bashnpm start

📁 File Structure
personal-ai-agent/
├── main.js              # Electron main process (window, IPC)
├── preload.js           # Secure IPC bridge
├── package.json         # Dependencies
├── .env                 # Your API key (create from .env.example)
├── .env.example         # Template for .env
│
├── renderer/            # Frontend UI
│   ├── index.html       # Main window HTML
│   ├── styles.css       # All styles + animations
│   └── app.js           # UI logic & chat flow
│
└── src/                 # Backend logic
    ├── ai.js            # Claude API integration + tool use
    ├── system.js        # System operations (open apps, files, URLs)
    └── tools.js         # Tool definitions for Claude

🎨 Interface

Custom titlebar with window controls
Animated neural network background
Sidebar with quick-action buttons
Glassmorphism chat bubbles with smooth animations
Tool chip indicators showing what ARIA is doing
Auto-resize text input
Space/neural dark theme with electric blue accents


🔧 Supported Apps
ARIA knows how to open 40+ apps including:
Editors: VS Code, Sublime Text, Vim, Notepad
Browsers: Chrome, Firefox, Edge, Safari, Brave
Communication: WhatsApp, Discord, Slack, Telegram, Zoom, Teams
Media: Spotify, VLC, iTunes
Productivity: Word, Excel, PowerPoint, Notion, Obsidian
Dev Tools: Terminal, Git, Postman, Docker
System: Calculator, File Explorer, Task Manager, Settings
For any app not in the list, ARIA will try to launch it by name automatically.

💡 Tips

Type naturally — ARIA understands intent, not commands
Chain actions: "Open YouTube and search for lo-fi music"
Use quick-action buttons in the sidebar for common tasks
Enter sends, Shift+Enter adds a new line


🔑 Getting an API Key

Go to console.anthropic.com
Sign up / log in
Go to API Keys → Create new key
Paste it in your .env file


⚠️ Safety
ARIA blocks dangerous shell commands (rm -rf, format, shutdown, etc.) automatically. It only uses the tools when you ask it to, and always tells you what it's doing with the tool chip indicators.


