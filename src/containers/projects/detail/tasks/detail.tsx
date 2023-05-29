import { Alert, Button, ButtonDropdown, ButtonType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaPen,
	FaTrash,
	FaUserShield,
} from 'react-icons/fa';

import {
	permissions,
	samples,
	DEFAULT_IMAGE,
	EMPLOYEE_PAGE_URL,
	PROJECT_TASK_OBJECT_PERMISSIONS_PAGE_URL,
	PROJECT_TASK_FOLLOWERS_EXPORT_URL,
	PROJECT_TASK_FOLLOWERS_IMPORT_URL,
} from '../../../../config';
import {
	Container,
	ImportForm,
	Modal,
	PersonCard,
} from '../../../../components/common';
import { TaskForm } from '../../../../components/projects';
import { useAxiosInstance } from '../../../../hooks';
import { useAlertContext, useAuthContext } from '../../../../store/contexts';
import {
	useGetProjectTaskQuery,
	useEditProjectTaskMutation,
	useAppointProjectTaskLeaderMutation,
	useDeleteProjectTaskMutation,
	useDeleteProjectTaskFollowerMutation,
	useGetUserObjectPermissionsQuery,
} from '../../../../store/queries';
import {
	CreateProjectTaskErrorResponseType,
	ProjectTaskType,
	UserObjPermType,
} from '../../../../types';
import { hasModelPermission } from '../../../../utils';

const Detail = ({
	task,
	objPerm,
}: {
	task: ProjectTaskType;
	objPerm: UserObjPermType;
}) => {
	const [bulkForm, setBulkForm] = React.useState(false);
	const [errors, setErrors] =
		React.useState<CreateProjectTaskErrorResponseType>();
	const [modalVisible, setModalVisible] = React.useState(false);

	const router = useRouter();
	const { id, task_id: taskId } = router.query as {
		id: string;
		task_id: string;
	};

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { execute, loading } = useAxiosInstance({
		onSettled(response) {
			open({
				type: response.status === 'success' ? 'success' : 'danger',
				message: response.message,
			});
		},
	});

	const { data, error, isLoading, isFetching, refetch } =
		useGetProjectTaskQuery(
			{
				projectId: id,
				id: taskId,
			},
			{
				initialData() {
					return task;
				},
			}
		);
	const { data: objPermData, refetch: objPermRefetch } =
		useGetUserObjectPermissionsQuery(
			{
				modelName: 'projects_tasks',
				objectId: taskId,
			},
			{
				initialData() {
					return objPerm;
				},
			}
		);

	const { mutate: updateTask, isLoading: editLoading } =
		useEditProjectTaskMutation({
			onSuccess() {
				open({
					type: 'success',
					message: 'Task was updated successfully',
				});
				setModalVisible(false);
			},
			onError(err) {
				setErrors((prevState) => ({
					...prevState,
					...err,
				}));
			},
		});

	const { deleteFollower } = useDeleteProjectTaskFollowerMutation({
		onSuccess() {
			open({
				type: 'success',
				message: 'Task follower was removed successfully',
			});
			setModalVisible(false);
		},
		onError(err) {
			setErrors((prevState) => ({
				...prevState,
				...err,
			}));
		},
	});

	const { appointFollower, isLoading: appointLoading } =
		useAppointProjectTaskLeaderMutation({
			onSuccess() {
				open({
					type: 'success',
					message: 'Task follower was re-appointed successfully!',
				});
			},
		});

	const { deleteTask } = useDeleteProjectTaskMutation({
		onSuccess() {
			router.back();
			open({
				type: 'success',
				message: 'Task was deleted successfully!',
			});
		},
	});

	const leaders = React.useMemo(() => {
		if (data && data.followers) {
			return data.followers.filter((follower) => follower.isLeader === true);
		}
		return [];
	}, [data]);

	const followers = React.useMemo(() => {
		if (data && data.followers) {
			return data.followers.filter((follower) => follower.isLeader === false);
		}
		return [];
	}, [data]);

	const { url, importUrl } = React.useMemo(
		() => ({
			url: PROJECT_TASK_FOLLOWERS_EXPORT_URL(id, taskId),
			importUrl: PROJECT_TASK_FOLLOWERS_IMPORT_URL(id, taskId),
		}),
		[id, taskId]
	);

	const [canEdit, canDelete, canExport, canViewObjectPermissions] =
		React.useMemo(() => {
			if (!authData) return [];
			const canEdit =
				authData.isSuperUser ||
				hasModelPermission(authData.permissions, [
					permissions.projecttask.EDIT,
				]) ||
				(objPermData && objPermData.edit);
			const canDelete =
				authData.isSuperUser ||
				hasModelPermission(authData.permissions, [
					permissions.projecttask.DELETE,
				]) ||
				(objPermData && objPermData.delete);
			const canExport =
				authData.isSuperUser ||
				(authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.projecttask.EXPORT,
					]));
			const canViewObjectPermissions =
				authData.isSuperUser ||
				(authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.permissionobject.VIEW,
					]));
			return [canEdit, canDelete, canExport, canViewObjectPermissions];
		}, [authData, objPermData]);

	return (
		<Container
			background="bg-gray-100"
			heading="Task Information"
			refresh={{
				loading: isFetching,
				onClick: () => {
					refetch();
					objPermRefetch();
				},
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
			loading={isLoading}
			title={data ? data.name : undefined}
		>
			{data && (
				<div className="w-full">
					<div className="flex flex-wrap items-center w-full sm:px-4 lg:justify-end">
						{canEdit && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									iconLeft={FaPen}
									onClick={() => {
										setBulkForm(false);
										setModalVisible(true);
									}}
									rounded="rounded-xl"
									title="Edit Task"
								/>
							</div>
						)}
						{canDelete && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
								<Button
									bg="bg-red-600 hover:bg-red-500"
									iconLeft={FaTrash}
									rounded="rounded-xl"
									title="Delete Task"
									onClick={() => deleteTask({ projectId: id, id: taskId })}
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
									link={PROJECT_TASK_OBJECT_PERMISSIONS_PAGE_URL(id, taskId)}
								/>
							</div>
						)}
					</div>
					<div className="py-2 w-full sm:px-4">
						<div className="bg-white my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									{data.name}
								</h3>
							</div>
							<div className="my-1">
								<p className="font-medium mr-1 text-gray-800 text-sm md:text-base">
									{data.followers.length}
									<span className="font-bold ml-1 text-gray-600">
										followers
									</span>
								</p>
							</div>
							<div className="my-1">
								<p className="font-semibold my-2 text-left text-sm text-gray-600 md:text-base">
									{data.description || ''}
								</p>
							</div>
						</div>

						{(canExport ||
							(canEdit && (authData?.isAdmin || authData?.isSuperUser))) && (
							<div className="flex flex-wrap items-center w-full sm:px-4 md:pl-0">
								{canExport && (
									<div className="my-2 w-full sm:px-2 sm:w-1/3 md:pl-0 md:max-w-[230px]">
										<ButtonDropdown
											dropList={[
												{
													onClick() {
														execute(url + '?type=csv');
													},
													title: 'CSV',
												},
												{
													onClick() {
														execute(url + '?type=excel');
													},
													title: 'Excel',
												},
											]}
											props={{
												caps: true,
												disabled: loading,
												iconLeft: FaCloudDownloadAlt,
												margin: 'lg:mr-6',
												padding: 'px-3 py-2 md:px-6',
												rounded: 'rounded-xl',
												title: loading ? 'Exporting...' : 'Export Followers',
											}}
										/>
									</div>
								)}
								{canEdit && (authData?.isAdmin || authData?.isSuperUser) && (
									<div className="my-2 w-full sm:px-2 sm:w-1/3 md:max-w-[230px]">
										<Button
											iconLeft={FaCloudUploadAlt}
											onClick={() => {
												setBulkForm(true);
												setModalVisible(true);
											}}
											rounded="rounded-xl"
											title="Import Followers"
										/>
									</div>
								)}
							</div>
						)}

						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									Task Leaders
								</h3>
							</div>
							{leaders.length > 0 ? (
								<div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
									{leaders.map((leader, index) => {
										const actions: ButtonType[] = [
											{
												bg: 'bg-white hover:bg-blue-100',
												border:
													'border border-primary-500 hover:border-primary-600',
												color: 'text-primary-500',
												link: EMPLOYEE_PAGE_URL(leader.member.employee.id),
												title: 'view profile',
											},
										];
										if (canEdit)
											actions.push({
												bg: 'bg-white hover:bg-red-100',
												border: 'border border-red-500 hover:border-red-600',
												color: 'text-red-500',
												onClick: () =>
													deleteFollower({
														id: leader.id,
														taskId,
														projectId: id,
													}),
												title: 'Remove',
											});
										return (
											<PersonCard
												key={index}
												title="Team Leader"
												name={
													leader.member.employee.user.firstName +
													' ' +
													leader.member.employee.user.lastName
												}
												label={leader.member.employee.job?.name || '-----'}
												image={{
													src:
														leader.member.employee.user.profile?.image?.url ||
														DEFAULT_IMAGE,
												}}
												options={
													canEdit
														? [
																{
																	bg: 'bg-white hover:bg-red-100',
																	border:
																		'border border-red-500 hover:border-red-600',
																	color: 'text-red-500',
																	disabled: appointLoading,
																	onClick: () =>
																		appointFollower({
																			decision: 'remove',
																			projectId: id,
																			taskId,
																			id: leader.id,
																			data: {
																				memberId: leader.member.id,
																				isLeader: false,
																			},
																		}),
																	title: 'Remove Leader',
																},
														  ]
														: undefined
												}
												actions={actions}
											/>
										);
									})}
								</div>
							) : (
								<p className="text-gray-700 text-sm md:text-base">
									There are currently no task leaders
								</p>
							)}
						</div>
						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									Task Followers
								</h3>
							</div>
							{followers.length > 0 ? (
								<div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
									{followers.map((follower, index) => {
										const actions: ButtonType[] = [
											{
												bg: 'bg-white hover:bg-blue-100',
												border:
													'border border-primary-500 hover:border-primary-600',
												color: 'text-primary-500',
												link: EMPLOYEE_PAGE_URL(follower.member.id),
												title: 'view profile',
											},
										];
										if (canEdit)
											actions.push({
												bg: 'bg-white hover:bg-red-100',
												border: 'border border-red-500 hover:border-red-600',
												color: 'text-red-500',
												onClick: () =>
													deleteFollower({
														id: follower.member.id,
														taskId,
														projectId: id,
													}),
												title: 'Remove',
											});
										return (
											<PersonCard
												key={index}
												title="Task follower"
												name={
													follower.member.employee.user.firstName +
													' ' +
													follower.member.employee.user.lastName
												}
												label={follower.member.employee.job?.name || '-----'}
												image={{
													src:
														follower.member.employee.user.profile?.image?.url ||
														DEFAULT_IMAGE,
												}}
												options={
													canEdit
														? [
																{
																	bg: 'bg-white hover:bg-blue-100',
																	border:
																		'border border-primary-500 hover:border-primary-600',
																	color: 'text-primary-500',
																	disabled: appointLoading,
																	onClick: () =>
																		appointFollower({
																			decision: 'appoint',
																			projectId: id,
																			taskId,
																			id: follower.member.id,
																			data: {
																				memberId: follower.member.id,
																				isLeader: true,
																			},
																		}),
																	title: 'Appoint Leader',
																},
														  ]
														: undefined
												}
												actions={actions}
											/>
										);
									})}
								</div>
							) : (
								<p className="text-gray-700 text-sm md:text-base">
									There are currently no task followers
								</p>
							)}
						</div>
					</div>
					{canEdit && (
						<Modal
							close={() => {
								setBulkForm(false);
								setModalVisible(false);
							}}
							component={
								bulkForm ? (
									canEdit && (authData?.isAdmin || authData?.isSuperUser) ? (
										<ImportForm
											onSuccess={(data) => {
												open({
													type: 'success',
													message: data.message,
												});
												setModalVisible(false);
											}}
											requirements={[
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
													value: '"2023-03-26T21:49:51.090Z"',
												},
												{
													required: false,
													title: 'created_at',
													value: '"2023-03-26T21:49:51.090Z"',
												},
											]}
											sample={samples.projectTaskFollowers}
											url={importUrl}
										/>
									) : (
										<Alert
											type="warning"
											message="Unable show import form. Please try again!"
											onClose={() => setModalVisible(false)}
										/>
									)
								) : (
									<TaskForm
										initState={data}
										editMode
										errors={errors}
										onSubmit={(form) => {
											updateTask({
												projectId: id,
												id: taskId,
												data: form,
											});
										}}
										loading={editLoading}
									/>
								)
							}
							description="Fill in the form below to update the task"
							title="Update Task"
							visible={modalVisible}
						/>
					)}
				</div>
			)}
		</Container>
	);
};

export default Detail;
