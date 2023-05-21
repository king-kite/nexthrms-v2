import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaSearch,
	FaPlus,
} from 'react-icons/fa';

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
				requirements: [
					{
						required: false,
						title: 'id',
						value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
					},
					{
						title: 'name',
						value: 'Draft a plan.',
					},
					{
						title: 'description',
						value: 'This is the description to go about the plan.',
					},
					{
						title: 'due_date',
						value: '2023-03-26T21:49:51.090Z',
					},
					{
						required: false,
						title: 'completed',
						value: 'true',
					},
					{
						required: false,
						title: 'priority',
						value: 'HIGH',
					},
					{
						title: 'project_id',
						value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
					},
					{
						required: false,
						title: 'updated_at',
						value: '2023-03-26T21:49:51.090Z',
					},
					{
						required: false,
						title: 'created_at',
						value: '2023-03-26T21:49:51.090Z',
					},
				],
				title: 'Tasks',
				description:
					'Upload a valid file to import multiple tasks for multiple projects.',
			};
		}
		return {
			url: url + '?import=followers',
			requirements: [
				{
					required: false,
					title: 'id',
					value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
				},
				{
					title: 'is_leader',
					value: 'true',
				},
				{
					title: 'task_id',
					value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
				},
				{
					title: 'member_id',
					value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
				},
				{
					required: false,
					title: 'updated_at',
					value: '2023-03-26T21:49:51.090Z',
				},
				{
					required: false,
					title: 'created_at',
					value: '2023-03-26T21:49:51.090Z',
				},
			],
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
				{(canCreate || canEdit) && (
					<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pl-4 lg:pr-0 lg:w-1/4">
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
								title: 'Bulk Import',
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
