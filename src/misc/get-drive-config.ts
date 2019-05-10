import config from '../config';
import { DriveConfig } from '../config/types';

export function getDriveConfig(remote = false): DriveConfig {
	if (!config.drive) {
		return {
			storage: 'db'
		};
	}

	return remote && config.remoteDrive ? config.remoteDrive : config.drive;
}
