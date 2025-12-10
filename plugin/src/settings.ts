export interface TeamSyncSettings {
	serverUrl: string;
	username: string;
	enabled: boolean;
}

export const DEFAULT_SETTINGS: TeamSyncSettings = {
	serverUrl: 'ws://localhost:1234',
	username: 'Anonymous',
	enabled: false
}
