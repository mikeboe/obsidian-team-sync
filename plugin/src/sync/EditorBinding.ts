import { EditorView, ViewPlugin } from '@codemirror/view'
import { StateEffect } from '@codemirror/state'
import { yCollab } from 'y-codemirror.next'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export class EditorBinding {
	private collabExtension: any

	constructor(
		private editorView: EditorView,
		private ytext: Y.Text,
		private provider: WebsocketProvider
	) {}

	bind(): void {
		// Create collaborative editing extension
		this.collabExtension = yCollab(
			this.ytext,
			this.provider.awareness,
			{ undoManager: false } // POC: disable shared undo for simplicity
		)

		// Add extension to editor
		this.editorView.dispatch({
			effects: StateEffect.appendConfig.of(this.collabExtension)
		})
	}

	unbind(): void {
		// Remove extension when closing file
		// CodeMirror will handle cleanup when reconfigured
		if (this.collabExtension) {
			this.collabExtension = null
		}
	}
}
