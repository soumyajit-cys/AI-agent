{
  "name": "personal-ai-agent",
  "version": "1.0.0",
  "description": "A personal AI agent with system access powered by Claude",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "NODE_ENV=development electron .",
    "build": "electron-builder"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "dotenv": "^16.4.5",
    "electron-store": "^8.2.0",
    "open": "^10.1.0"
  },
  "devDependencies": {
    "electron": "^30.0.0",
    "electron-builder": "^24.13.3"
  },
  "build": {
    "appId": "com.personal.ai-agent",
    "productName": "ARIA - Personal AI",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": "AppImage"
    }
  },
  "author": "You",
  "license": "MIT"
}