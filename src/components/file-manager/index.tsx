export { default as Breadcrumbs } from './breadcrumbs';
export { default as FileComponent } from './file';
export { default as Files } from './files';
export { default as Folder } from './folder';
export { default as FileTable } from './table';
export { default as Topbar } from './topbar';

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

export function BoxGrid({
	actions = [],
}: {
	actions: {
		bg: string;
		icon: (props: any) => JSX.Element;
		onClick?: () => void;
		title: string;
	}[];
}) {
	return (
		<div className="gap-4 grid grid-cols-2 my-3 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{actions.map(({ bg, icon: Icon, onClick, title }, index) => (
				<abbr
					key={index}
					className="block cursor-pointer no-underline transition transform hover:scale-105"
					onClick={onClick}
				>
					<div className="bg-white border border-gray-200 flex justify-center p-4 rounded-md hover:bg-gray-50">
						<span
							className={`${bg} h-[60px] inline-flex items-center justify-center rounded-full text-primary-700 w-[60px]`}
						>
							<Icon className="h-[20px] text-gray-50 w-[20px]" />
						</span>
					</div>
					<p className="capitalize my-2 text-center text-gray-700 text-sm tracking-wide md:text-base">
						{title}
					</p>
				</abbr>
			))}
		</div>
	);
}
