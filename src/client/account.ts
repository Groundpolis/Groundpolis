import { reactive } from 'vue';
import { apiUrl } from '@/config';
import { waiting } from '@/os';

// TODO: 他のタブと永続化されたstateを同期

type Account = {
	id: string;
	token: string;
	isModerator: boolean;
	isAdmin: boolean;
	isDeleted: boolean;
};

const data = localStorage.getItem('account');

const i = data !== null ? JSON.parse(data) as Account : null;

// https://github.com/syuilo/misskey/issues/7107 を発症してしまった場合への対策
if (i && i.token === null) { 
	localStorage.removeItem('account');
}

// TODO: 外部からはreadonlyに
export const $i = i && i.token ? reactive(i) : null;

export function signout() {
	if ($i === null) return;
	localStorage.removeItem('account');
	const accounts = getAccounts();
	const current = accounts.findIndex(a => a.id === $i.id);
	const newAccounts = accounts.filter((_, i) => i !== current);
	localStorage.setItem('accounts', JSON.stringify(newAccounts));

	if (newAccounts.length > 0) {
		login(newAccounts[0].token);
	} else {
		document.cookie = `igi=; path=/`;
		location.href = '/';
	}
}

export function signoutAll() { 
	localStorage.removeItem('account');
	localStorage.removeItem('accounts');
	document.cookie = `igi=; path=/`;
	location.href = '/';
}

export function getAccounts() {
	const accountsData = localStorage.getItem('accounts');
	const accounts: { id: Account['id'], token: Account['token'] }[] = accountsData ? JSON.parse(accountsData) : [];
	return accounts;
}

export function addAccount(id: Account['id'], token: Account['token']) {
	const accounts = getAccounts();
	if (!accounts.some(x => x.id === id)) {
		localStorage.setItem('accounts', JSON.stringify(accounts.concat([{ id, token }])));
	}
}

function fetchAccount(token): Promise<Account> {
	return new Promise((done, fail) => {
		// Fetch user
		fetch(`${apiUrl}/i`, {
			method: 'POST',
			body: JSON.stringify({
				i: token
			})
		})
		.then(res => {
			// When failed to authenticate user
			if (res.status !== 200 && res.status < 500) {
				return signout();
			}

			// Parse response
			res.json().then(i => {
				i.token = token;
				done(i);
			});
		})
		.catch(fail);
	});
}

export function updateAccount(data) {
	for (const [key, value] of Object.entries(data)) {
		$i[key] = value;
	}
}

export function refreshAccount() {
	fetchAccount($i.token).then(updateAccount);
}

export async function login(token: Account['token']) {
	waiting();
	if (_DEV_) console.log('logging as token ', token);
	const me = await fetchAccount(token);
	localStorage.setItem('account', JSON.stringify(me));
	addAccount(me.id, token);
	location.reload();
}

// このファイルに書きたくないけどここに書かないと何故かVeturが認識しない
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$i: typeof $i;
	}
}
