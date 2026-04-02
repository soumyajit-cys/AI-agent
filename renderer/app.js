// renderer/app.js — Frontend Logic for ARIA

/* ─── Canvas Background Animation ─────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], lines = [];
  const NUM_PARTICLES = 60;
  const CONNECTION_DIST = 120;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '59,130,246' : Math.random() > 0.5 ? '6,182,212' : '139,92,246';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < NUM_PARTICLES; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
})();

/* ─── App State ────────────────────────────────────────── */
const state = {
  messages: [],        // Full conversation history for API
  isLoading: false,
  config: null,
};

/* ─── DOM References ───────────────────────────────────── */
const $ = id => document.getElementById(id);
const messagesEl    = $('messages');
const inputEl       = $('input');
const sendBtn       = $('send-btn');
const typingEl      = $('typing-indicator');
const typingLabel   = $('typing-label');
const statusDot     = document.querySelector('.status-dot');
const statusText    = $('status-text');
const welcomeEl     = $('welcome');
const apiModal      = $('api-modal');

/* ─── Window Controls ──────────────────────────────────── */
$('btn-minimize').addEventListener('click', () => window.ARIA.minimize());
$('btn-maximize').addEventListener('click', () => window.ARIA.maximize());
$('btn-close').addEventListener('click',    () => window.ARIA.close());

/* ─── Init ─────────────────────────────────────────────── */
async function init() {
  try {
    state.config = await window.ARIA.getConfig();
    const { hasApiKey, platform, username } = state.config;

    $('mini-os').textContent = `⊞ ${platform}`;
    $('mini-user').textContent = `◉ ${username}`;

    if (hasApiKey) {
      setStatus('ready', 'ARIA Ready');
    } else {
      setStatus('error', 'No API Key');
      apiModal.classList.remove('hidden');
    }
  } catch (e) {
    setStatus('error', 'Init error');
  }
}

function setStatus(type, text) {
  statusDot.className = `status-dot ${type}`;
  statusText.textContent = text;
}

/* ─── Quick Actions ────────────────────────────────────── */
document.querySelectorAll('.qa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.getAttribute('data-prompt');
    if (prompt && !state.isLoading) sendMessage(prompt);
  });
});

/* ─── Clear Chat ───────────────────────────────────────── */
$('clear-chat-btn').addEventListener('click', () => {
  state.messages = [];
  messagesEl.innerHTML = '';
  welcomeEl && messagesEl.appendChild(recreateWelcome());
});

function recreateWelcome() {
  const el = document.createElement('div');
  el.id = 'welcome';
  el.className = 'welcome-screen';
  el.innerHTML = `
    <div class="welcome-orb">
      <div class="orb-ring r1"></div>
      <div class="orb-ring r2"></div>
      <div class="orb-ring r3"></div>
      <div class="orb-core"><span>AI</span></div>
    </div>
    <h1 class="welcome-title">Hello, I'm <em>ARIA</em></h1>
    <p class="welcome-sub">Your personal AI agent — I can open apps, browse the web, manage files, and do much more on your computer.</p>
    <div class="welcome-hints">
      <span class="hint">"Open YouTube"</span>
      <span class="hint">"Launch VS Code"</span>
      <span class="hint">"Show my downloads"</span>
      <span class="hint">"Create a note"</span>
    </div>`;
  return el;
}

/* ─── Input Handling ───────────────────────────────────── */
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
sendBtn.addEventListener('click', handleSend);

// Auto-resize textarea
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
});

function handleSend() {
  const text = inputEl.value.trim();
  if (!text || state.isLoading) return;
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendMessage(text);
}

/* ─── Send Message ─────────────────────────────────────── */
async function sendMessage(text) {
  if (state.isLoading) return;

  // Hide welcome screen
  const welcome = $('welcome');
  if (welcome) welcome.remove();

  // Show user message
  appendMessage('user', text);
  setLoading(true, 'ARIA is thinking...');

  try {
    // Call AI
    let result = await window.ARIA.chat({
      messages: state.messages,
      userMessage: text,
    });

    if (!result.success) throw new Error(result.error || 'Unknown error');

    let data = result.data;

    // Handle tool-call loop
    while (data.type === 'tool_call') {
      // Show tool chips
      for (const tc of data.toolCalls) {
        setLoading(true, `Running: ${formatToolName(tc.name)}...`);
        showToolChip(tc.name, tc.input);
      }

      // Execute each tool
      const toolResults = [];
      for (const tc of data.toolCalls) {
        const execResult = await window.ARIA.executeTool({ toolName: tc.name, toolInput: tc.input });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tc.id,
          content: execResult.success ? execResult.result : `Error: ${execResult.error}`,
        });
      }

      // Continue conversation
      setLoading(true, 'ARIA is responding...');
      const contResult = await window.ARIA.chat({
        messages: [
          ...data.pendingMessages,
          { role: 'assistant', content: data.assistantContent },
          { role: 'user', content: toolResults },
        ],
        userMessage: '__continue__',
        _isContinuation: true,
      });

      if (!contResult.success) throw new Error(contResult.error);
      data = contResult.data;
    }

    // Final reply
    if (data.reply) {
      appendMessage('ai', data.reply);
    }

    // Update history
    if (data.pendingMessages) {
      state.messages = data.pendingMessages;
    }

  } catch (err) {
    appendMessage('ai', `⚠️ Error: ${err.message}`);
    setStatus('error', 'Error');
    setTimeout(() => setStatus('ready', 'ARIA Ready'), 3000);
  } finally {
    setLoading(false);
  }
}

/* ─── UI Helpers ───────────────────────────────────────── */
function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'user' ? 'U' : 'A';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = formatText(text);

  div.appendChild(avatar);
  div.appendChild(bubble);
  messagesEl.appendChild(div);
  scrollToBottom();
}

function showToolChip(toolName, toolInput) {
  // Find or create AI message for chips
  const chipWrapper = document.createElement('div');
  chipWrapper.className = 'message ai';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = 'A';

  const chip = document.createElement('div');
  chip.className = 'tool-chip';

  const icon = getToolIcon(toolName);
  const label = formatToolLabel(toolName, toolInput);
  chip.innerHTML = `<span class="tool-chip-icon">${icon}</span>${label}`;

  const wrapper = document.createElement('div');
  wrapper.appendChild(chip);

  chipWrapper.appendChild(avatar);
  chipWrapper.appendChild(wrapper);
  messagesEl.appendChild(chipWrapper);
  scrollToBottom();
}

function getToolIcon(toolName) {
  const icons = {
    open_url: '🌐',
    open_application: '🚀',
    open_file: '📂',
    list_directory: '📁',
    search_files: '🔍',
    get_system_info: '⚙️',
    create_file: '✏️',
    read_file: '📖',
    run_command: '⚡',
  };
  return icons[toolName] || '🔧';
}

function formatToolName(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatToolLabel(toolName, input) {
  switch (toolName) {
    case 'open_url': return `Opening ${input.url}`;
    case 'open_application': return `Launching ${input.app_name}`;
    case 'open_file': return `Opening ${input.file_path}`;
    case 'list_directory': return `Listing ${input.directory}`;
    case 'search_files': return `Searching for "${input.query}"`;
    case 'get_system_info': return `Getting ${input.info_type} info`;
    case 'create_file': return `Creating ${input.file_path}`;
    case 'read_file': return `Reading ${input.file_path}`;
    case 'run_command': return `$ ${input.command}`;
    default: return formatToolName(toolName);
  }
}

function formatText(text) {
  if (!text) return '';
  // Escape HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${code.trim()}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Newlines
  html = html.replace(/\n/g, '<br>');

  return html;
}

function setLoading(loading, label = 'ARIA is thinking...') {
  state.isLoading = loading;
  sendBtn.disabled = loading;
  typingEl.classList.toggle('hidden', !loading);
  if (label) typingLabel.textContent = label;
  if (loading) scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

/* ─── Boot ─────────────────────────────────────────────── */
init();