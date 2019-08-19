import $ from 'cafy';
import define from '../../define';
import ID, { transform } from '../../../../misc/cafy-id';
import Room, { packRoom } from '../../../../models/room';

export const meta = {
	desc: {
		'ja-JP': '指定した部屋の情報を取得します。',
	},

	tags: ['room'],

	requireCredential: false,

	params: {
		userId: {
			validator: $.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーのID',
				'en-US': 'Target user ID'
			}
		},
	},
};

export default define(meta, async (ps, me) => {
	const room = await Room.findOne({
		userId: ps.userId,
		floor: 0,
	});

	return await packRoom(room);
});
