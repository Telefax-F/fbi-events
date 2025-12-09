// ============================================
// FBI Entertainment Team - Event Timeline
// Main Application Script
// ============================================

let allEvents = [];
let currentFilter = 'month';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  await loadEvents();
  setupEventListeners();
  renderTimeline();
}

// ============================================
// DATA LOADING
// ============================================

async function loadEvents() {
  try {
    const response = await fetch('events.json');
    allEvents = await response.json();
    console.log(`✅ Loaded ${allEvents.length} events`);
  } catch (error) {
    console.error('❌ Failed to load events:', error);
    allEvents = [];
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.range;
      renderTimeline();
    });
  });

  // Parser form
  const form = document.getElementById('parser-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleParse();
  });
}

// ============================================
// TIMELINE RENDERING
// ============================================

function renderTimeline() {
  const timeline = document.getElementById('timeline');
  const { startDate, endDate } = getDateRange();
  const days = generateDaySlots(startDate, endDate);
  
  // Group events by date
  const eventsByDate = {};
  allEvents.forEach(event => {
    if (event.date) {
      if (!eventsByDate[event.date]) eventsByDate[event.date] = [];
      eventsByDate[event.date].push(event);
    }
  });

  // Build timeline HTML
  const container = document.createElement('div');
  container.className = 'timeline-container';
  
  const bar = document.createElement('div');
  bar.className = 'timeline-bar';
  container.appendChild(bar);
  
  const slots = document.createElement('div');
  slots.className = 'timeline-slots';
  
  days.forEach(day => {
    const slot = document.createElement('div');
    slot.className = 'day-slot';
    
    // Day label
    const label = document.createElement('div');
    label.className = 'day-label';
    label.textContent = formatDayLabel(day);
    slot.appendChild(label);
    
    // Event card (if exists)
    const events = eventsByDate[day];
    if (events && events.length > 0) {
      const card = createEventCard(events[0]); // Show first event
      slot.appendChild(card);
    }
    
    slots.appendChild(slot);
  });
  
  container.appendChild(slots);
  timeline.innerHTML = '';
  timeline.appendChild(container);
}

function createEventCard(event) {
  const card = document.createElement('div');
  card.className = 'event-card';
  
  if (event.posterUrl) {
    card.classList.add('has-poster');
    card.style.backgroundImage = `url(${event.posterUrl})`;
  }
  
  if (!event.posterUrl) {
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = event.title;
    card.appendChild(title);
  }
  
  if (event.status) {
    const badge = document.createElement('div');
    badge.className = `status-badge ${event.status}`;
    badge.textContent = event.status.toUpperCase();
    card.appendChild(badge);
  }
  
  card.addEventListener('click', () => showEventDetails(event));
  
  return card;
}

function showEventDetails(event) {
  const panel = document.getElementById('event-details');
  panel.className = 'event-details-panel';
  
  let html = `<h3>${escapeHtml(event.title)}</h3>`;
  
  html += `<div class="event-meta">`;
  if (event.date) html += `<div class="event-meta-item">📅 ${escapeHtml(event.date)}</div>`;
  if (event.time) html += `<div class="event-meta-item">🕐 ${escapeHtml(event.time)}</div>`;
  if (event.status) {
    html += `<div class="event-meta-item"><span class="status-badge ${event.status}">${event.status.toUpperCase()}</span></div>`;
  }
  html += `</div>`;
  
  if (event.prize) {
    html += `<div class="event-prize"><strong>🏆 Prize:</strong> ${escapeHtml(event.prize)}</div>`;
  }
  
  if (event.description) {
    html += `<div class="event-description">${escapeHtml(event.description)}</div>`;
  }
  
  if (event.discordUrl) {
    html += `<div class="discord-link"><a href="${escapeHtml(event.discordUrl)}" target="_blank" rel="noopener">View Discord Post →</a></div>`;
  }
  
  panel.innerHTML = html;
}

// ============================================
// DATE/TIME UTILITIES
// ============================================

function getDateRange() {
  const now = new Date();
  let startDate, endDate;
  
  if (currentFilter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (currentFilter === 'next') {
    startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  } else {
    // All events
    if (allEvents.length === 0) {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      const dates = allEvents
        .filter(e => e.date)
        .map(e => new Date(e.date))
        .sort((a, b) => a - b);
      startDate = new Date(dates[0]);
      endDate = new Date(dates[dates.length - 1]);
      startDate.setDate(startDate.getDate() - 3);
      endDate.setDate(endDate.getDate() + 3);
    }
  }
  
  return { startDate, endDate };
}

function generateDaySlots(start, end) {
  const days = [];
  const current = new Date(start);
  
  while (current <= end) {
    days.push(formatISO(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDayLabel(isoDate) {
  const date = new Date(isoDate + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

// ============================================
// DISCORD PARSER
// ============================================

function handleParse() {
  const text = document.getElementById('announcement-text').value.trim();
  const posterUrl = document.getElementById('poster-url').value.trim();
  const discordUrl = document.getElementById('discord-url').value.trim();
  const dateOverride = document.getElementById('date-override').value.trim();
  
  if (!text) {
    alert('Please paste Discord announcement text');
    return;
  }
  
  const event = parseAnnouncement(text, { posterUrl, discordUrl, dateOverride });
  displayParseResult(event);
}

function parseAnnouncement(raw, opts = {}) {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
  
  if (lines.length === 0) {
    return {
      id: `event-${Date.now()}`,
      title: '',
      date: '',
      time: '',
      status: 'planned',
      description: ''
    };
  }
  
  // Extract title (first line, clean markdown and emojis)
  let title = lines[0]
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/<:[^:]+:\d+>/g, '')
    .replace(/<a:[^:]+:\d+>/g, '')
    .trim();
  
  // Find date & time
  let date = opts.dateOverride || '';
  let time = '';
  let descStart = 1;
  
  const dateIndex = lines.findIndex(l => 
    l.toLowerCase().startsWith('date & time:') || 
    l.toLowerCase().startsWith('date and time:')
  );
  
  if (dateIndex !== -1) {
    const dateLine = lines[dateIndex];
    descStart = dateIndex + 1;
    
    // Parse Discord timestamp <t:1234567890:F>
    const match = dateLine.match(/<t:(\d+):[FfDdTtRr]>/);
    if (match) {
      const timestamp = parseInt(match[1]) * 1000;
      const d = new Date(timestamp);
      if (!opts.dateOverride) date = formatISO(d);
      time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    } else {
      const colonIdx = dateLine.indexOf(':');
      if (colonIdx !== -1) time = dateLine.substring(colonIdx + 1).trim();
    }
  }
  
  // Extract description
  const description = lines.slice(descStart).join('\n');
  
  // Extract prize
  let prize = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('prize') || l.includes('reward') || l.includes('award winner')) {
      if (l.match(/^prizes?:/)) {
        const colonIdx = lines[i].indexOf(':');
        prize = lines[i].substring(colonIdx + 1).trim();
        if (!prize && i + 1 < lines.length) prize = lines[i + 1];
      } else if (l.includes('will receive')) {
        const parts = lines[i].split(/will receive/i);
        prize = parts[1]?.trim() || '';
      } else if (l.match(/^prizes?$/i) && i + 1 < lines.length) {
        prize = lines[i + 1];
      }
      if (prize) break;
    }
  }
  
  // Generate ID
  const datePrefix = date || formatISO(new Date());
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 40);
  const id = `${datePrefix}-${titleSlug}`;
  
  const event = {
    id,
    title,
    date,
    time,
    status: 'planned',
    description
  };
  
  if (prize) event.prize = prize;
  if (opts.posterUrl) event.posterUrl = opts.posterUrl;
  if (opts.discordUrl) event.discordUrl = opts.discordUrl;
  
  return event;
}

function displayParseResult(event) {
  const output = document.getElementById('parse-output');
  output.className = 'parse-output show';
  
  let html = `
    <div class="preview-card">
      <h4>📋 Parsed Event</h4>
      <div class="preview-item"><strong>Title:</strong> ${escapeHtml(event.title) || '(none)'}</div>
      <div class="preview-item"><strong>Date:</strong> ${event.date || '(not detected)'}</div>
      <div class="preview-item"><strong>Time:</strong> ${event.time || '(not detected)'}</div>
      <div class="preview-item"><strong>Status:</strong> ${event.status}</div>
      ${event.prize ? `<div class="preview-item"><strong>Prize:</strong> ${escapeHtml(event.prize)}</div>` : ''}
    </div>
    
    <div class="json-block">
      <button class="copy-btn" onclick="copyJSON(this)">📋 Copy JSON</button>
      <pre>${JSON.stringify(event, null, 2)}</pre>
    </div>
  `;
  
  output.innerHTML = html;
}

function copyJSON(button) {
  const pre = button.nextElementSibling;
  const text = pre.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    button.textContent = '✅ Copied!';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = '📋 Copy JSON';
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Copy failed:', err);
    alert('Failed to copy. Please copy manually.');
  });
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
