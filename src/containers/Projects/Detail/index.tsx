import { Button } from 'kite-react-tailwind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { FaPen, FaTasks, FaTrash, FaUsers, FaUserShield } from 'react-icons/fa';

import { Container, Modal } from '../../../components/common';
import {
	Form,
	ProjectDetail,
	ProjectFiles,
	ProjectImages,
} from '../../../components/Projects';
import {
	permissions,
	PROJECT_TASKS_PAGE_URL,
	PROJECT_TEAM_PAGE_URL,
	PROJECT_OBJECT_PERMISSIONS_PAGE_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useGetProjectQuery,
	useGetProjectFilesQuery,
	useEditProjectMutation,
	useDeleteProjectMutation,
	useGetUserObjectPermissionsQuery,
} from '../../../store/queries';
import {
	CreateProjectErrorResponseType,
	CreateProjectQueryType,
	GetProjectFilesResponseType,
	ProjectType,
	SuccessResponseType,
	UserObjPermType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';

const Detail = ({
	objPerm,
	projectFiles,
	project,
}: {
	objPerm: UserObjPermType;
	project: SuccessResponseType<ProjectType>['data'];
	projectFiles: GetProjectFilesResponseType['data'];
}) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = useState(false);
	const [formErrors, setFormErrors] =
		useState<CreateProjectErrorResponseType>();

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { data, error, refetch, isLoading, isFetching } = useGetProjectQuery(
		{ id },
		{
			initialData() {
				return project;
			},
		}
	);
	const { data: objPermData, refetch: objPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'projects',
				objectId: id,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);
	const { data: files, refetch: filesRefetch } = useGetProjectFilesQuery(
		{
			id,
			onError() {
				showAlert({
					type: 'danger',
					message: 'Sorry. Unable to get project files!',
				});
			},
		},
		{
			initialData() {
				return projectFiles;
			},
		}
	);

	const { mutate: updateProject, isLoading: editLoading } =
		useEditProjectMutation({
			onSuccess() {
				showAlert({
					message: 'Project updated successfully!',
					type: 'success',
				});
				setModalVisible(false);
			},
			onError(err) {
				setFormErrors((prevState) => ({ ...prevState, ...err }));
			},
		});
	const { deleteProject, isLoading: delLoading } = useDeleteProjectMutation({
		onSuccess() {
			router.back();
		},
	});

	const [
		canEdit,
		canDelete,
		canViewObjectPermissions,
		canViewTasks,
		canViewTeam,
	] = useMemo(() => {
		if (!authData) return [];
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.project.EDIT]) ||
			(objPermData && objPermData.edit);
		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.project.DELETE]) ||
			(objPermData && objPermData.delete);
		const canViewObjectPermissions =
			authData.isSuperUser ||
			(authData.isAdmin &&
				hasModelPermission(authData.permissions, [
					permissions.permissionobject.VIEW,
				]));
		const canViewTasks =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.projecttask.VIEW,
			]) ||
			!!authData.objPermissions.find(
				(perm) =>
					perm.modelName === 'projects_tasks' && perm.permission === 'VIEW'
			);
		const canViewTeam =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.projectteam.VIEW,
			]) ||
			!!authData.objPermissions.find(
				(perm) =>
					perm.modelName === 'projects_team' && perm.permission === 'VIEW'
			);
		return [
			canEdit,
			canDelete,
			canViewObjectPermissions,
			canViewTasks,
			canViewTeam,
		];
	}, [authData, objPermData]);

	return (
		<Container
			background="bg-gray-100 overflow-y-hidden"
			heading="Project Information"
			loading={isLoading}
			refresh={{
				onClick: () => {
					refetch();
					filesRefetch();
					objPermRefetch();
				},
				loading: isFetching,
			}}
			icon
			error={
				error
					? {
							statusCode:
								(error as any).response?.status || (error as any).status || 500,
							title:
								(error as any)?.response?.data?.message ||
								(error as any).message,
					  }
					: undefined
			}
		>
			{data && (
				<>
					<div className="flex flex-wrap items-center w-full lg:justify-end">
						{canViewTasks && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									iconLeft={FaTasks}
									rounded="rounded-xl"
									title="Manage Tasks"
									renderLinkAs={(props) => {
										return (
											<Link href={props.link || '#'}>
												<a {...props}>{props.children}</a>
											</Link>
										);
									}}
									link={PROJECT_TASKS_PAGE_URL(id)}
								/>
							</div>
						)}
						{canViewTeam && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									iconLeft={FaUsers}
									rounded="rounded-xl"
									title="Manage Team"
									renderLinkAs={(props) => {
										return (
											<Link href={props.link || '#'}>
												<a {...props}>{props.children}</a>
											</Link>
										);
									}}
									link={PROJECT_TEAM_PAGE_URL(id)}
								/>
							</div>
						)}
						{canEdit && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									iconLeft={FaPen}
									onClick={() => setModalVisible(true)}
									rounded="rounded-xl"
									disabled={editLoading}
									title={editLoading ? 'Editing Project...' : 'Edit Project'}
								/>
							</div>
						)}
						{canDelete && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									bg="bg-red-600 hover:bg-red-500"
									iconLeft={FaTrash}
									rounded="rounded-xl"
									title={delLoading ? 'Deleting Project...' : 'Delete Project'}
									disabled={delLoading}
									onClick={() => deleteProject(id)}
								/>
							</div>
						)}
						{canViewObjectPermissions && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									bg="bg-gray-500 hover:bg-gray-400"
									iconLeft={FaUserShield}
									rounded="rounded-xl"
									title="Object Permissions"
									link={PROJECT_OBJECT_PERMISSIONS_PAGE_URL(id)}
								/>
							</div>
						)}
					</div>
					<div className="flex flex-col items-center lg:flex-row lg:items-start">
						<div className="py-2 w-full sm:px-4 lg:pl-0 lg:w-2/3">
							<div className="bg-white p-4 rounded-md shadow-lg">
								<div className="my-2">
									<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
										{data.name}
									</h3>
								</div>
								<div className="my-1">
									<p className="font-semibold my-2 text-left text-sm text-gray-600 md:text-base">
										{data.description}
									</p>
								</div>
							</div>

							{files && (
								<>
									<ProjectImages
										files={files.result.filter(
											(file) => file.type.split('/')[0] === 'image'
										)}
									/>

									<ProjectFiles
										files={files.result.filter(
											(file) => file.type.split('/')[0] !== 'image'
										)}
									/>
								</>
							)}
						</div>

						<ProjectDetail
							canEdit={canEdit}
							data={data}
							progress={data?.progress || 0}
						/>
					</div>
					{canEdit && (
						<Modal
							close={() => setModalVisible(false)}
							component={
								<Form
									initState={data}
									editMode
									errors={formErrors}
									loading={editLoading}
									onSubmit={(form: CreateProjectQueryType) => {
										if (data) updateProject({ id: data.id, data: form });
									}}
								/>
							}
							keepVisible
							description="Fill in the form below to edit this project"
							title="Edit Project"
							visible={modalVisible}
						/>
					)}
				</>
			)}
		</Container>
	);
};

export default Detail;
