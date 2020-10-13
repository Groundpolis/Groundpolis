// https://qiita.com/YusukeHirao/items/0ea538b500c7e4a74bf7

import { useEffect, useState } from 'react';

export function useWatch(interval: number) {
	const [time, updateTime] = useState(Date.now());

	useEffect(() => {
		const timeoutId: number = window.setTimeout(() => updateTime(Date.now()), interval);
		return () => {
			clearTimeout(timeoutId);
		};
	}, [time]);

	return time;
}
