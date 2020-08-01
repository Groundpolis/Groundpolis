import { vCardSexes, VCardSex } from '../../../misc/vcard-sex-map';

export type Gender = {
	sex: VCardSex,
	text: string,
};

export const parseGender = (g?: string): Gender => {
	if (!g) return { sex: 'U', text: '' };
	const splitted = g.split(';', 1);
	const sex = (vCardSexes as readonly string[]).includes(splitted[0]) ? splitted[0] as VCardSex : 'U';
	const text = splitted[1] || '';
	return { sex, text };
};
