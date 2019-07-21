export interface IAnyObject {
	'@context'?: any;
}

export function detectSystem(x: IAnyObject) {
	if (x == null) return null;
	if (x['@context'] == null) return null;
	if (!Array.isArray(x['@context'])) return null;

	const strs = x['@context'].filter(x1 => typeof x1 === 'string') as string[];
	const objs = x['@context'].filter(x1 => !Array.isArray(x1) && typeof x1 === 'object') as object[];
	const obj = objs.length > 0 ? objs[0] : {};

	if (strs.some(s => s.match('schemas/litepub'))) return 'Pleroma';
	if (Object.keys(obj).includes('focalPoint')) return 'Mastodon';
	if (Object.keys(obj).includes('commentsEnabled')) return 'PeerTube';
	if (Object.keys(obj).includes('diaspora')) return 'Friendica';
	if (Object.keys(obj).includes('toot')) return 'Mastodon';
	if (Object.keys(obj).includes('Hashtag')) return 'Misskey';

	return null;
}
