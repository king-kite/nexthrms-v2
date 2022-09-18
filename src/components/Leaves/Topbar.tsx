import { Button, ButtonDropdown, InputButton } from '@king-kite/react-kit';
import { FC, useRef } from 'react';
import { FaCloudDownloadAlt, FaPlus, FaSearch } from 'react-icons/fa';

import FilterDropdownForm from './FilterDropdownForm';
import { ExportForm } from '../common';

type TopbarProps = {
	adminView: boolean;
	openModal: () => void;
	loading: boolean;
	dateSubmit: (form: { fromDate: string; toDate: string }) => void;
	searchSubmit?: (search: string) => void;
	exportData?: (type: 'csv' | 'excel', filter: boolean) => void;
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
			className="flex items-center mb-3 pr-8 w-full lg:mb-0 lg:w-3/5"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(search.current?.value || '');
			}}
		>
			<InputButton
				buttonProps={{
					disabled: loading,
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
					placeholder: 'Search Employee Name or E-mail.',
					rounded: 'rounded-l-lg',
					type: 'search',
				}}
				ref={search}
			/>
		</form>
	);
};

const Topbar: FC<TopbarProps> = ({
	adminView,
	loading,
	openModal,
	dateSubmit,
	searchSubmit,
	exportData,
}) => (
	<div className="flex flex-col mb-0 w-full lg:flex-row lg:items-center">
		{adminView && searchSubmit && (
			<>
				<Form onSubmit={searchSubmit} loading={loading} />
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-4 lg:pl-0 xl:w-1/4">
					<ButtonDropdown
						component={() => (
							<ExportForm
								onSubmit={exportData ? exportData : () => console.log('')}
							/>
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
			</>
		)}
		<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-4 xl:w-1/4">
			<ButtonDropdown
				component={() => (
					<FilterDropdownForm loading={loading} onSubmit={dateSubmit} />
				)}
				props={{
					title: 'Filter by Date',
				}}
			/>
		</div>
		<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pl-4 lg:pr-0 xl:w-1/4">
			<Button
				caps
				iconLeft={FaPlus}
				margin="lg:mr-6"
				onClick={openModal}
				padding="px-3 py-2 md:px-6"
				rounded="rounded-xl"
				title={adminView ? 'Add Leave' : 'Request Leave'}
			/>
		</div>
	</div>
);

export default Topbar;
