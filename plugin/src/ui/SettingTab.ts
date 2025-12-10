import { App, PluginSettingTab, Setting } from 'obsidian'
import TeamSyncPlugin from '../../main'

export class TeamSyncSettingTab extends PluginSettingTab {
	plugin: TeamSyncPlugin

	constructor(app: App, plugin: TeamSyncPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		containerEl.createEl('h2', { text: 'Team Sync Settings' })

		new Setting(containerEl)
			.setName('Server URL')
			.setDesc('WebSocket URL of the sync server (e.g., ws://localhost:1234)')
			.addText(text => text
				.setPlaceholder('ws://localhost:1234')
				.setValue(this.plugin.settings.serverUrl)
				.onChange(async (value) => {
					this.plugin.settings.serverUrl = value
					await this.plugin.saveSettings()
				}))

		new Setting(containerEl)
			.setName('Username')
			.setDesc('Display name shown to other users (for cursor awareness)')
			.addText(text => text
				.setPlaceholder('Anonymous')
				.setValue(this.plugin.settings.username)
				.onChange(async (value) => {
					this.plugin.settings.username = value
					await this.plugin.saveSettings()
				}))

		new Setting(containerEl)
			.setName('Enable sync')
			.setDesc('Turn collaborative sync on or off')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					this.plugin.settings.enabled = value
					await this.plugin.saveSettings()

					// Trigger sync state change
					if (value) {
						this.plugin.editorMonitor.register()
						this.plugin.updateStatus('connected')
					} else {
						this.plugin.syncManager.destroyAll()
						this.plugin.updateStatus('disconnected')
					}
				}))
	}
}
