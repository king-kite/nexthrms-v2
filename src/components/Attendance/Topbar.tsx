import { Button, ButtonDropdown } from 'kite-react-tailwind';
import { FC } from 'react';
import { FaCloudDownloadAlt, FaPlus } from 'react-icons/fa';

import { ExportForm } from '../common';

type TopbarProps = {
	openModal: () => void;
	exportData?: (type: 'csv' | 'excel', filter: boolean) => void;
	exportLoading?: boolean;
};

const Topbar: FC<TopbarProps> = ({ openModal, exportData, exportLoading }) => (
	<div className="flex flex-wrap justify-end mb-0 w-full sm:flex-row sm:items-center">
		<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-4 lg:pl-0 lg:w-1/4">
			<ButtonDropdown
				component={() => (
					<ExportForm loading={exportLoading} onSubmit={exportData} />
				)}
				props={{
					caps: true,
					iconLeft: FaCloudDownloadAlt,
					margin: 'lg:mr-6',
					padding: 'px-3 py-2 md:px-6',
					rounded: 'rounded-xl',
					title: 'export',
				}}
			/>
		</div>
		<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-0 lg:w-1/4">
			<Button
				iconLeft={FaPlus}
				margin="lg:mr-6"
				onClick={openModal}
				padding="px-3 py-2 md:px-6"
				rounded="rounded-xl"
				title="Add Attendance"
			/>
		</div>
	</div>
);

export default Topbar;
