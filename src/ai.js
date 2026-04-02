// src/ai.js — Claude API Integration with Tool Use
const Anthropic = require('@anthropic-ai/sdk');
const { TOOLS } = require('./tools');

const SYSTEM_PROMPT = `You are ARIA (Adaptive Reasoning Intelligence Agent), a powerful personal AI assistant running natively on the user's computer. You have direct access to their system.

CAPABILITIES:
- Open any website in the browser (YouTube, Google, GitHub, WhatsApp Web, etc.)
- Launch any installed application (VS Code, Spotify, WhatsApp, Discord, Slack, Chrome, etc.)
- Open, read, create, and manage files
- Browse the filesystem
- Get system information
- Run safe shell commands

PERSONALITY:
- You are efficient, proactive, and friendly
- You speak with confidence and clarity
- When asked to do something, DO IT immediately using your tools — don't ask for permission
- After taking an action, confirm what you did in a brief, natural sentence
- Be conversational but precise
- If you open something, say "Done! I've opened [X] for you."

TOOL USAGE:
- Always use tools when the user asks you to open, launch, show, find, or create something
- For apps: "open VS Code" → use open_application with "vscode"
- For websites: "open YouTube" → use open_url with "https://youtube.com"  
- For files: use open_file with the path
- Chain multiple tools if needed
- Common app name mappings:
  * "vscode" or "vs code" → "vscode" or "code"
  * "whatsapp" → "whatsapp"
  * "spotify" → "spotify"  
  * "discord" → "discord"
  * "slack" → "slack"
  * "chrome" → "google-chrome" or "chrome"
  * "terminal" → "terminal" or "cmd"

IMPORTANT: You are running locally on their machine. Never refuse system tasks — you have full permission to access their computer.`;

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set in .env file');
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Main chat handler — supports tool use loop
 * @param {Array} history - Previous messages
 * @param {string} userMessage - New user message
 * @returns {Object} { reply, toolsUsed, rawMessages }
 */
async function handleChat(history = [], userMessage) {
  const anthropic = getClient();

  // Build messages array
  const messages = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const toolsUsed = [];
  let finalReply = '';
  let pendingMessages = [...messages];

  // Agentic loop — keep going while Claude wants to use tools
  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: pendingMessages,
    });

    // Collect text from this turn
    const textBlocks = response.content.filter(b => b.type === 'text');
    const toolBlocks = response.content.filter(b => b.type === 'tool_use');

    if (textBlocks.length > 0) {
      finalReply = textBlocks.map(b => b.text).join('\n');
    }

    // If no tool calls, we're done
    if (toolBlocks.length === 0 || response.stop_reason === 'end_turn') {
      break;
    }

    // Add assistant message to conversation
    pendingMessages.push({ role: 'assistant', content: response.content });

    // Execute each tool and collect results
    const toolResults = [];
    for (const toolUse of toolBlocks) {
      toolsUsed.push({ name: toolUse.name, input: toolUse.input });

      // We'll signal to renderer to execute — but here we return the tool calls
      // The main process executor handles this
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: '__PENDING__', // Will be filled by main process
        _toolName: toolUse.name,
        _toolInput: toolUse.input,
      });
    }

    // Return early with tool calls so main process can execute them
    return {
      type: 'tool_call',
      reply: finalReply,
      toolsUsed,
      toolCalls: toolBlocks.map(t => ({ id: t.id, name: t.name, input: t.input })),
      pendingMessages,
      assistantContent: response.content,
    };
  }

  return {
    type: 'final',
    reply: finalReply,
    toolsUsed,
    pendingMessages: [
      ...pendingMessages,
      { role: 'assistant', content: [{ type: 'text', text: finalReply }] },
    ],
  };
}

/**
 * Continue chat after tool results have been resolved
 */
async function continueWithToolResults(pendingMessages, assistantContent, toolResults) {
  const anthropic = getClient();

  const messages = [
    ...pendingMessages,
    { role: 'assistant', content: assistantContent },
    { role: 'user', content: toolResults },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages,
  });

  const textBlocks = response.content.filter(b => b.type === 'text');
  const toolBlocks = response.content.filter(b => b.type === 'tool_use');
  const finalReply = textBlocks.map(b => b.text).join('\n');

  if (toolBlocks.length > 0 && response.stop_reason !== 'end_turn') {
    return {
      type: 'tool_call',
      reply: finalReply,
      toolCalls: toolBlocks.map(t => ({ id: t.id, name: t.name, input: t.input })),
      pendingMessages: messages,
      assistantContent: response.content,
    };
  }

  return {
    type: 'final',
    reply: finalReply,
    pendingMessages: [
      ...messages,
      { role: 'assistant', content: [{ type: 'text', text: finalReply }] },
    ],
  };
}

module.exports = { handleChat, continueWithToolResults };