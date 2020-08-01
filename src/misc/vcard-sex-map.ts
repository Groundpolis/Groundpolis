import { User } from '../models/entities/user';

export const vCardSexes = [ 'M', 'F', 'O', 'N', 'U' ] as const;

type GroundpolisSex = User['sex'];
export type VCardSex = typeof vCardSexes[number];

const vCardMap: Record<GroundpolisSex, VCardSex> = {
	male: 'M',
	female: 'F',
	'not-applicable': 'N',
	'not-known': 'U',
};

const gpMap: Record<VCardSex, GroundpolisSex> = {
	M: 'male',
	F: 'female',
	U: 'not-known',
	//todo: other が追加されたら書き換える
	O: 'not-applicable',
	N: 'not-applicable',
};

export const vCardSexMap = Object.freeze(vCardMap);
export const gpSexMap = Object.freeze(gpMap);
