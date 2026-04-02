// src/system.js — System Tool Executor
const path = require('path');
const os = require('os');

// Application name map for cross-platform support
const APP_COMMANDS = {
  // Editors
  vscode: { win: 'code', mac: 'code', linux: 'code' },
  code: { win: 'code', mac: 'code', linux: 'code' },
  notepad: { win: 'notepad', mac: 'open -a TextEdit', linux: 'gedit' },
  textedit: { win: 'notepad', mac: 'open -a TextEdit', linux: 'gedit' },
  sublime: { win: 'subl', mac: 'subl', linux: 'subl' },
  vim: { win: 'vim', mac: 'vim', linux: 'vim' },

  // Browsers
  chrome: { win: 'start chrome', mac: 'open -a "Google Chrome"', linux: 'google-chrome' },
  firefox: { win: 'start firefox', mac: 'open -a Firefox', linux: 'firefox' },
  edge: { win: 'start msedge', mac: 'open -a "Microsoft Edge"', linux: 'microsoft-edge' },
  safari: { win: '', mac: 'open -a Safari', linux: '' },
  brave: { win: 'start brave', mac: 'open -a Brave', linux: 'brave-browser' },

  // Communication
  whatsapp: { win: 'start whatsapp:', mac: 'open -a WhatsApp', linux: 'whatsapp-desktop' },
  discord: { win: 'start discord', mac: 'open -a Discord', linux: 'discord' },
  slack: { win: 'start slack', mac: 'open -a Slack', linux: 'slack' },
  telegram: { win: 'start telegram', mac: 'open -a Telegram', linux: 'telegram-desktop' },
  zoom: { win: 'start zoom', mac: 'open -a zoom.us', linux: 'zoom' },
  teams: { win: 'start msteams', mac: 'open -a "Microsoft Teams"', linux: 'teams' },
  skype: { win: 'start skype', mac: 'open -a Skype', linux: 'skype' },

  // Media
  spotify: { win: 'start spotify', mac: 'open -a Spotify', linux: 'spotify' },
  vlc: { win: 'start vlc', mac: 'open -a VLC', linux: 'vlc' },
  itunes: { win: 'start itunes', mac: 'open -a Music', linux: '' },

  // Productivity
  word: { win: 'start winword', mac: 'open -a "Microsoft Word"', linux: 'libreoffice --writer' },
  excel: { win: 'start excel', mac: 'open -a "Microsoft Excel"', linux: 'libreoffice --calc' },
  powerpoint: { win: 'start powerpnt', mac: 'open -a "Microsoft PowerPoint"', linux: 'libreoffice --impress' },
  onenote: { win: 'start onenote', mac: 'open -a "Microsoft OneNote"', linux: '' },
  notion: { win: 'start notion', mac: 'open -a Notion', linux: 'notion-app' },
  obsidian: { win: 'start obsidian', mac: 'open -a Obsidian', linux: 'obsidian' },

  // System
  terminal: { win: 'start cmd', mac: 'open -a Terminal', linux: 'x-terminal-emulator' },
  cmd: { win: 'start cmd', mac: 'open -a Terminal', linux: 'x-terminal-emulator' },
  powershell: { win: 'start powershell', mac: 'open -a Terminal', linux: 'x-terminal-emulator' },
  calculator: { win: 'start calc', mac: 'open -a Calculator', linux: 'gnome-calculator' },
  explorer: { win: 'start explorer', mac: 'open ~', linux: 'nautilus' },
  'file manager': { win: 'start explorer', mac: 'open ~', linux: 'nautilus' },
  'file explorer': { win: 'start explorer', mac: 'open ~', linux: 'nautilus' },
  finder: { win: 'start explorer', mac: 'open ~', linux: 'nautilus' },
  settings: { win: 'start ms-settings:', mac: 'open -a "System Preferences"', linux: 'gnome-control-center' },
  'task manager': { win: 'start taskmgr', mac: 'open -a "Activity Monitor"', linux: 'gnome-system-monitor' },
  'activity monitor': { win: 'start taskmgr', mac: 'open -a "Activity Monitor"', linux: 'gnome-system-monitor' },

  // Creative
  figma: { win: 'start figma', mac: 'open -a Figma', linux: 'figma-linux' },
  photoshop: { win: 'start photoshop', mac: 'open -a "Adobe Photoshop"', linux: '' },
  gimp: { win: 'start gimp', mac: 'open -a GIMP', linux: 'gimp' },

  // Dev tools
  git: { win: 'start git-bash', mac: 'open -a Terminal', linux: 'x-terminal-emulator' },
  postman: { win: 'start postman', mac: 'open -a Postman', linux: 'postman' },
  docker: { win: 'start "Docker Desktop"', mac: 'open -a Docker', linux: 'docker' },
  pgadmin: { win: 'start pgadmin4', mac: 'open -a pgAdmin\\ 4', linux: 'pgadmin4' },
};

function resolvePath(inputPath) {
  const homedir = os.homedir();
  if (!inputPath) return homedir;
  const lower = inputPath.toLowerCase().trim();
  if (lower === '~' || lower === 'home') return homedir;
  if (lower === 'desktop') return path.join(homedir, 'Desktop');
  if (lower === 'downloads') return path.join(homedir, 'Downloads');
  if (lower === 'documents') return path.join(homedir, 'Documents');
  if (lower === 'pictures') return path.join(homedir, 'Pictures');
  if (lower === 'music') return path.join(homedir, 'Music');
  if (lower === 'videos') return path.join(homedir, 'Videos');
  if (inputPath.startsWith('~')) return path.join(homedir, inputPath.slice(1));
  return inputPath;
}

async function executeSystemTool(toolName, toolInput, mainWindow, shell, dialog, exec, execSync, osModule, fs) {
  const platform = process.platform; // 'win32', 'darwin', 'linux'
  const platformKey = platform === 'win32' ? 'win' : platform === 'darwin' ? 'mac' : 'linux';

  switch (toolName) {

    // ── open_url ──────────────────────────────────────────────────────────────
    case 'open_url': {
      let { url } = toolInput;
      if (!url.startsWith('http')) url = 'https://' + url;
      await shell.openExternal(url);
      return `✅ Opened ${url} in your browser`;
    }

    // ── open_application ─────────────────────────────────────────────────────
    case 'open_application': {
      const { app_name } = toolInput;
      const key = app_name.toLowerCase().trim();

      // Check known app map
      const appEntry = APP_COMMANDS[key] || APP_COMMANDS[key.replace(/\s+/g, '')];
      if (appEntry) {
        const cmd = appEntry[platformKey];
        if (!cmd) return `❌ ${app_name} is not supported on ${platform}`;
        await new Promise((resolve, reject) => {
          exec(cmd, (err) => err ? reject(err) : resolve());
        });
        return `✅ Launched ${app_name}`;
      }

      // Fallback: try running the app name directly
      const fallbackCmd = platform === 'win32' ? `start ${app_name}` :
        platform === 'darwin' ? `open -a "${app_name}"` :
          app_name;
      await new Promise((resolve, reject) => {
        exec(fallbackCmd, (err) => err ? reject(new Error(`Could not find app: ${app_name}`)) : resolve());
      });
      return `✅ Launched ${app_name}`;
    }

    // ── open_file ─────────────────────────────────────────────────────────────
    case 'open_file': {
      const filePath = resolvePath(toolInput.file_path);
      if (!fs.existsSync(filePath)) return `❌ File not found: ${filePath}`;
      await shell.openPath(filePath);
      return `✅ Opened file: ${filePath}`;
    }

    // ── list_directory ────────────────────────────────────────────────────────
    case 'list_directory': {
      const dir = resolvePath(toolInput.directory);
      const showHidden = toolInput.show_hidden || false;
      if (!fs.existsSync(dir)) return `❌ Directory not found: ${dir}`;

      const items = fs.readdirSync(dir, { withFileTypes: true });
      const filtered = showHidden ? items : items.filter(i => !i.name.startsWith('.'));
      const sorted = filtered.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      const lines = sorted.map(i => `${i.isDirectory() ? '📁' : '📄'} ${i.name}`);
      return `Contents of ${dir}:\n${lines.join('\n')}\n\n(${lines.length} items)`;
    }

    // ── search_files ──────────────────────────────────────────────────────────
    case 'search_files': {
      const { query } = toolInput;
      const searchDir = resolvePath(toolInput.directory || '~');
      const results = [];

      function searchRecursive(dir, depth = 0) {
        if (depth > 4 || results.length > 50) return;
        try {
          const items = fs.readdirSync(dir, { withFileTypes: true });
          for (const item of items) {
            if (item.name.startsWith('.')) continue;
            if (item.name.toLowerCase().includes(query.toLowerCase())) {
              results.push(path.join(dir, item.name));
            }
            if (item.isDirectory() && depth < 3) {
              searchRecursive(path.join(dir, item.name), depth + 1);
            }
          }
        } catch (e) { /* skip permission errors */ }
      }

      searchRecursive(searchDir);
      if (results.length === 0) return `No files matching "${query}" found in ${searchDir}`;
      return `Found ${results.length} file(s) matching "${query}":\n${results.slice(0, 30).join('\n')}`;
    }

    // ── get_system_info ───────────────────────────────────────────────────────
    case 'get_system_info': {
      const { info_type } = toolInput;
      const memTotal = (osModule.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const memFree = (osModule.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const memUsed = (memTotal - memFree).toFixed(2);

      switch (info_type) {
        case 'overview':
          return [
            `🖥️  System Overview`,
            `OS: ${osModule.type()} ${osModule.release()} (${osModule.arch()})`,
            `Hostname: ${osModule.hostname()}`,
            `Username: ${osModule.userInfo().username}`,
            `Platform: ${platform}`,
            `Uptime: ${Math.floor(osModule.uptime() / 3600)}h ${Math.floor((osModule.uptime() % 3600) / 60)}m`,
            `CPU: ${osModule.cpus()[0].model} (${osModule.cpus().length} cores)`,
            `RAM: ${memUsed} GB used / ${memTotal} GB total`,
            `Home Dir: ${osModule.homedir()}`,
          ].join('\n');

        case 'memory':
          return `💾 Memory: ${memUsed} GB used / ${memTotal} GB total (${((memUsed / memTotal) * 100).toFixed(1)}% used)`;

        case 'cpu':
          const cpus = osModule.cpus();
          const load = osModule.loadavg();
          return [
            `⚙️  CPU: ${cpus[0].model}`,
            `Cores: ${cpus.length}`,
            `Load avg (1m/5m/15m): ${load.map(l => l.toFixed(2)).join(' / ')}`,
          ].join('\n');

        case 'disk': {
          try {
            let diskInfo = '';
            if (platform === 'win32') {
              diskInfo = execSync('wmic logicaldisk get caption,size,freespace /format:list').toString();
            } else {
              diskInfo = execSync('df -h /').toString();
            }
            return `💿 Disk Info:\n${diskInfo}`;
          } catch (e) {
            return `💿 Could not retrieve disk info: ${e.message}`;
          }
        }

        case 'processes': {
          try {
            let ps = '';
            if (platform === 'win32') {
              ps = execSync('tasklist /fo csv /nh').toString().split('\n').slice(0, 20).join('\n');
            } else {
              ps = execSync('ps aux --sort=-%cpu | head -20').toString();
            }
            return `🔄 Top Processes:\n${ps}`;
          } catch (e) {
            return `Could not retrieve processes: ${e.message}`;
          }
        }

        case 'network': {
          const nets = osModule.networkInterfaces();
          const lines = [];
          for (const [name, addrs] of Object.entries(nets)) {
            for (const addr of addrs) {
              if (!addr.internal) {
                lines.push(`${name}: ${addr.address} (${addr.family})`);
              }
            }
          }
          return `🌐 Network Interfaces:\n${lines.join('\n') || 'No active interfaces found'}`;
        }

        default:
          return 'Unknown info type';
      }
    }

    // ── create_file ───────────────────────────────────────────────────────────
    case 'create_file': {
      const filePath = resolvePath(toolInput.file_path);
      const { content } = toolInput;
      fs.writeFileSync(filePath, content, 'utf8');
      return `✅ Created file: ${filePath}`;
    }

    // ── read_file ─────────────────────────────────────────────────────────────
    case 'read_file': {
      const filePath = resolvePath(toolInput.file_path);
      if (!fs.existsSync(filePath)) return `❌ File not found: ${filePath}`;
      const stats = fs.statSync(filePath);
      if (stats.size > 500_000) return `❌ File too large to read (${(stats.size / 1024).toFixed(0)} KB). Max 500 KB.`;
      const content = fs.readFileSync(filePath, 'utf8');
      return `📄 Contents of ${filePath}:\n\n${content.slice(0, 4000)}${content.length > 4000 ? '\n\n[...truncated]' : ''}`;
    }

    // ── run_command ───────────────────────────────────────────────────────────
    case 'run_command': {
      const { command } = toolInput;
      // Basic safety: block destructive commands
      const dangerous = ['rm -rf', 'del /f', 'format', 'mkfs', 'dd if=', 'shutdown', 'reboot', 'halt'];
      if (dangerous.some(d => command.toLowerCase().includes(d))) {
        return `❌ Blocked: Command "${command}" is potentially destructive.`;
      }
      return await new Promise((resolve) => {
        exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
          if (err) resolve(`Error: ${err.message}\n${stderr}`);
          else resolve(stdout || stderr || 'Command completed (no output)');
        });
      });
    }

    default:
      return `❌ Unknown tool: ${toolName}`;
  }
}

module.exports = { executeSystemTool };