import { Plugin } from 'obsidian'
import { TeamSyncSettings, DEFAULT_SETTINGS } from './src/settings'
import { SyncManager } from './src/sync/SyncManager'
import { EditorMonitor } from './src/sync/EditorMonitor'
import { TeamSyncSettingTab } from './src/ui/SettingTab'

export default class TeamSyncPlugin extends Plugin {
	settings: TeamSyncSettings
	syncManager: SyncManager
	editorMonitor: EditorMonitor
	statusBarItem: HTMLElement

	async onload() {
		await this.loadSettings()

		// Initialize sync manager
		this.syncManager = new SyncManager(
			this.app,
			this.settings.serverUrl,
			this.settings.username
		)

		// Initialize editor monitor
		this.editorMonitor = new EditorMonitor(this, this.syncManager)

		// Only start monitoring if sync is enabled
		if (this.settings.enabled) {
			this.editorMonitor.register()
		}

		// Add status bar
		this.statusBarItem = this.addStatusBarItem()
		this.updateStatus('disconnected')

		// Add settings tab
		this.addSettingTab(new TeamSyncSettingTab(this.app, this))

		// Add command to toggle sync
		this.addCommand({
			id: 'toggle-sync',
			name: 'Toggle sync on/off',
			callback: () => {
				this.settings.enabled = !this.settings.enabled
				this.saveSettings()

				if (this.settings.enabled) {
					this.editorMonitor.register()
					this.updateStatus('connected')
				} else {
					this.syncManager.destroyAll()
					this.updateStatus('disconnected')
				}
			}
		})
	}

	onunload() {
		// Clean up all sync sessions
		this.syncManager.destroyAll()
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}

	updateStatus(status: 'connected' | 'disconnected' | 'syncing' | 'error') {
		const icons = {
			connected: '🟢',
			disconnected: '⚪',
			syncing: '🟡',
			error: '🔴'
		}

		const labels = {
			connected: 'Sync: Connected',
			disconnected: 'Sync: Off',
			syncing: 'Sync: Syncing',
			error: 'Sync: Error'
		}

		this.statusBarItem.setText(`${icons[status]} ${labels[status]}`)
	}
}
