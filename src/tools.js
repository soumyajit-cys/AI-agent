// src/tools.js — Tool definitions for Claude API

const TOOLS = [
  {
    name: 'open_url',
    description: 'Opens a URL in the default web browser. Use this to open websites like YouTube, Google, GitHub, WhatsApp Web, etc.',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The full URL to open (e.g., https://youtube.com)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'open_application',
    description: 'Opens a system application by name (e.g., VS Code, WhatsApp, Spotify, Calculator, Notepad, Chrome, Firefox, Slack, Discord, Terminal, File Explorer, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        app_name: {
          type: 'string',
          description: 'The name of the application to open (e.g., "vscode", "whatsapp", "spotify", "calculator")',
        },
      },
      required: ['app_name'],
    },
  },
  {
    name: 'open_file',
    description: 'Opens a specific file using the default application for that file type. Can open documents, images, videos, etc.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The absolute or relative path to the file to open',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'list_directory',
    description: 'Lists files and folders in a directory. Use to explore the filesystem.',
    input_schema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The directory path to list. Use "~" for home directory, "desktop" for desktop, "downloads" for downloads folder.',
        },
        show_hidden: {
          type: 'boolean',
          description: 'Whether to show hidden files (default: false)',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'search_files',
    description: 'Searches for files by name pattern in a directory',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The filename or pattern to search for',
        },
        directory: {
          type: 'string',
          description: 'The directory to search in (default: home directory)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_system_info',
    description: 'Gets information about the system: OS, CPU, memory, disk space, running processes, etc.',
    input_schema: {
      type: 'object',
      properties: {
        info_type: {
          type: 'string',
          enum: ['overview', 'memory', 'cpu', 'disk', 'processes', 'network'],
          description: 'Type of system information to retrieve',
        },
      },
      required: ['info_type'],
    },
  },
  {
    name: 'create_file',
    description: 'Creates a new text file with specified content at a given path',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path where the file should be created',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file',
        },
      },
      required: ['file_path', 'content'],
    },
  },
  {
    name: 'read_file',
    description: 'Reads the content of a text file',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path of the file to read',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'run_command',
    description: 'Runs a safe shell command and returns the output. Only use for safe, read-only commands like listing processes, checking versions, etc.',
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to run',
        },
      },
      required: ['command'],
    },
  },
];

module.exports = { TOOLS };