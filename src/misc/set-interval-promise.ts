const intervalPromise = require('interval-promise');

/**
 * Set IntervalPromise
 * @param func Function to execute for each interval. MUST return a promise.
 * @param intervalLength Length in ms to wait between iterations.
 * @param stopOnError Stop on error
 * @param continueFunc Stop if function returns false
 */
export function setIntervalPromise(func: () => Promise<void>, intervalLength: number | ((iteration: number) => {}), stopOnError = true, continueFunc = () => true) {
	intervalPromise(async (iteration: number, stop: Function) => {
		if (continueFunc && !continueFunc()) {
			stop();
			return;
		}
		await func();
	}, intervalLength, {
		stopOnError
	});
}
