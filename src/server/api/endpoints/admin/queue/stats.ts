import define from '../../../define';
import { dbQueue, objectStorageQueue } from '../../../../../queue';
export const meta = {
	tags: ['admin'],

	requireCredential: true as const,
	requireModerator: true,

	params: {}
};

export default define(meta, async (ps) => {
	const dbJobCounts = await dbQueue.getJobCounts();
	const objectStorageJobCounts = await objectStorageQueue.getJobCounts();

	return {
		db: dbJobCounts,
		objectStorage: objectStorageJobCounts,
	};
});
