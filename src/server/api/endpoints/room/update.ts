import $ from 'cafy';
import define from '../../define';
import Room from '../../../../models/room';

export const meta = {
	requireCredential: true,

	params: {
		room: {
			validator: $.obj({
				furnitures: $.arr($.obj({
					id: $.str,
					type: $.str,
					position: $.obj({
						x: $.num,
						y: $.num,
						z: $.num,
					}),
					rotation: $.obj({
						x: $.num,
						y: $.num,
						z: $.num,
					}),
					props: $.optional.nullable.obj(),
				})),
				roomType: $.str,
				carpetColor: $.str
			})
		},
		floor: {
			validator: $.optional.num.int().min(-999).max(999),
			default: 0,
			desc: {
				'ja-JP': '階数',
				'en-US': 'Number of floors'
			},
		},
	},
};

export default define(meta, async (ps, user) => {
	const exists = await Room.findOne({
		userId: user._id,
		floor: ps.floor,
	});

	if (exists) {
		const set = {
			data: ps.room
		} as any;

		await Room.update({
			userId: user._id,
			floor: ps.floor,
		}, {
			$set: set
		});
	} else {
		await Room.insert({
			userId: user._id,
			floor: ps.floor,
			data: ps.room
		});
	}
});
