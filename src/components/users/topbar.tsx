import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaSearch,
	FaUserPlus,
} from 'react-icons/fa';

import { ExportForm } from '../common';
import { permissions } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

type TopbarProps = {
	openModal: (bulk?: boolean) => void;
	loading: boolean;
	onSubmit: (search: string) => void;
	exportData?: { filtered?: string; all?: string };
};

const Topbar = ({ loading, openModal, onSubmit, exportData }: TopbarProps) => {
	const searchRef = React.useRef<HTMLInputElement | null>(null);
	const { data: authData } = useAuthContext();

	const [canView, canCreate] = React.useMemo(() => {
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
		return [canView, canCreate];
	}, [authData]);

	return (
		<div className="flex flex-wrap items-center py-2 w-full lg:pb-0">
			{canView && (
				<form
					className="flex items-center mb-3 w-full md:mb-0 md:w-1/2 lg:mb-0 lg:w-2/5"
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
			{exportData && (
				<div className="my-3 w-full sm:pr-1 sm:w-1/3 md:w-1/4 md:my-0 md:px-3 lg:pl-2 lg:pr-0 lg:w-1/5">
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
			{canCreate && (
				<>
					<div className="my-3 w-full sm:px-2 sm:w-1/3 md:w-1/4 md:px-0 md:my-0 lg:px-2 lg:w-1/5">
						<Button
							caps
							iconLeft={FaUserPlus}
							onClick={() => openModal(false)}
							margin="lg:mr-6"
							padding="px-3 py-2 md:px-6"
							rounded="rounded-xl"
							title="add user"
						/>
					</div>
					<div className="my-3 w-full sm:pl-1 sm:w-1/3 md:mb-0 md:mt-5 md:pl-0 md:w-1/4 lg:my-0 lg:w-1/5">
						<Button
							caps
							iconLeft={FaCloudUploadAlt}
							onClick={() => openModal(true)}
							margin="lg:mr-6"
							padding="px-3 py-2 md:px-6"
							rounded="rounded-xl"
							title="bulk import"
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default Topbar;
