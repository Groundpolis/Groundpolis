import { stringify } from 'querystring';

export function query(obj: {}): string {
	return stringify(Object.entries(obj)
		.filter(([, v]) => Array.isArray(v) ? v.length : v !== undefined)
		.reduce((a, [k, v]) => (a[k] = v, a), {} as Record<string, any>));
}

export function appendQuery(url: string, query: string): string {
	return `${url}${/\?/.test(url) ? url.endsWith('?') ? '' : '&' : '?'}${query}`;
}

export function tryCreateUrl<T = URL>(source: string, constructor?: new (source: string) => T): T | null {
	try {
		return new (constructor || URL)(source) as T;
	} catch {
		return null;
	}
}
