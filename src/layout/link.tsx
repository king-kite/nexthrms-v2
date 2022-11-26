import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { FaArrowRight, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const similarStyle = 'capitalize cursor-pointer text-gray-100 text-sm';
const containerStyle = `flex justify-between items-center px-5 py-3 tracking-wide lg:px-3 xl:pl-4 ${similarStyle}`;
const linkStyle = `flex items-center px-9 py-2 hover:bg-primary-300 hover:border-l-4 hover:border-gray-300 lg:px-4 ${similarStyle}`;

type SimpleProps = {
	disabled?: boolean;
	onClick?: () => void;
	href: string;
	icon?: IconType;
	title: string;
	classes?: string;
};

export const SimpleLink: FC<SimpleProps> = ({
	disabled = false,
	icon: Icon,
	onClick,
	href,
	title,
	classes,
	...props
}) => {
	const { pathname } = useRouter();
	const _pathname =
		pathname !== '/' && pathname.slice(-1) !== '/' ? pathname + '/' : pathname;

	const active1 = href === _pathname;
	// TODO: Figure out active 2 later
	const active2 =
		href !== '/' && _pathname !== '/' && _pathname.startsWith(href);
	const active = active1;

	return (
		<Link key={title} href={href || '#'}>
			<a
				onClick={onClick ? onClick : undefined}
				className="block my-1 lg:my-0"
				{...props}
			>
				<div
					className={
						classes ||
						containerStyle +
							` ${
								disabled
									? 'bg-gray-600 cursor-not-allowed'
									: 'hover:bg-primary-300 hover:border-l-4 hover:border-gray-300'
							}`
					}
				>
					<div
						className={`${
							active ? 'text-secondary-500' : 'text-gray-100'
						} flex items-center`}
					>
						{Icon && (
							<span>
								<Icon
									className={`${
										active ? 'text-secondary-500' : 'text-gray-100'
									} text-tiny sm:text-sm`}
								/>
							</span>
						)}
						<span className="mx-2">{title}</span>
					</div>
					<div />
				</div>
			</a>
		</Link>
	);
};

export type ListLinkItemType = {
	href?: string;
	icon?: IconType;
	links?: ListLinkItemType[];
	onClick?: () => void;
	title: string;
	classes?: string;
};

export type ListLinkType = {
	icon?: IconType;
	onClick?: () => void;
	links: ListLinkItemType[];
	title: string;
};

export const ListLinkItem = ({
	href,
	icon,
	links,
	onClick,
	title,
	classes,
}: ListLinkItemType) => {
	return links !== undefined ? (
		<div className="px-2">
			<ListLink
				icon={icon || FaArrowRight}
				links={links}
				onClick={onClick && onClick}
				title={title}
			/>
		</div>
	) : (
		<SimpleLink
			classes={classes}
			icon={icon}
			onClick={onClick}
			href={href || '#'}
			title={title}
		/>
	);
};

export const ListLink: FC<ListLinkType> = ({
	icon: Icon,
	onClick,
	links,
	title,
}) => {
	const [visible, setVisible] = useState(false);
	const { pathname } = useRouter();

	const _pathname =
		pathname !== '/' && pathname.slice(-1) !== '/' ? pathname + '/' : pathname;

	const active1 = links.filter(({ href }) => href === _pathname)[0];
	const active2 = links.filter(
		({ href }) =>
			href && href !== '/' && _pathname !== '/' && _pathname.startsWith(href)
	)[0];

	const activeLink = active1 || active2;

	useEffect(() => {
		if (activeLink) setVisible(true);
		return () => setVisible(false);
	}, [activeLink]);

	return (
		<div className="my-1 lg:my-0">
			<div
				onClick={() => setVisible(!visible)}
				className={`${
					containerStyle +
					' hover:bg-primary-300 hover:border-l-4 hover:border-gray-300'
				} ${activeLink ? 'text-secondary-500' : ''}`}
			>
				<div className="flex items-center">
					{Icon && (
						<span>
							<Icon className="text-tiny sm:text-sm" />
						</span>
					)}
					<span className="mx-2">{title}</span>
				</div>
				<div>
					{visible ? (
						<FaChevronDown className="text-tiny" />
					) : (
						<FaChevronRight className="text-tiny" />
					)}
				</div>
			</div>
			<div
				className={`${
					visible ? 'block opacity-100 visible' : 'hidden invisible opacity-0'
				} duration-500 transform transition-all`}
			>
				{links.map(({ icon, href, links, title }, index) => (
					<ListLinkItem
						classes={linkStyle}
						onClick={onClick && onClick}
						key={index}
						href={href}
						links={links}
						icon={icon}
						title={title}
					/>
				))}
			</div>
		</div>
	);
};
