import Head from 'next/head';
import { TITLE } from '../../config';

function Title({ title }: { title: string }) {
	return (
		<Head>
			<title>{title ? `${title} - ${TITLE}` : TITLE}</title>
		</Head>
	);
}

export default Title;
