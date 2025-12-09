// ============================================
// FBI Entertainment Team - Event Timeline
// Main Application Script
// ============================================

let allEvents = [];
let currentFilter = 'month';
let previewedEvent = null; // Store the currently previewed event

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
  // Load from localStorage only (user-added events)
  const savedEvents = localStorage.getItem('fbi-events');
  if (savedEvents) {
    try {
      allEvents = JSON.parse(savedEvents);
      console.log(`✅ Loaded ${allEvents.length} events from storage`);
      console.log('Current events:', allEvents);
    } catch (error) {
      console.error('Error parsing saved events:', error);
      allEvents = [];
    }
  } else {
    allEvents = [];
    console.log('No saved events found. Start by adding events!');
  }
}

// Helper function to clear all events (available in console)
window.clearAllEvents = function() {
  if (confirm('This will delete ALL events. Are you sure?')) {
    localStorage.removeItem('fbi-events');
    allEvents = [];
    renderTimeline();
    document.getElementById('event-details').innerHTML = `
      <div class="empty-state">
        <p>👉 Click an event card on the timeline to view details.</p>
      </div>
    `;
    console.log('✅ All events cleared');
  }
};

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

  // Parser form - generate preview
  const form = document.getElementById('parser-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    generatePreview();
  });
}

// ============================================
// PREVIEW & ADD EVENT
// ============================================

function generatePreview() {
  const announcementText = document.getElementById('announcement-text').value.trim();
  const posterUrl = document.getElementById('poster-url').value.trim();
  const discordUrl = document.getElementById('discord-url').value.trim();
  const dateOverride = document.getElementById('date-override').value.trim();
  
  const previewSection = document.getElementById('preview-section');
  
  if (!announcementText) {
    previewSection.innerHTML = `
      <div class="preview-error">
        ⚠️ Please paste a Discord announcement to generate a preview.
      </div>
    `;
    previewedEvent = null;
    return;
  }
  
  try {
    // Parse the announcement
    const parsed = parseAnnouncement(announcementText, { dateOverride });
    
    // Add optional fields
    if (posterUrl) parsed.posterUrl = posterUrl;
    if (discordUrl) parsed.discordUrl = discordUrl;
    
    // Validate required fields
    if (!parsed.title) {
      throw new Error('Could not detect event title from announcement.');
    }
    if (!parsed.date) {
      throw new Error('Could not detect event date. Please use Date Override field.');
    }
    
    // Store for later
    previewedEvent = parsed;
    
    // Render preview
    let html = `<div class="preview-card">`;
    html += `<h4>📋 Event Preview</h4>`;
    html += `<div class="preview-row"><strong>Title:</strong> ${escapeHtml(parsed.title)}</div>`;
    html += `<div class="preview-row"><strong>Date:</strong> ${escapeHtml(parsed.date)}</div>`;
    if (parsed.time) html += `<div class="preview-row"><strong>Time:</strong> ${escapeHtml(parsed.time)}</div>`;
    if (parsed.status) html += `<div class="preview-row"><strong>Status:</strong> <span class="status-badge ${parsed.status}">${parsed.status.toUpperCase()}</span></div>`;
    if (parsed.prize) html += `<div class="preview-row"><strong>Prize:</strong> ${escapeHtml(parsed.prize)}</div>`;
    
    if (parsed.description) {
      const shortDesc = parsed.description.length > 150 
        ? parsed.description.substring(0, 150) + '...' 
        : parsed.description;
      html += `<div class="preview-description">${escapeHtml(shortDesc)}</div>`;
    }
    
    html += `</div>`;
    html += `<button type="button" class="btn-add-event" id="btn-add-event-action">➕ Add Event to Timeline</button>`;
    
    previewSection.innerHTML = html;
    
    // Attach event listener to add button
    const addBtn = document.getElementById('btn-add-event-action');
    if (addBtn) {
      addBtn.addEventListener('click', addEventToTimeline);
    }
    
  } catch (error) {
    previewSection.innerHTML = `
      <div class="preview-error">
        ❌ Error: ${escapeHtml(error.message)}
      </div>
    `;
    previewedEvent = null;
  }
}

function addEventToTimeline() {
  if (!previewedEvent) {
    alert('Please generate a preview first.');
    return;
  }
  
  // Generate unique ID
  previewedEvent.id = Date.now();
  
  // Add to events list
  allEvents.push(previewedEvent);
  
  // Save to localStorage
  localStorage.setItem('fbi-events', JSON.stringify(allEvents));
  
  // Re-render timeline
  renderTimeline();
  
  // Clear form and show success
  document.getElementById('parser-form').reset();
  document.getElementById('preview-section').innerHTML = `
    <div class="preview-success">
      ✅ Event added to timeline!
    </div>
  `;
  
  previewedEvent = null;
  
  // Clear success message after 3 seconds
  setTimeout(() => {
    document.getElementById('preview-section').innerHTML = '';
  }, 3000);
}

// ============================================
// REMOVE EVENT
// ============================================

function removeEvent(eventId) {
  console.log('removeEvent called with ID:', eventId, 'Type:', typeof eventId);
  console.log('Current events before removal:', allEvents.length);
  console.log('All event IDs:', allEvents.map(e => ({ id: e.id, type: typeof e.id })));
  
  if (!confirm('Are you sure you want to remove this event?')) {
    console.log('User cancelled removal');
    return;
  }
  
  console.log('User confirmed removal, proceeding...');
  
  // Remove from array - ensure type matching
  const beforeLength = allEvents.length;
  allEvents = allEvents.filter(e => {
    const shouldKeep = e.id != eventId; // Use loose comparison to handle type differences
    console.log(`Event ${e.id} (${typeof e.id}) vs ${eventId} (${typeof eventId}): keep=${shouldKeep}`);
    return shouldKeep;
  });
  console.log(`Removed event. Before: ${beforeLength}, After: ${allEvents.length}`);
  
  // Update localStorage
  localStorage.setItem('fbi-events', JSON.stringify(allEvents));
  console.log('localStorage updated');
  
  // Re-render timeline
  renderTimeline();
  
  // Clear details panel
  const panel = document.getElementById('event-details');
  panel.className = 'event-details-panel';
  panel.innerHTML = `
    <div class="empty-state">
      <p>👉 Click an event card on the timeline to view details.</p>
    </div>
  `;
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
    
    // Event cards (support multiple per day)
    const events = eventsByDate[day];
    if (events && events.length > 0) {
      events.forEach(event => {
        const card = createEventCard(event);
        slot.appendChild(card);
      });
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
  panel.className = 'event-details-panel active';
  
  let html = `<h3>${escapeHtml(event.title)}</h3>`;
  
  // Date, time, status row
  if (event.date || event.time || event.status) {
    if (event.date) html += `<div class="detail-row"><strong>📅 Date:</strong> ${escapeHtml(event.date)}</div>`;
    if (event.time) html += `<div class="detail-row"><strong>🕐 Time:</strong> ${escapeHtml(event.time)}</div>`;
    if (event.status) {
      html += `<div class="detail-row"><strong>Status:</strong> <span class="status-badge ${event.status}">${event.status.toUpperCase()}</span></div>`;
    }
  }
  
  // Prize info
  if (event.prize) {
    html += `<div class="prize-info">
      <div class="icon">🏆</div>
      <div class="text">Prize: ${escapeHtml(event.prize)}</div>
    </div>`;
  }
  
  // Description
  if (event.description) {
    html += `<div class="event-description">${escapeHtml(event.description)}</div>`;
  }
  
  // Poster preview
  if (event.posterUrl) {
    html += `<div class="poster-preview"><img src="${escapeHtml(event.posterUrl)}" alt="Event poster"></div>`;
  }
  
  // Discord link
  if (event.discordUrl) {
    html += `<div class="detail-row"><a href="${escapeHtml(event.discordUrl)}" target="_blank" rel="noopener" style="color: var(--accent-gold); text-decoration: none;">View Discord Post →</a></div>`;
  }
  
  // Remove event button
  html += `<button class="btn-remove-event" data-event-id="${event.id}">🗑️ Remove This Event</button>`;
  
  panel.innerHTML = html;
  
  // Attach event listener to remove button
  const removeBtn = panel.querySelector('.btn-remove-event');
  console.log('Remove button found:', removeBtn);
  if (removeBtn) {
    const eventId = removeBtn.dataset.eventId; // Keep as string, don't parse!
    console.log('Attaching remove listener for event ID:', eventId, 'from dataset:', removeBtn.dataset.eventId);
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Remove button CLICKED! Event ID:', eventId);
      removeEvent(eventId);
    });
  } else {
    console.error('Remove button NOT FOUND in DOM');
  }
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
  const date = new Date(isoDate + 'T12:00:00Z');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
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

function cleanDiscordText(text) {
  return text
    .replace(/<a?:[^:]+:\d+>/g, '') // Remove custom Discord emojis
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold **text**
    .replace(/__(.+?)__/g, '$1') // Remove underline __text__
    .replace(/\*(.+?)\*/g, '$1') // Remove italic *text*
    .replace(/@everyone/g, 'everyone') // Clean @mentions
    .replace(/@here/g, 'here')
    .trim();
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
  let title = cleanDiscordText(lines[0]);
  
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
  
  // Extract description and clean Discord formatting
  const descriptionRaw = lines.slice(descStart).join('\n');
  const description = cleanDiscordText(descriptionRaw);
  
  // Extract prize - look for coin values like 10c, 50c, 100c
  let prize = '';
  const prizeMatches = [];
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    
    // Look for coin amounts like "50c" or "100c"
    const coinMatch = lines[i].match(/(\d+)c(?!\w)/gi);
    if (coinMatch) {
      prizeMatches.push(...coinMatch);
    }
    
    // Traditional prize detection
    if (l.includes('prize') || l.includes('reward') || l.includes('award winner')) {
      if (l.match(/^prizes?:/)) {
        const colonIdx = lines[i].indexOf(':');
        const prizeText = lines[i].substring(colonIdx + 1).trim();
        if (prizeText) prizeMatches.push(prizeText);
        if (!prizeText && i + 1 < lines.length) {
          prizeMatches.push(cleanDiscordText(lines[i + 1]));
        }
      } else if (l.includes('will receive')) {
        const parts = lines[i].split(/will receive/i);
        const prizeText = parts[1]?.trim();
        if (prizeText) prizeMatches.push(cleanDiscordText(prizeText));
      } else if (l.match(/^prizes?$/i) && i + 1 < lines.length) {
        prizeMatches.push(cleanDiscordText(lines[i + 1]));
      }
    }
  }
  
  // Combine unique prizes
  if (prizeMatches.length > 0) {
    const uniquePrizes = [...new Set(prizeMatches)];
    prize = uniquePrizes.join(' + ');
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
    
    <button class="btn-success" onclick="addEventToTimeline()">✅ Add Event to Timeline</button>
    
    <div class="json-block">
      <button class="copy-btn" onclick="copyJSON(this)">📋 Copy JSON</button>
      <pre>${JSON.stringify(event, null, 2)}</pre>
    </div>
  `;
  
  output.innerHTML = html;
  
  // Store the parsed event globally so it can be added
  window.parsedEvent = event;
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

async function addEventToTimeline() {
  if (!window.parsedEvent) {
    alert('No event to add!');
    return;
  }
  
  // Add event to the allEvents array
  allEvents.push(window.parsedEvent);
  
  // Save to localStorage - this makes it PERMANENT
  try {
    localStorage.setItem('fbi-events', JSON.stringify(allEvents));
    alert('✅ Event added and saved permanently!');
  } catch (error) {
    console.error('Storage error:', error);
    alert('⚠️ Could not save event. Storage may be full.');
    return;
  }
  
  // Re-render the timeline
  renderTimeline();
  
  // Clear the form
  document.getElementById('announcement-text').value = '';
  document.getElementById('poster-url').value = '';
  document.getElementById('discord-url').value = '';
  document.getElementById('date-override').value = '';
  
  // Hide the parse output
  document.getElementById('parse-output').className = 'parse-output';
  
  // Clear stored event
  window.parsedEvent = null;
}

// Remove the file download function - we don't need it anymore

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
