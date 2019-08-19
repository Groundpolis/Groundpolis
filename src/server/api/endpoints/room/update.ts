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
	},
};

export default define(meta, async (ps, user) => {
	const exists = await Room.findOne({
		userId: user._id,
		floor: 0,
	});

	if (exists) {
		const set = {
			data: ps.room
		} as any;

		await Room.update({
			userId: user._id,
			floor: 0,
		}, {
			$set: set
		});
	} else {
		await Room.insert({
			userId: user._id,
			floor: 0,
			data: ps.room
		});
	}
});
