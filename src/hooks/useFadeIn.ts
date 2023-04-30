import { useEffect, useRef, useState } from 'react';

const useFadeIn = <Container extends HTMLElement>(
	persist = false,
	options?: object
) => {
	const ref = useRef<Container>(null);
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		const current = ref.current;
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (persist) {
					if (entry.isIntersecting) setVisible(true);
				} else {
					setVisible(entry.isIntersecting);
				}
			});
		}, options);

		if (current) observer.observe(current);

		return () => {
			if (current) observer.unobserve(current);
		};
	}, [ref, options, persist]);

	return {
		ref,
		visible,
	};
};

export default useFadeIn;
