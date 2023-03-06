import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import { FC, useMemo, useRef } from 'react';
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
	loading,
	openModal,
	onSubmit,
	exportData,
	exportLoading = false,
}) => {
	const searchRef = useRef<HTMLInputElement | null>(null);
	const { data: authData } = useAuthContext();

	const [canView, canCreate, canExport] = useMemo(() => {
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.user.VIEW]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) => perm.modelName === 'users' && perm.permission === 'VIEW'
			  )
			: false;
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.user.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.user.EXPORT])
			: false;
		return [canView, canCreate, canExport];
	}, [authData]);

	return (
		<div className="flex flex-col my-2 w-full lg:flex-row lg:items-center">
			{canView && (
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
							placeholder: "Search user's name, e-mail",
							rounded: 'rounded-l-lg',
							type: 'search',
						}}
						ref={searchRef}
					/>
				</form>
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
			{canCreate && (
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pl-4 lg:pr-0 lg:w-1/4">
					<Button
						caps
						iconLeft={FaUserPlus}
						onClick={openModal}
						margin="lg:mr-6"
						padding="px-3 py-2 md:px-6"
						rounded="rounded-xl"
						title="add user"
					/>
				</div>
			)}
		</div>
	);
};

export default Topbar;
