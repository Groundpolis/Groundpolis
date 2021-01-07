import { $i } from '@/account';
import { i18n } from '@/i18n';
import { dialog } from '@/os';

export function pleaseLogin() {
	if ($i) return;

	dialog({
		title: i18n.locale.signinRequired,
		text: null
	});

	throw new Error('signin required');
}
