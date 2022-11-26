import React from 'react';

type IntervalOptions = {
	status?: 'play' | 'pause';
};

function useInterval(
	callback: () => void,
	delay: number = 1000,
	options?: IntervalOptions
) {
	const savedCallback = React.useRef<() => void>();
	const [interval, setUseInterval] = React.useState<any>();
	const [status, setStatus] = React.useState<'pause' | 'play'>(
		options?.status || 'play'
	);

	const toggleInterval = React.useCallback((status: 'pause' | 'play') => {
		setStatus(status);
	}, []);

	const removeInterval = React.useCallback(() => {
		clearInterval(interval);
	}, [interval]);

	// Remember the latest callback.
	React.useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	React.useEffect(() => {
		function tick() {
			if (savedCallback.current) savedCallback.current();
		}
		if (delay !== null && status === 'play') {
			const id = setInterval(tick, delay);
			setUseInterval(id);
			return () => clearInterval(id);
		}
	}, [delay, status]);

	return {
		removeInterval,
		status,
		toggleInterval,
	};
}

/*
function useInterval(callback: () => void, delay: number = 1000) {
	const savedCallback = React.useRef<any>();

	// Remember the latest callback.
	React.useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	React.useEffect(() => {
		function tick() {
			savedCallback.current();
		}
		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
}
*/

export default useInterval;
