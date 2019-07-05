import { toArray } from '../../../prelude/array';
import { IObject, isHashtag } from '../type';

export function extractHashtags(tags: IObject | IObject[]) {
	const hashtags = toArray(tags).filter(isHashtag);

	return hashtags.map(tag => {
		const m = tag.name.match(/^#(.+)/);
		return m ? m[1] : null;
	}).filter(x => x != null);
}
