# FBI Entertainment Team - Event Timeline

A clean, static website for managing and displaying FBI Entertainment Team (Habbo) events on a visual timeline.

## Overview

This is a simple static site that displays events on a horizontal timeline bar. Events are stored in a JSON file and can be easily added by pasting Discord announcement text into a built-in parser.

**Key Features:**
- Visual timeline with event cards
- Smart Discord announcement parser
- Date range filtering (current month, next month, all events)
- Click events to view full details
- Copy-paste JSON output for new events

## How It Works

1. **View Timeline** - See all your events on a horizontal timeline bar
2. **Parse Announcements** - Paste Discord text, the parser extracts title, date, time, and prizes
3. **Copy JSON** - Get formatted JSON to manually add to `events.json`
4. **Commit & Push** - Update the repo, GitHub Pages automatically updates the site

## Data Structure

Events are stored in `events.json` as an array:

```json
[
  {
    "id": "2025-12-15-christmas-party",
    "title": "FBI Christmas Party 2025",
    "date": "2025-12-15",
    "time": "19:00",
    "status": "planned",
    "prize": "10c + rare furni",
    "description": "Join us for the annual FBI Christmas celebration!",
    "posterUrl": "https://example.com/poster.png",
    "discordUrl": "https://discord.com/channels/..."
  }
]
```

**Fields:**
- `id` - Unique identifier (auto-generated)
- `title` - Event name
- `date` - ISO format (YYYY-MM-DD)
- `time` - 24-hour format (HH:MM)
- `status` - `planned`, `done`, or `cancelled`
- `prize` - Prize description (optional)
- `description` - Full event details
- `posterUrl` - Event poster image URL (optional)
- `discordUrl` - Link to Discord announcement (optional)

## Tech Stack

- **HTML/CSS/JavaScript** - Pure vanilla, no frameworks
- **GitHub Pages** - Free static hosting
- **No build process** - Just edit and push

## Local Development

1. Clone the repo
2. Open `index.html` in a browser
3. Edit `events.json` to add/modify events

## Deployment

The site auto-deploys via GitHub Pages when you push to the main branch.

**Setup GitHub Pages:**
1. Go to repository Settings → Pages
2. Source: Deploy from branch `main`
3. Folder: `/ (root)`
4. Save

Your site will be live at: `https://telefax-f.github.io/fbi-events/`