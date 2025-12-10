import { Plugin, MarkdownView, WorkspaceLeaf, TFile } from 'obsidian'
import { EditorView } from '@codemirror/view'
import { SyncManager } from './SyncManager'
import { EditorBinding } from './EditorBinding'

export class EditorMonitor {
	private currentBinding: EditorBinding | null = null
	private currentFile: TFile | null = null

	constructor(
		private plugin: Plugin,
		private syncManager: SyncManager
	) {}

	register(): void {
		// Listen for file changes
		this.plugin.registerEvent(
			this.plugin.app.workspace.on('active-leaf-change', (leaf) => {
				this.handleLeafChange(leaf)
			})
		)
	}

	private async handleLeafChange(leaf: WorkspaceLeaf | null): Promise<void> {
		// Clean up previous binding
		if (this.currentBinding) {
			this.currentBinding.unbind()
			this.currentBinding = null
		}

		if (this.currentFile) {
			this.syncManager.destroySession(this.currentFile)
			this.currentFile = null
		}

		// Check if new leaf is markdown view
		if (!leaf) return
		const view = leaf.view
		if (!(view instanceof MarkdownView)) return

		const file = view.file
		if (!file) return

		// Get CodeMirror EditorView
		const editorView = this.getEditorView(view)
		if (!editorView) return

		// Start sync for this file
		await this.startSync(file, editorView)
	}

	private async startSync(file: TFile, editorView: EditorView): Promise<void> {
		try {
			// Create sync session
			const session = await this.syncManager.createSession(file)

			// Bind to editor
			this.currentBinding = new EditorBinding(
				editorView,
				session.ytext,
				session.provider
			)
			this.currentBinding.bind()

			this.currentFile = file as TFile

			// Update status
			(this.plugin as any).updateStatus('connected')
		} catch (error) {
			console.error('Failed to start sync:', error)
			;(this.plugin as any).updateStatus('error')
		}
	}

	private getEditorView(view: MarkdownView): EditorView | null {
		// Access CodeMirror 6 instance from MarkdownView
		// This uses Obsidian's internal API
		return (view.editor as any).cm as EditorView
	}
}
