import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaSearch,
	FaPlus,
} from 'react-icons/fa';

import {
	fileRequirements,
	followerRequirements,
	projectRequirements,
	taskRequirements,
	teamRequirements,
} from './requirements';
import { ExportForm, ImportForm, Modal } from '../common';
import { permissions, samples, PROJECTS_IMPORT_URL } from '../../config';
import { useAuthContext, useAlertContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

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

	const [formType, setFormType] = React.useState<
		'projects' | 'files' | 'team' | 'tasks' | 'followers'
	>('projects');
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { description, requirements, sampleUrl, title, url } =
		React.useMemo(() => {
			const url = PROJECTS_IMPORT_URL;
			if (formType === 'files') {
				return {
					url: url + '?import=files',
					requirements: fileRequirements,
					title: 'Files',
					sampleUrl: samples.projectFiles,
					description:
						'Upload a valid file to import multiple files for multiple projects.',
				};
			}
			if (formType === 'team') {
				return {
					url: url + '?import=team',
					requirements: teamRequirements,
					title: 'Team',
					sampleUrl: samples.projectTeam,
					description:
						'Upload a valid file to import multiple teams for multiple projects.',
				};
			} else if (formType === 'tasks') {
				return {
					url: url + '?import=tasks',
					requirements: taskRequirements,
					title: 'Tasks',
					sampleUrl: samples.projectTasks,
					description:
						'Upload a valid file to import multiple tasks for multiple projects.',
				};
			} else if (formType === 'followers') {
				return {
					url: url + '?import=followers',
					requirements: followerRequirements,
					sampleUrl: samples.projectTaskFollowers,
					title: 'Tasks Followers',
					description:
						'Upload a valid file to import multiple task followers for multiple tasks.',
				};
			}
			return {
				url: url + '?import=projects',
				requirements: projectRequirements,
				title: 'Projects',
				sampleUrl: samples.projects,
				description: 'Upload a valid file to import multiple projects.',
			};
		}, [formType]);

	const [
		canCreateProject,
		canCreateTask,
		canCreateProjectFile,
		canEditProject,
		canEditTask,
	] = React.useMemo(() => {
		const canCreateProject = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.project.CREATE])
			: false;
		const canCreateTask = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.projecttask.CREATE,
					]))
			: false;
		const canCreateProjectFile = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.projectfile.CREATE,
					]))
			: false;
		const canEditProject = authData
			? authData.isSuperUser ||
			  (authData?.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.project.EDIT]))
			: false;
		const canEditTask = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.projecttask.EDIT,
					]))
			: false;
		return [
			canCreateProject,
			canCreateTask,
			canCreateProjectFile,
			canEditProject,
			canEditTask,
		];
	}, [authData]);

	const actionList = React.useMemo(() => {
		const list: {
			onClick: () => void;
			title: string;
		}[] = [];
		if (!authData?.isAdmin && !authData?.isSuperUser) return list;

		// Can create project
		if (canCreateProject)
			list.push({
				onClick() {
					setFormType('projects');
				},
				title: 'Projects',
			});
		if (canCreateProjectFile)
			list.push({
				onClick() {
					setFormType('files');
				},
				title: 'Files',
			});
		if (canCreateProject || canEditProject)
			list.push({
				onClick() {
					setFormType('team');
				},
				title: 'Team',
			});
		if (canCreateTask)
			list.push({
				onClick() {
					setFormType('tasks');
				},
				title: 'Tasks',
			});
		if (canCreateTask || canEditTask)
			list.push({
				onClick() {
					setFormType('followers');
				},
				title: 'Task Followers',
			});
		return list;
	}, [
		authData,
		canCreateProject,
		canCreateTask,
		canCreateProjectFile,
		canEditProject,
		canEditTask,
	]);

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
							// padding: 'pl-2 pr-4 py-[0.54rem]',
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
							placeholder: 'Search project name, company, client',
							rounded: 'rounded-l-lg',
							type: 'search',
						}}
						ref={searchRef}
					/>
				</form>
				{exportData && authData?.isAdmin && (
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
				{canCreateProject && (
					<div className="my-3 w-full sm:px-2 sm:w-1/3 md:w-1/4 md:px-0 md:my-0 lg:px-2 lg:w-1/5">
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
				)}
				{actionList.length > 0 && (
					<div className="my-3 w-full sm:pl-1 sm:w-1/3 md:mb-0 md:mt-5 md:pl-0 md:w-1/4 lg:my-0 lg:w-1/5">
						<ButtonDropdown
							dropList={actionList.map((action) => ({
								...action,
								onClick: () => {
									action.onClick();
									setModalVisible(true);
								},
							}))}
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
			{actionList.length > 0 && (
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
							sample={sampleUrl}
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
