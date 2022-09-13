import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

const BreadcrumbLink = ({ href, title }: { href: string; title: string }) => {
	const { pathname } = useRouter();

	const active = href === pathname;

	return (
		<Link href={href || '#'}>
			<a
				className={`${
					active ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
				} cursor-pointer capitalize font-semibold my-1 text-base md:text-lg`}
			>
				{title}
			</a>
		</Link>
	);
};

const Breadcrumbs = ({
	links,
}: {
	links: { title: string; href: string }[];
}) => (
	<div className="flex flex-wrap items-center">
		{links.map((link, index) => {
			return (
				<Fragment key={index}>
					<BreadcrumbLink {...link} />
					{links.length - 1 !== index && (
						<span className="mx-2 text-gray-400 font-semibold text-base">
							/
						</span>
					)}
				</Fragment>
			);
		})}
	</div>
);

export default Breadcrumbs;
