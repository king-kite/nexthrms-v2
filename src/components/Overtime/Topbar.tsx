import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt, FaPlus, FaSearch } from 'react-icons/fa';

import FilterDropdownForm from './FilterDropdownForm';
import { ExportForm } from '../common';
import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

type TopbarProps = {
	adminView: boolean;
	openModal: () => void;
	loading: boolean;

	dateForm: { from?: string; to?: string } | undefined;
	setDateForm: React.Dispatch<
		React.SetStateAction<{ from?: string; to?: string } | undefined>
	>;

	searchSubmit?: (search: string) => void;
	exportData?: (type: 'csv' | 'excel', filter: boolean) => void;
	exportLoading?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({
	adminView,
	loading,
	openModal,
	dateForm,
	setDateForm,
	searchSubmit,
	exportData,
	exportLoading,
}) => {
	const { data: authData } = useAuthContext();

	const [canCreate, canExport] = React.useMemo(() => {
		if (!authData) return [false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.overtime.CREATE, permissions.overtime.REQUEST]);
		const canExport =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.overtime.EXPORT]);
		return [canCreate, canExport];
	}, [authData]);

	return (
		<div className="flex flex-col mb-0 w-full lg:flex-row lg:items-center">
			{adminView && searchSubmit && (
				<>
					<Form onSubmit={searchSubmit} loading={loading} />
					{canExport && (
						<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-4 lg:pl-0 xl:w-1/4">
							<ButtonDropdown
								component={() => (
									<ExportForm
										onSubmit={exportData ? exportData : undefined}
										loading={exportLoading}
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
					)}
				</>
			)}
			<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-4 xl:w-1/4">
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
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pl-4 lg:pr-0 xl:w-1/4">
					<Button
						caps
						iconLeft={FaPlus}
						margin="lg:mr-6"
						onClick={openModal}
						padding="px-3 py-2 md:px-6"
						rounded="rounded-xl"
						title={adminView ? 'Add Overtime' : 'Request Overtime'}
					/>
				</div>
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
			className="flex items-center mb-3 pr-8 w-full lg:mb-0 lg:w-3/5"
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
