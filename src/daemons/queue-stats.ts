import * as Deque from 'double-ended-queue';
import Xev from 'xev';
import { deliverQueue, inboxQueue } from '../queue';
import { program } from './../argv';
import config from '../config';
import * as os from 'os';

const ev = new Xev();

const interval = 3000;

/**
 * Report queue stats regularly
 */
export default function() {
	const workers = program.disableClustering ? 1 : Math.min(config.clusterLimit || Infinity, os.cpus().length);

	const deliverConcurrencyPerWorker = config.deliverJobConcurrency || 32;
	const inboxConcurrencyPerWorker = config.inboxJobConcurrency || 32;

	const log = new Deque<any>();

	ev.on('requestQueueStatsLog', x => {
		ev.emit(`queueStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
	});

	let activeDeliverJobs = 0;
	let activeInboxJobs = 0;

	deliverQueue.on('global:active', () => {
		activeDeliverJobs++;
	});

	inboxQueue.on('global:active', () => {
		activeInboxJobs++;
	});

	async function tick() {
		const deliverJobCounts = await deliverQueue.getJobCounts();
		const inboxJobCounts = await inboxQueue.getJobCounts();

		const stats = {
			deliver: {
				limit: deliverConcurrencyPerWorker * workers,
				activeSincePrevTick: activeDeliverJobs,
				active: deliverJobCounts.active,
				waiting: deliverJobCounts.waiting,
				delayed: deliverJobCounts.delayed
			},
			inbox: {
				limit: inboxConcurrencyPerWorker * workers,
				activeSincePrevTick: activeInboxJobs,
				active: inboxJobCounts.active,
				waiting: inboxJobCounts.waiting,
				delayed: inboxJobCounts.delayed
			}
		};

		ev.emit('queueStats', stats);

		log.unshift(stats);
		if (log.length > 200) log.pop();

		activeDeliverJobs = 0;
		activeInboxJobs = 0;
	}

	tick();

	setInterval(tick, interval);
}
