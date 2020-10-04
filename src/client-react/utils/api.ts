import { apiUrl } from '../config';

export const api = async (endpoint: string, params = {}) => {
	const i = localStorage.getItem('i');
	const res = await fetch(endpoint.indexOf('://') > -1 ? endpoint : apiUrl + '/' + endpoint, {
		method: 'POST',
		body: JSON.stringify(i ? { ...params, i } : params),
		credentials: 'omit',
		cache: 'no-cache'
	});
	const body = res.status === 204 ? null : await res.json();

	if (res.status === 200) {
		return body;
	} else if (res.status === 204) {
		return;
	} else {
		throw body.error;
	}
};

export const isSignedIn = () => !!localStorage.getItem('i');
