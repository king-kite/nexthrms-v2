import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import { FaCloudDownloadAlt, FaSearch, FaPlus } from 'react-icons/fa';

import { ExportForm } from '../../common';
import { permissions } from '../../../config';
import { useAuthContext } from '../../../store/contexts';
import { hasModelPermission } from '../../../utils';

type TopbarProps = {
	openModal: () => void;
	loading: boolean;
	onSubmit: (search: string) => void;
	exportData?: {
		all: string;
		filtered: string;
	};
};

const Topbar = ({ loading, openModal, onSubmit, exportData }: TopbarProps) => {
	const searchRef = React.useRef<HTMLInputElement | null>(null);
	const { data: authData } = useAuthContext();

	const [canCreate, canExport] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.project.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.project.EXPORT])
			: false;
		return [canCreate, canExport];
	}, [authData]);

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
						title: 'Search',
						type: 'submit',
					}}
					inputProps={{
						disabled: loading,
						icon: FaSearch,
						onChange: ({ target: { value } }) => {
							if (!value || value === '') onSubmit('');
						},
						placeholder: 'Search task name, leaders or followers',
						rounded: 'rounded-l-lg',
						type: 'search',
					}}
					ref={searchRef}
				/>
			</form>
			{canExport && (
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
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
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pl-4 lg:pr-0 lg:w-1/4">
					<Button
						caps
						iconLeft={FaPlus}
						onClick={openModal}
						margin="lg:mr-6"
						padding="px-3 py-2 md:px-6"
						rounded="rounded-xl"
						title="add task"
					/>
				</div>
			)}
		</div>
	);
};

export default Topbar;
