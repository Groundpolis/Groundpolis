import * as mongo from 'mongodb';
import * as deepcopy from 'deepcopy';
import db from '../db/mongodb';

const Room = db.get<IRoom>('room');
Room.createIndex(['userId', 'floor'], { unique: true });
export default Room;

export interface IRoom {
	_id: mongo.ObjectID;
	userId: mongo.ObjectID;
	floor: number;
	data: IRoomData;
}

export interface IRoomData {
	furnitures: {
		id: string;
		type: string;
		position: {
			x: number;
			y: number;
			z: number;
		};
		rotation: {
			x: number;
			y: number;
			z: number;
		};
		props?: {};
	}[];
	roomType: string;
	carpetColor: string;
}

export async function packRoom(room: IRoom) {
	const data = (room && room.data) ? deepcopy(room.data) : {} as IRoomData;

	if (!data.furnitures) data.furnitures = [];
	if (!data.roomType) data.roomType = 'default';
	if (!data.carpetColor) data.carpetColor = '#85CAF0';

	return data;
}
