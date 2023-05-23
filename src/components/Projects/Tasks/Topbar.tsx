import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaSearch,
	FaPlus,
} from 'react-icons/fa';

import { followerRequirements, taskRequirements } from '../requirements';
import { ExportForm, ImportForm, Modal } from '../../common';
import {
	permissions,
	samples,
	PROJECT_TASKS_IMPORT_URL,
} from '../../../config';
import { useAuthContext, useAlertContext } from '../../../store/contexts';
import { hasModelPermission } from '../../../utils';

type TopbarProps = {
	openModal: () => void;
	projectId: string;
	loading: boolean;
	onSubmit: (search: string) => void;
	exportData?: {
		all: string;
		filtered: string;
	};
};

const Topbar = ({
	loading,
	projectId,
	openModal,
	onSubmit,
	exportData,
}: TopbarProps) => {
	const searchRef = React.useRef<HTMLInputElement | null>(null);
	const { data: authData } = useAuthContext();
	const { open } = useAlertContext();

	const [formType, setFormType] = React.useState<'tasks' | 'followers'>(
		'tasks'
	);
	const [modalVisible, setModalVisible] = React.useState(false);

	const { description, requirements, title, url } = React.useMemo(() => {
		const url = PROJECT_TASKS_IMPORT_URL(projectId);
		if (formType === 'tasks') {
			return {
				url,
				requirements: taskRequirements,
				title: 'Tasks',
				description:
					'Upload a valid file to import multiple tasks for multiple projects.',
			};
		}
		return {
			url: url + '?import=followers',
			requirements: followerRequirements,
			title: 'Tasks Followers',
			description:
				'Upload a valid file to import multiple task followers for multiple tasks.',
		};
	}, [formType, projectId]);

	const [canCreate, canEdit, canExport] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.projecttask.CREATE,
			  ])
			: false;
		const canEdit = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.projecttask.EDIT])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.projecttask.EXPORT,
			  ])
			: false;
		return [canCreate, canEdit, canExport];
	}, [authData]);

	return (
		<>
			<div className="flex flex-wrap items-center py-2 w-full lg:pb-0">
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
					<div className="my-3 w-full sm:px-2 sm:w-1/3 md:w-1/4 md:px-0 md:my-0 lg:px-2 lg:w-1/5">
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
				{(canCreate || canEdit) && (
					<div className="my-3 w-full sm:pl-1 sm:w-1/3 md:mb-0 md:mt-5 md:pl-0 md:w-1/4 lg:my-0 lg:w-1/5">
						<ButtonDropdown
							dropList={[
								{
									onClick: () => {
										setFormType('tasks');
										setModalVisible(true);
									},
									title: 'Tasks',
								},
								{
									onClick: () => {
										setFormType('followers');
										setModalVisible(true);
									},
									title: 'Task Followers',
								},
							]}
							props={{
								caps: true,
								iconLeft: FaCloudUploadAlt,
								margin: 'lg:mr-6',
								padding: 'px-3 py-2 md:px-6',
								rounded: 'rounded-xl',
								title: 'Import',
							}}
						/>
					</div>
				)}
			</div>
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<ImportForm
							onSuccess={(data) => {
								open({
									type: 'success',
									message: data.message,
								});
								setModalVisible(false);
							}}
							requirements={requirements}
							sample={samples.users}
							url={url}
						/>
					}
					description={description}
					title={`Bulk Import ${title}`}
					visible={modalVisible}
				/>
			)}
		</>
	);
};

export default Topbar;
