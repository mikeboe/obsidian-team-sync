# Obsidian Team Sync feature 

Vision: To create a self-hostable service that transforms a standard Obsidian vault into a real-time, collaborative workspace for teams, enabling seamless and conflict-free synchronization of notes and vault structure.

## Core Goals:
- G-1 (Real-Time Collaboration): Enable multiple team members to edit the same note simultaneously, with changes appearing on all screens near-instantly.
- G-2 (Data Integrity): Ensure that no data is lost due to concurrent edits or network issues, leveraging Conflict-free Replicated Data Types (CRDTs) via Yjs.
- G-3 (Self-Hosting & Ownership): Provide a server application that teams can run on their own infrastructure, giving them full control and ownership of their data.
- G-4 (User Experience): The sync process should feel seamless and integrated into the native Obsidian experience, requiring minimal user intervention.


## Service folders 

### /plugin 

This folder holds it's own CLAUDE.md file. Check it out always. 

This folder holds the obsidian plugin. 

### /api

This folder holds the api that is hosted on a server to keep connected obsidian vaults in sync. 
