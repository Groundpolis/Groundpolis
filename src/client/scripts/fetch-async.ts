/*
Based on https://github.com/marborkowski/fetch-worker/
Copyright (c) 2017 Marcin Borkowski
*/

let worker: any;

const defaultRequest: RequestInit = {
	method: 'GET',
	mode: 'cors',
	cache: 'default',
	redirect: 'follow',
	headers: {
		'Content-Type': 'application/json'
	}
};

const tasks = {} as Record<string, {
	promise: Promise<unknown>,
	res: (value?: unknown) => void,
	rej: (reason?: any)=> void,
}>;

const onmessage = (event: any) => {
	const { id, query } = event.data;
	fetch(query.url, query.request)
		.then((response) => {
			const res = {
				status: response.status,
				statusText: response.statusText,
				headers: Array.prototype.slice.call(response.headers),
				type: response.type,
				redirected: response.redirected,
				url: response.url,
			};
			if (response.status !== 204) {
				response.json().then(json => {
					postMessage({
						id,
						data: {
							...res,
							json,
						}
					})
				});
			} else { 
				postMessage({
					id, data: res
				});
			}
		}).catch((ex) => {
			postMessage({ id, error: ex });
		});
};

const blob = new Blob(
	[`onmessage = ${String(onmessage)}`],
	{
		type: 'text/javascript',
	}
);

if (self.Worker) {
	worker = new Worker(
		URL.createObjectURL(blob)
	);
} else {
	worker = {
		listener: null,
		addEventListener: (eventType: any, callback: any) => {
			worker.listener = callback;
		},
		postMessage: (input: any) => {
			const { id, query } = input;
			fetch(query.url, query.request)
				.then((response) => {
					worker.listener({
						data: {
							id,
							data: response
						}
					});
				}).catch((ex) => {
					worker.listener({
						data: {
							id,
							error: ex
						}
					});
				});
		}
	}
}

worker.addEventListener('message', (event: MessageEvent<any>) => {
	const { id, data, error } = event.data;

	if (data) {
		tasks[id].promise.then(() => {
			delete tasks[id];
		});

		tasks[id].res(data);
	} else {
		tasks[id].rej(error);
	}
}, false);

export const fetchAsync = <T>(url: string | Request, request = defaultRequest) => {
	const id = `${(Math.random() * 1000)}_${Date.now()}`;
	tasks[id] = (() => {
		let res;
		let rej;
		const promise = new Promise<T>((resolve, reject) => {
			res = resolve;
			rej = reject;
		});
		return {
			promise,
			res,
			rej
		};
	})();

	const query = { url, request };

	worker.postMessage({ id, query });

	return tasks[id].promise as Promise<T>;
};
