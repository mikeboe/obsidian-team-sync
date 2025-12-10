# Obsidian Team Sync - Proof of Concept

A real-time collaborative editing system for Obsidian using Yjs CRDTs and WebSocket synchronization.

## Project Status

✅ POC Implementation Complete - Ready for Testing

## What's Been Built

### Server (API)
- Express + WebSocket server using y-websocket
- Health check endpoint at `/health`
- Room-based document synchronization
- Awareness protocol for cursor positions

### Plugin
- Sync Manager for session lifecycle
- Editor binding using y-codemirror.next
- File change monitoring
- Settings UI (server URL, username, enable/disable)
- Status bar indicator
- Toggle sync command

## Quick Start

### 1. Start the Server

```bash
cd api
npm run dev
```

The server will start on port 1234 by default. You should see:
```
🚀 Obsidian Team Sync Server running on port 1234
```

### 2. Install the Plugin

Copy the built plugin files to your Obsidian vault:

```bash
# Create plugin directory in your test vault
mkdir -p /path/to/your/vault/.obsidian/plugins/obsidian-team-sync

# Copy built files
cp plugin/main.js plugin/manifest.json /path/to/your/vault/.obsidian/plugins/obsidian-team-sync/
```

### 3. Enable the Plugin

1. Open Obsidian
2. Go to Settings → Community plugins
3. Enable "Team Sync (POC)"
4. Configure in Settings → Team Sync:
   - Server URL: `ws://localhost:1234`
   - Username: Choose a display name (e.g., "User 1")
   - Enable sync: Toggle ON

### 4. Test Real-Time Sync

**Option A: Two Obsidian Instances on Same Machine**
1. Open two Obsidian windows with the same vault
2. Configure both with same server URL but different usernames
3. Open the same note in both windows
4. Type in one window → see changes in the other

**Option B: Two Machines on Same Network**
1. Start server on Machine A
2. Note Machine A's IP address (e.g., `192.168.1.100`)
3. On Machine B, configure plugin with `ws://192.168.1.100:1234`
4. Open same note on both machines
5. Test real-time synchronization

## Testing Scenarios

### Basic Sync Test
- [ ] Open same note in two clients
- [ ] Type "Hello" in Client A
- [ ] Verify "Hello" appears in Client B within 500ms
- [ ] Type simultaneously in both clients
- [ ] Verify no data loss (CRDT merge works)

### Cursor Awareness Test
- [ ] Position cursor in Client A
- [ ] Verify colored cursor appears in Client B
- [ ] Select text in Client A
- [ ] Verify selection highlight in Client B

### Reconnection Test
- [ ] Stop server while editing
- [ ] Verify status bar shows error/disconnected
- [ ] Continue typing (changes queued)
- [ ] Restart server
- [ ] Verify automatic reconnection
- [ ] Verify queued changes sync

### Room Isolation Test
- [ ] Open `note-A.md` in Client 1
- [ ] Open `note-B.md` in Client 2
- [ ] Edit both simultaneously
- [ ] Verify changes don't cross-contaminate
- [ ] Open `note-A.md` in Client 2
- [ ] Verify sees edits from Client 1

## Development

### Plugin Development

```bash
cd plugin

# Install dependencies
npm install

# Start watch mode (rebuilds on file changes)
npm run dev

# Production build
npm run build
```

### Server Development

```bash
cd api

# Install dependencies
npm install

# Start development server (restarts on changes)
npm run dev

# Production build
npm run build

# Run production server
npm start
```

## Architecture

```
┌─────────────────┐          WebSocket          ┌─────────────────┐
│  Obsidian #1    │◄──────────────────────────►│   Sync Server   │
│  (Plugin)       │      ws://host:1234         │   (y-websocket) │
│                 │                              │                 │
│  ┌───────────┐  │                              │  ┌───────────┐  │
│  │ Y.Doc     │  │                              │  │  Y.Doc    │  │
│  │ Y.Text    │  │                              │  │  Rooms    │  │
│  └─────┬─────┘  │                              │  └───────────┘  │
│        │        │                              └────────▲────────┘
│  ┌─────▼─────┐  │                                       │
│  │CodeMirror │  │                                       │
│  │  Editor   │  │          WebSocket                    │
│  └───────────┘  │                                       │
└─────────────────┘                                       │
                                                          │
┌─────────────────┐                                       │
│  Obsidian #2    │◄──────────────────────────────────────┘
│  (Plugin)       │
└─────────────────┘
```

## Key Files

### Server
- [api/src/server.ts](api/src/server.ts) - Main server entry point
- [api/package.json](api/package.json) - Dependencies and scripts

### Plugin
- [plugin/main.ts](plugin/main.ts) - Plugin entry point
- [plugin/src/sync/SyncManager.ts](plugin/src/sync/SyncManager.ts) - Session management
- [plugin/src/sync/EditorBinding.ts](plugin/src/sync/EditorBinding.ts) - Y.Text ↔ CodeMirror binding
- [plugin/src/sync/EditorMonitor.ts](plugin/src/sync/EditorMonitor.ts) - File event monitoring
- [plugin/src/ui/SettingTab.ts](plugin/src/ui/SettingTab.ts) - Settings UI
- [plugin/src/settings.ts](plugin/src/settings.ts) - Settings interface

## POC Limitations

These are acceptable for proof of concept and will be addressed in v1.0:

1. **No persistence** - Server restart loses all document state
2. **No authentication** - Anyone can connect to server
3. **Single file sync** - Only syncs currently active file
4. **Desktop only** - Uses internal CodeMirror API, won't work on mobile
5. **No team isolation** - All users share all documents

## Troubleshooting

### Plugin doesn't load
- Check that `main.js` and `manifest.json` are in the correct directory
- Look for errors in DevTools console (Ctrl+Shift+I / Cmd+Option+I)

### Can't connect to server
- Verify server is running: `curl http://localhost:1234/health`
- Check server URL in plugin settings
- Check firewall settings if connecting from another machine

### Changes don't sync
- Verify both clients are connected (check status bar)
- Ensure both clients are opening the same file (same path)
- Check browser console for WebSocket errors

### Build errors
- Run `npm install` in both `api/` and `plugin/` directories
- Clear node_modules and reinstall if needed

## Next Steps

After POC validation, prioritize for v1.0:

1. **Data persistence** - PostgreSQL/SQLite backend
2. **Authentication** - JWT-based user login
3. **Multi-file sync** - Sync entire vault
4. **File operations** - Create, delete, rename synchronization
5. **Offline support** - IndexedDB cache with conflict resolution
6. **Production deployment** - Docker, monitoring, logging

## Resources

- [Implementation Plan](implementation_plan.md) - Detailed implementation guide
- [PLAN.md](PLAN.md) - High-level requirements
- [Yjs Documentation](https://docs.yjs.dev/)
- [y-websocket Documentation](https://github.com/yjs/y-websocket)
- [Obsidian Plugin API](https://docs.obsidian.md/)

## License

MIT
