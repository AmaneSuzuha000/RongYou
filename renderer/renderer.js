'use strict';

const schoolSelect = document.getElementById('school-select');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const autoplayBtn = document.getElementById('autoplay-btn');
const stopBtn = document.getElementById('stop-btn');
const statusIndicator = document.getElementById('status-indicator');
const toggleLogBtn = document.getElementById('toggle-log-btn');
const logPanel = document.getElementById('log-panel');
const logContent = document.getElementById('log-content');

// Load settings and populate UI
async function init() {
  const settings = await window.api.invoke('load-settings');
  if (!settings) return;

  // Populate school dropdown
  const entries = Object.entries(settings.schools);
  entries.sort((a, b) => a[1].localeCompare(b[1], 'zh'));
  for (const [code, name] of entries) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${name} (${code})`;
    schoolSelect.appendChild(opt);
  }
  schoolSelect.value = settings.schoolCode || settings.defaultSchoolCode;
  usernameInput.value = settings.username || '';
  passwordInput.value = settings.password || '';
}

init();

// Log toggle
toggleLogBtn.addEventListener('click', () => {
  logPanel.classList.toggle('hidden');
});

function appendLog(message) {
  const now = new Date();
  const ts = now.toLocaleTimeString('en-US', { hour12: false });
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="timestamp">[${ts}]</span>${escapeHtml(message)}`;
  logContent.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

let currentStatus = 'idle';

function setStatus(status) {
  currentStatus = status;
  const labels = {
    'idle': 'Idle',
    'logging-in': 'Logging in',
    'logged-in': 'Logged in',
    'playing': 'Playing',
    'error': 'Error',
  };
  statusIndicator.className = `status ${status}`;
  statusIndicator.textContent = labels[status] || status;

  // Update button states
  const isBusy = status === 'logging-in' || status === 'playing';
  loginBtn.disabled = isBusy;
  autoplayBtn.disabled = isBusy;
  stopBtn.disabled = !isBusy;
}

// IPC listeners
window.api.on('log-message', (message) => {
  appendLog(message);
});

window.api.on('status-update', (status) => {
  setStatus(status);
});

// Login button
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const schoolCode = schoolSelect.value;

  if (!username || !password) {
    appendLog('Please enter username and password');
    return;
  }

  window.api.send('save-settings', { schoolCode, username, password });
  window.api.send('start-login', { username, password, schoolCode });
});

// Auto play button
autoplayBtn.addEventListener('click', () => {
  window.api.send('start-autoplay');
});

// Stop button - stops either login or autoplay depending on current state
stopBtn.addEventListener('click', () => {
  if (currentStatus === 'logging-in') {
    window.api.send('stop-login');
  } else {
    window.api.send('stop-autoplay');
  }
});
