import http from './processors/http';
import { ILocalUser } from '../models/user';

export function createHttpJob(data: any) {
	return http({ data }, () => {});
}

type deliverOption = {
	/** Pre computed SHA256 digest (大量に同報する場合はここで指定しておくと負荷が減る) */
	sha256?: string
};

/**
 * Queue deliver job
 * @param user Actor
 * @param content Activity to send
 * @param to Target inbox
 * @param option Deliver option
 */
export function deliver(user: ILocalUser, content: Object, to: string, option: deliverOption = {}) {
	if (content == null) return;

	createHttpJob({
		type: 'deliver',
		user,
		content,
		to,
		sha256: option.sha256
	});
}
