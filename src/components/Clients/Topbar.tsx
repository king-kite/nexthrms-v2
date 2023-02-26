import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import { FC, useRef } from 'react';
import { FaCloudDownloadAlt, FaSearch, FaUserPlus } from 'react-icons/fa';

import { ExportForm } from '../common';
import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

type TopbarProps = {
	openModal: () => void;
	loading: boolean;
	onSubmit: (search: string) => void;
	exportData: (type: 'csv' | 'excel', filter: boolean) => void;
	exportLoading?: boolean;
};

const Topbar: FC<TopbarProps> = ({
	exportData,
	exportLoading,
	loading,
	openModal,
	onSubmit,
}) => {
	const searchRef = useRef<HTMLInputElement | null>(null);
	const { data: authData } = useAuthContext();

	const canView = authData
		? authData.isSuperUser ||
		  hasModelPermission(authData.permissions, [permissions.client.VIEW])
		: false;
	const canCreate = authData
		? authData.isSuperUser ||
		  hasModelPermission(authData.permissions, [permissions.client.CREATE])
		: false;
	const canExport = authData
		? authData.isSuperUser ||
		  hasModelPermission(authData.permissions, [permissions.client.EXPORT])
		: false;

	return (
		<div className="flex flex-col my-2 w-full lg:flex-row lg:items-center">
			{canView && (
				<form
					className="flex items-center mb-3 pr-8 w-full lg:mb-0 lg:w-3/5"
					onSubmit={(e) => {
						e.preventDefault();
						if (searchRef.current) {
							onSubmit(searchRef.current.value);
						}
					}}
				>
					<InputButton
						ref={searchRef}
						buttonProps={{
							disabled: loading,
							padding: 'pl-2 pr-4 py-[0.54rem]',
							title: 'Search',
							type: 'submit',
						}}
						inputProps={{
							bdrColor: 'border-primary-500',
							disabled: loading,
							icon: FaSearch,
							onChange: ({ target: { value } }) => {
								if (value === '') onSubmit('');
							},
							placeholder:
								'Search contact person name or e-mail, company name...',
							rounded: 'rounded-l-lg',
							type: 'search',
						}}
					/>
				</form>
			)}
			{canCreate && (
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
					<Button
						caps
						iconLeft={FaUserPlus}
						onClick={openModal}
						margin="lg:mr-6"
						padding="px-3 py-2 md:px-6"
						rounded="rounded-xl"
						title="add client"
					/>
				</div>
			)}
			{canExport && (
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
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
			)}
		</div>
	);
};

export default Topbar;
