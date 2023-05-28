import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt, FaCloudUploadAlt, FaSearch } from 'react-icons/fa';

import { ExportForm } from '../common';

type TopbarProps = {
	loading: boolean;
	onSubmit: (search: string) => void;
	openModal?: () => void;
	exportData?: {
		all: string;
		filtered: string;
	};
};

const Topbar = ({ loading, onSubmit, openModal, exportData }: TopbarProps) => {
	const searchRef = React.useRef<HTMLInputElement | null>(null);

	return (
		<div className="flex flex-wrap gap-3 items-center my-2 w-full md:gap-y-5 md:justify-between">
			<form
				className="flex items-center w-full md:w-2/5"
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
						// padding: 'pl-2 pr-4 py-[0.547rem]',
						title: 'Search',
						type: 'submit',
					}}
					inputProps={{
						// bdrColor: 'border-primary-500',
						disabled: loading,
						icon: FaSearch,
						onChange: ({ target: { value } }) => {
							if (!value || value === '') onSubmit('');
						},
						placeholder: 'Search permission name',
						rounded: 'rounded-l-lg',
						type: 'search',
					}}
					ref={searchRef}
				/>
			</form>
			{exportData && (
				<div className="w-full sm:w-1/3 md:w-1/4">
					<ButtonDropdown
						component={() => <ExportForm {...exportData} />}
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
			)}
			{exportData && (
				<div className="w-full sm:w-1/3 md:w-1/4">
					<Button
						caps
						iconLeft={FaCloudUploadAlt}
						onClick={openModal}
						margin="lg:mr-6"
						padding="px-3 py-2 md:px-6"
						rounded="rounded-xl"
						title="bulk import"
					/>
				</div>
			)}
		</div>
	);
};

export default Topbar;
