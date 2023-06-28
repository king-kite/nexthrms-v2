import { useRouter } from 'next/router';
import React from 'react';

const Navigate = ({
	query,
	to,
	options,
}: {
	query?: any;
	options?: any;
	to: string;
}) => {
	const router = useRouter();

	React.useEffect(() => {
		router.push({
			pathname: to,
			query,
			...options,
		});
	}, [router, query, to, options]);

	return <></>;
};

export default Navigate;
