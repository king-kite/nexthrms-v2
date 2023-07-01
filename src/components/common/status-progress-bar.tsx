import React from 'react';

import useFadeIn from '../../hooks/useFadeIn';

const StatusProgressBar = ({
	background,
	border = 'border',
	borderColor = 'border-gray-300',
	containerColor = 'bg-gray-100',
	title,
	result,
	value,
}: {
	border?: string;
	borderColor?: string;
	background: string;
	containerColor?: string;
	title: string;
	result: number;
	value: number | string | React.ReactNode;
}) => {
	const [width, setWidth] = React.useState(0);
	const { ref, visible } = useFadeIn<HTMLDivElement>(true);

	React.useEffect(() => {
		if (visible) setWidth(result * 100);
	}, [result, visible]);

	return (
		<div
			className={`${border} ${borderColor} ${containerColor} px-3 py-2 rounded-lg w-full`}
		>
			<div className="flex items-center justify-between my-1 w-full">
				<span className="font-semibold inline-block text-gray-900 text-sm">
					{title}
				</span>
				{['number', 'string'].includes(typeof value) ? (
					<span className="font-semibold inline-block text-gray-900 text-sm">
						{value}
					</span>
				) : (
					value
				)}
			</div>
			<div className="bg-gray-400 h-1 my-1 rounded-lg w-full">
				<div
					ref={ref}
					className={`${background} duration-1000 h-full rounded-lg transform transition-all`}
					style={{ width: `${width < 0 ? 0 : width > 100 ? 100 : width}%` }}
				/>
			</div>
		</div>
	);
};

export default StatusProgressBar;
