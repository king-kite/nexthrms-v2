import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import { Dispatch, FC, SetStateAction, useRef } from 'react';
import { FaCloudDownloadAlt, FaPlus, FaSearch } from 'react-icons/fa';

import { ExportForm, FilterDateForm } from '../common';

type TopbarProps = {
	openModal: () => void;
	loading: boolean;
	dateQuery?: { from: string; to: string };
	setDateQuery: Dispatch<SetStateAction<{ from: string; to: string }>>;
	searchSubmit: (search: string) => void;
	exportData?: (type: 'csv' | 'excel', filter: boolean) => void;
	exportLoading?: boolean;
};

const Form = ({
	loading,
	onSubmit,
}: {
	loading: boolean;
	onSubmit: (search: string) => void;
}) => {
	const search = useRef<HTMLInputElement | null>(null);

	return (
		<form
			className="flex items-center mb-3 w-full lg:mb-6 lg:pr-6 lg:w-2/3"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(search.current?.value || '');
			}}
		>
			<InputButton
				buttonProps={{
					disabled: loading,
					iconLeft: FaSearch,
					padding: 'pl-2 pr-4 py-[0.548rem] lg:px-6',
					title: 'Search',
					type: 'submit',
				}}
				inputProps={{
					bdrColor: 'border-primary-500',
					disabled: loading,
					icon: FaSearch,
					onChange: (e) => {
						if (e.target.value === '') onSubmit('');
					},
					placeholder: 'Search employee name or e-mail.',
					rounded: 'rounded-l-lg',
					type: 'search',
				}}
				ref={search}
			/>
		</form>
	);
};

const Topbar: FC<TopbarProps> = ({
	loading,
	openModal,
	dateQuery,
	setDateQuery,
	searchSubmit,
	exportData,
	exportLoading,
}) => (
	<div className="flex flex-wrap mb-0 w-full sm:flex-row sm:items-center">
		<Form onSubmit={searchSubmit} loading={loading} />
		<div className="my-3 pr-4 w-full sm:w-1/3 lg:mb-6 lg:mt-0 lg:pr-4 lg:pl-0 lg:w-1/4">
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
		<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-4 lg:w-1/4">
			<ButtonDropdown
				component={() => (
					<FilterDateForm
						data={dateQuery}
						loading={loading}
						setDateQuery={setDateQuery}
					/>
				)}
				props={{
					title: 'Filter by Date',
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
