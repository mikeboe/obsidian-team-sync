import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { App, TFile } from 'obsidian'

export interface SyncSession {
	doc: Y.Doc
	provider: WebsocketProvider
	ytext: Y.Text
	file: TFile
}

export class SyncManager {
	private sessions = new Map<string, SyncSession>()

	constructor(
		private app: App,
		private serverUrl: string,
		private username: string
	) {}

	async createSession(file: TFile): Promise<SyncSession> {
		const roomName = this.getRoomName(file)

		// Create Yjs document
		const doc = new Y.Doc()
		const ytext = doc.getText('content')

		// Create WebSocket provider
		const provider = new WebsocketProvider(this.serverUrl, roomName, doc)

		// Set awareness info (for cursor display)
		provider.awareness.setLocalStateField('user', {
			name: this.username,
			color: this.generateColor()
		})

		// Wait for initial sync
		await new Promise<void>((resolve) => {
			provider.once('sync', () => resolve())
		})

		// If server has no content, initialize with file content
		if (ytext.length === 0) {
			const content = await this.app.vault.read(file)
			ytext.insert(0, content)
		}

		const session = { doc, provider, ytext, file }
		this.sessions.set(file.path, session)
		return session
	}

	destroySession(file: TFile): void {
		const session = this.sessions.get(file.path)
		if (session) {
			session.provider.destroy()
			session.doc.destroy()
			this.sessions.delete(file.path)
		}
	}

	getSession(file: TFile): SyncSession | null {
		return this.sessions.get(file.path) || null
	}

	destroyAll(): void {
		for (const session of this.sessions.values()) {
			session.provider.destroy()
			session.doc.destroy()
		}
		this.sessions.clear()
	}

	private getRoomName(file: TFile): string {
		// Use vault-relative file path as room identifier
		return `vault:///${file.path}`
	}

	private generateColor(): string {
		const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292', '#BA68C8', '#4DB6AC']
		return colors[Math.floor(Math.random() * colors.length)]
	}
}
