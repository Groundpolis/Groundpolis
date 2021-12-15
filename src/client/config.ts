const address = new URL(location.href);
const siteName = (document.querySelector('meta[property="og:site_name"]') as HTMLMetaElement)?.content;

export const host = address.host;
export const hostname = address.hostname;
export const url = address.origin;
export const apiUrl = url + '/api';
export const wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://') + '/streaming';
export const lang = localStorage.getItem('lang');
export const langs = _LANGS_;
export const locale = JSON.parse(localStorage.getItem('locale'));
export const version = _VERSION_;
export const instanceName = siteName === 'Groundpolis' ? host : siteName;
export const ui = localStorage.getItem('ui');
export const debug = localStorage.getItem('debug') === 'true';
export const legacyWebkitCompatibleMode = localStorage.getItem('legacyWebkitCompatibleMode') === 'true';

// フォーク先を指す場合はここを書き換える
// ただし、GitHubリポジトリであることを前提としているので注意
export const repositoryName = 'Groundpolis/Groundpolis';
