import { Button, InputButton } from '@king-kite/react-kit';
import { FC, useRef } from 'react';
import { FaCloudDownloadAlt, FaSearch, FaPlus } from 'react-icons/fa';
import { ButtonDropdown } from '../controls';
import { ExportForm } from '../common';

type TopbarProps = {
	openModal: () => void;
	loading: boolean;
	onSubmit: (search: string) => void;
	exportData: (type: 'csv' | 'excel', filter: boolean) => void;
};

const Topbar: FC<TopbarProps> = ({
	loading,
	openModal,
	onSubmit,
	exportData,
}) => {
	const searchRef = useRef<HTMLInputElement | null>(null);

	return (
		<div className="flex flex-col py-2 w-full lg:flex-row lg:items-center">
			<form
				className="flex items-center mb-3 pr-8 w-full lg:mb-0 lg:w-3/5"
				onSubmit={(e) => {
					e.preventDefault();
					if (searchRef.current) onSubmit(searchRef.current.value);
				}}
			>
				<InputButton
					buttonProps={{
						caps: true,
						disabled: loading,
						iconLeft: FaSearch,
						padding: 'pl-2 pr-4 py-[0.54rem]',
						title: 'Search',
						type: 'submit',
					}}
					inputProps={{
						bdrColor: 'border-primary-500',
						disabled: loading,
						icon: FaSearch,
						onChange: ({ target: { value } }) => {
							if (!value || value === '') onSubmit('');
						},
						placeholder: 'Search Project Name, Company, Client',
						rounded: 'rounded-l-lg',
						type: 'search',
					}}
					ref={searchRef}
				/>
			</form>
			<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
				<ButtonDropdown
					component={<ExportForm onSubmit={exportData} />}
					props={{
						caps: true,
						IconLeft: FaCloudDownloadAlt,
						margin: 'lg:mr-6',
						padding: 'px-3 py-2 md:px-6',
						rounded: 'rounded-xl',
						title: 'export',
					}}
				/>
			</div>
			<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pl-4 lg:pr-0 lg:w-1/4">
				<Button
					caps
					iconLeft={FaPlus}
					onClick={openModal}
					margin="lg:mr-6"
					padding="px-3 py-2 md:px-6"
					rounded="rounded-xl"
					title="add project"
				/>
			</div>
		</div>
	);
};

export default Topbar;
