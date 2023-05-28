import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaPlus,
	FaSearch,
} from 'react-icons/fa';

import FilterDropdownForm from './filter-dropdown-form';
import { ExportForm } from '../common';
import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

type TopbarProps = {
	adminView: boolean;
	openModal: (bulk?: boolean) => void;
	loading: boolean;

	dateForm: { from?: string; to?: string } | undefined;
	setDateForm: React.Dispatch<
		React.SetStateAction<{ from?: string; to?: string } | undefined>
	>;

	searchSubmit?: (search: string) => void;
	exportData?: {
		all: string;
		filtered: string;
	};
};

const Topbar: React.FC<TopbarProps> = ({
	adminView,
	loading,
	openModal,
	dateForm,
	setDateForm,
	searchSubmit,
	exportData,
}) => {
	const { data: authData } = useAuthContext();

	const [canCreate] = React.useMemo(() => {
		if (!authData) return [false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.overtime.CREATE,
				permissions.overtime.REQUEST,
			]);
		return [canCreate];
	}, [authData]);

	return (
		<div className="flex flex-wrap gap-3 w-full md:gap-4">
			{adminView && searchSubmit && (
				<>
					<Form onSubmit={searchSubmit} loading={loading} />
					{exportData && (
						<div className="w-full sm:w-[31%] md:w-[25%]">
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
				</>
			)}
			<div className="w-full sm:w-[31%] md:w-[25%]">
				<ButtonDropdown
					component={() => (
						<FilterDropdownForm
							loading={loading}
							form={dateForm}
							setForm={setDateForm}
						/>
					)}
					props={{
						title: 'Filter by Date',
					}}
				/>
			</div>
			{canCreate && (
				<>
					<div className="w-full sm:w-[31%] md:w-[25%]">
						<Button
							caps
							iconLeft={FaPlus}
							margin="lg:mr-6"
							onClick={() => openModal(false)}
							padding="px-3 py-2 md:px-6"
							rounded="rounded-xl"
							title={adminView ? 'Add Overtime' : 'Request Overtime'}
						/>
					</div>
					{adminView && (
						<div className="w-full sm:w-1/3 md:w-[25%]">
							<Button
								caps
								iconLeft={FaCloudUploadAlt}
								margin="lg:mr-6"
								onClick={() => openModal(true)}
								padding="px-3 py-2 md:px-6"
								rounded="rounded-xl"
								title="Import"
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
};

const Form = ({
	loading,
	onSubmit,
}: {
	loading: boolean;
	onSubmit: (search: string) => void;
}) => {
	const search = React.useRef<HTMLInputElement | null>(null);

	return (
		<form
			className="w-full sm:w-2/3 md:w-[45%]"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(search.current?.value || '');
			}}
		>
			<InputButton
				buttonProps={{
					disabled: loading,
					// padding: 'pl-2 pr-4 py-[0.54rem]',
					title: 'Search',
					type: 'submit',
				}}
				inputProps={{
					// bdrColor: 'border-primary-500',
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

export default Topbar;
