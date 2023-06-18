import Link from 'next/link';
import React from 'react';
import { FaFolder } from 'react-icons/fa';

export function BoxTitle({ title }: { title: string }) {
	return (
		<>
			<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
				{title}
			</h3>
			<div className="bg-gray-200 h-[1px] my-5 w-full">
				<div className="bg-primary-500 h-[1px] w-1/5" />
			</div>
		</>
	);
}

type ActionType = {
	bg: string;
	icon: (props: any) => JSX.Element;
	link?: string;
	onClick?: () => void;
	title: string;
};

export function BoxGrid({ actions = [] }: { actions: ActionType[] }) {
	return (
		<div className="gap-4 grid grid-cols-2 my-3 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{actions.map((action, index) => (
				<Container key={index} {...action} />
			))}
		</div>
	);
}

export function FileEmpty() {
	return (
		<div className="flex flex-col items-center">
			<span className="bg-gray-300 h-[60px] inline-flex items-center justify-center rounded-full w-[60px]">
				<FaFolder className="h-[20px] text-gray-500 w-[20px]" />
			</span>
			<p className="my-2 text-gray-700 text-sm md:text-base">No file found.</p>
		</div>
	);
}

export function BoxGridItem({
	bg,
	caps = true,
	component: Component = ({ children }) => <>{children}</>,
	icon: Icon,
	onClick,
	title,
}: ActionType & {
	caps?: boolean;
	component?: (props: { children: React.ReactNode }) => JSX.Element;
}) {
	return (
		<Component>
			<abbr
				title={title}
				className="block cursor-pointer no-underline transition transform hover:scale-105"
				onClick={onClick}
			>
				<div className="bg-white border border-gray-200 flex justify-center p-4 rounded-md hover:bg-gray-50">
					<span
						className={`${bg} h-[60px] inline-flex items-center justify-center rounded-full w-[60px]`}
					>
						<Icon className="h-[20px] text-gray-50 w-[20px]" />
					</span>
				</div>
				<p
					className={`${
						caps ? 'capitalize' : 'normal-case'
					} my-2 text-center text-gray-700 text-sm tracking-wide truncate md:text-base`}
				>
					{title}
				</p>
			</abbr>
		</Component>
	);
}

function Container(props: ActionType) {
	if (props.link)
		return (
			<Link href={props.link}>
				<a>
					<BoxGridItem {...props} />
				</a>
			</Link>
		);
	return <BoxGridItem {...props} />;
}
