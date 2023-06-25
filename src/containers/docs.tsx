import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';

import { HOME_PAGE_URL } from '../config';

const DynamicButton = dynamic<any>(
	import('kite-react-tailwind').then((mod) => mod.Button)
);
const DynamicSwaggerUI = dynamic<any>(import('swagger-ui-react'), {
	ssr: false,
});

function DocComponent() {
	const [spec, setSpec] = React.useState<any>(undefined);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		async function getDocumentation() {
			const documentation = (await import('../documentation')).default;
			setSpec(documentation);
			setLoading(false);
		}
		getDocumentation();
	}, []);

	return (
		<div className="container mx-auto">
			<div className="flex justify-end px-2 py-4">
				<div>
					<DynamicButton
						bg="bg-[#7eaf04] hover:bg-[#5a7d03]"
						link={HOME_PAGE_URL}
						padding="px-4 py-2 md:px-8 py-4"
						renderLinkAs={({
							children,
							link,
							...props
						}: {
							link: string;
							children: React.ReactNode;
						}) => (
							<Link href={link}>
								<a {...props}>{children}</a>
							</Link>
						)}
						title="Go to Dashboard"
						titleSize="text-base md:text-lg"
					/>
				</div>
			</div>
			{loading ? (
				<h1 className="capialize text-gray-500 text-base md:text-lg">
					Loading API Documentation...
				</h1>
			) : !spec ? (
				<h1 className="capialize text-gray-500 text-base md:text-lg">
					Unable to Load API Documentation...
				</h1>
			) : (
				<DynamicSwaggerUI spec={spec} />
			)}
		</div>
	);
}

export default DocComponent;
