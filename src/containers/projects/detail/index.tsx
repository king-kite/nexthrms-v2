import { Button } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { FaPen, FaTasks, FaTrash, FaUsers, FaUserShield } from 'react-icons/fa';

import Container from '../../../components/common/container';
import ProjectDetail from '../../../components/projects/details/project-detail';
import {
	permissions,
	PROJECT_TASKS_PAGE_URL,
	PROJECT_TEAM_PAGE_URL,
	PROJECT_OBJECT_PERMISSIONS_PAGE_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useGetUserObjectPermissionsQuery } from '../../../store/queries/permissions';
import {
	useGetProjectQuery,
	useGetProjectFilesQuery,
	useEditProjectMutation,
	useDeleteProjectMutation,
} from '../../../store/queries/projects';
import type {
	CreateProjectErrorResponseType,
	CreateProjectQueryType,
	ProjectType,
	SuccessResponseType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';

const DynamicForm = dynamic<any>(
	() => import('../../../components/projects/form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">Loading Form...</p>
		),
		ssr: false,
	}
);
const DynamicProjectImages = dynamic<any>(
	() => import('../../../components/projects/details/project-images').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">Loading Form...</p>
		),
		ssr: false,
	}
);
const DynamicProjectFiles = dynamic<any>(
	() => import('../../../components/projects/details/project-files').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">Loading Form...</p>
		),
		ssr: false,
	}
);
const DynamicImportExport = dynamic<any>(
	() => import('../../../components/projects/details/import-export').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">Loading Form...</p>
		),
		ssr: false,
	}
);
const DynamicModal = dynamic<any>(
	() => import('../../../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);

const Detail = ({ project }: { project: SuccessResponseType<ProjectType>['data'] }) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = React.useState(false);
	const [formErrors, setFormErrors] = React.useState<CreateProjectErrorResponseType>();

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
	const { data: objPermData, refetch: objPermRefetch } = useGetUserObjectPermissionsQuery({
		modelName: 'projects',
		objectId: id,
	});
	const { data: files, refetch: filesRefetch } = useGetProjectFilesQuery({
		id,
		onError() {
			showAlert({
				type: 'danger',
				message: 'Sorry. Unable to get project files!',
			});
		},
	});

	const { mutate: updateProject, isLoading: editLoading } = useEditProjectMutation({
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

	const [canEdit, canDelete, canViewObjectPermissions, canViewTasks] = React.useMemo(() => {
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
				hasModelPermission(authData.permissions, [permissions.permissionobject.VIEW]));
		const canViewTasks =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.projecttask.VIEW]) ||
			!!authData.objPermissions.find(
				(perm) => perm.modelName === 'projects_tasks' && perm.permission === 'VIEW'
			);
		return [canEdit, canDelete, canViewObjectPermissions, canViewTasks];
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
							statusCode: (error as any).response?.status || (error as any).status || 500,
							title: (error as any)?.response?.data?.message || (error as any).message,
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
									title="Tasks"
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
						<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
							<Button
								iconLeft={FaUsers}
								rounded="rounded-xl"
								title="Team"
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
									title="Permissions"
									renderLinkAs={(props) => {
										return (
											<Link href={props.link || '#'}>
												<a {...props}>{props.children}</a>
											</Link>
										);
									}}
									link={PROJECT_OBJECT_PERMISSIONS_PAGE_URL(id)}
								/>
							</div>
						)}
					</div>
					<div className="flex flex-col items-center lg:flex-row lg:items-start">
						<div className="py-2 w-full sm:px-4 lg:pl-0 lg:w-2/3">
							<div className="bg-white p-4 rounded-md shadow-lg">
								<div className="my-2">
									<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
										{data.name}
									</h3>
								</div>
								<div className="my-1">
									<p className="font-semibold my-2 text-left text-sm text-gray-600 md:text-base">
										{data.description}
									</p>
								</div>
							</div>

							{(authData?.isAdmin || authData?.isSuperUser) && <DynamicImportExport id={id} />}

							{files && (
								<>
									<DynamicProjectImages
										files={files.result.filter((file) => file.file.type.split('/')[0] === 'image')}
									/>

									<DynamicProjectFiles
										files={files.result.filter((file) => file.file.type.split('/')[0] !== 'image')}
									/>
								</>
							)}
						</div>

						<ProjectDetail canEdit={canEdit} data={data} progress={data?.progress || 0} />
					</div>
					{canEdit && (
						<DynamicModal
							close={() => setModalVisible(false)}
							component={
								<DynamicForm
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
