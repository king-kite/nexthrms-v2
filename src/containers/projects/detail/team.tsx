import { Button, ButtonDropdown, ButtonType } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React from 'react';
import { FaCloudDownloadAlt, FaCloudUploadAlt } from 'react-icons/fa';

import Container from '../../../components/common/container';
import PersonCard from '../../../components/common/person-card';
import {
	permissions,
	samples,
	CLIENT_PAGE_URL,
	DEFAULT_IMAGE,
	EMPLOYEE_PAGE_URL,
	PROJECT_TEAM_EXPORT_URL,
	PROJECT_TEAM_IMPORT_URL,
} from '../../../config';
import { useAxiosInstance } from '../../../hooks';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import { useGetUserObjectPermissionsQuery } from '../../../store/queries/permissions';
import {
	useGetProjectQuery,
	useAppointProjectTeamLeaderMutation,
	useDeleteProjectTeamMemberMutation,
} from '../../../store/queries/projects';
import {
	ProjectType,
	SuccessResponseType,
	UserObjPermType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';

const DynamicAlert = dynamic<any>(
	() => import('kite-react-tailwind').then((mod) => mod.Alert),
	{
		ssr: false,
	}
);
const DynamicImportForm = dynamic<any>(
	() =>
		import('../../../components/common/import-form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
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

const Team = ({
	objPerm,
	projectData,
}: {
	objPerm: UserObjPermType;
	projectData: SuccessResponseType<ProjectType>['data'];
}) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { data, error, isLoading, isFetching, refetch } = useGetProjectQuery(
		{ id },
		{
			initialData() {
				return projectData;
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
	const { execute, loading } = useAxiosInstance({
		onSettled(response) {
			open({
				type: response.status === 'success' ? 'success' : 'danger',
				message: response.message,
			});
		},
	});

	const leaders = React.useMemo(() => {
		if (data) {
			return data.team.filter((member) => member.isLeader === true);
		}
		return [];
	}, [data]);

	const team = React.useMemo(() => {
		if (data) {
			return data.team.filter((member) => member.isLeader === false);
		}
		return [];
	}, [data]);

	const { appointMember } = useAppointProjectTeamLeaderMutation({
		onSuccess() {
			open({
				type: 'success',
				message: 'Employee was re-appointed successfully!',
			});
		},
	});

	const { deleteMember } = useDeleteProjectTeamMemberMutation({
		onSuccess() {
			open({
				type: 'success',
				message: 'Employee was removed successfully!',
			});
		},
	});

	const { url, importUrl } = React.useMemo(
		() => ({
			url: PROJECT_TEAM_EXPORT_URL(id),
			importUrl: PROJECT_TEAM_IMPORT_URL(id),
		}),
		[id]
	);

	const [canEdit, canExport] = React.useMemo(() => {
		if (!authData) return [];
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.project.EDIT]) ||
			(objPermData && objPermData.edit);
		const canExport =
			authData.isSuperUser ||
			(authData.isAdmin &&
				hasModelPermission(authData.permissions, [permissions.project.EXPORT]));
		return [canEdit, canExport];
	}, [authData, objPermData]);

	return (
		<Container
			background="bg-gray-100"
			loading={isLoading}
			heading={data ? `${data.name} - Team Information` : 'Team Information'}
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
		>
			{data && (
				<div className="w-full">
					<div className="flex flex-wrap items-center w-full lg:justify-end">
						{canEdit && (authData?.isAdmin || authData?.isSuperUser) && (
							<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
								<Button
									iconLeft={FaCloudUploadAlt}
									onClick={() => setModalVisible(true)}
									rounded="rounded-xl"
									title="Import Team"
								/>
							</div>
						)}
						{canExport && (
							<div className="my-2 w-full sm:px-2 sm:w-1/2 md:max-w-[220px]">
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
										title: loading ? 'Exporting...' : 'Export Team',
									}}
								/>
							</div>
						)}
					</div>
					<div className="py-2 w-full sm:px-4">
						<div className="bg-white p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									{data.name}
								</h3>
							</div>
						</div>
						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									Client
								</h3>
							</div>
							{data && data.client ? (
								<div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
									<PersonCard
										title={data.client.company || '------'}
										name={
											data.client.contact.firstName +
											' ' +
											data.client.contact.lastName
										}
										label={data.client.position || '------'}
										image={{
											src:
												data.client.contact.profile?.image?.url ||
												DEFAULT_IMAGE,
										}}
										actions={[
											{
												bg: 'bg-white hover:bg-green-100',
												border:
													'border border-green-500 hover:border-green-600',
												color: 'text-green-600',
												loader: true,
												link: CLIENT_PAGE_URL(data.client.id),
												title: 'view profile',
											},
										]}
									/>
								</div>
							) : (
								<p className="my-2 text-left text-gray-700 text-sm md:text-base">
									Client information is not available.
								</p>
							)}
						</div>
						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									Project Leaders
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
												link: EMPLOYEE_PAGE_URL(leader.employee.id),
												title: 'view profile',
											},
										];
										if (canEdit)
											actions.push({
												bg: 'bg-white hover:bg-red-100',
												border: 'border border-red-500 hover:border-red-600',
												color: 'text-red-500',
												onClick: () =>
													deleteMember({
														id: leader.id,
														projectId: id,
													}),
												title: 'Remove',
											});
										return (
											<PersonCard
												key={index}
												title="Team Leader"
												name={
													leader.employee.user.firstName +
													' ' +
													leader.employee.user.lastName
												}
												label={
													leader.employee.job
														? leader.employee.job.name
														: '-----'
												}
												image={{
													src:
														leader.employee.user.profile?.image?.url ||
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
																	onClick: () =>
																		appointMember({
																			id: leader.id,
																			projectId: id,
																			decision: 'remove',
																			data: {
																				employeeId: leader.employee.id,
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
									There are currently no team leaders
								</p>
							)}
						</div>
						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									Project Team
								</h3>
							</div>
							{team.length > 0 ? (
								<div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
									{team.map((member, index) => {
										const actions: ButtonType[] = [
											{
												bg: 'bg-white hover:bg-blue-100',
												border:
													'border border-primary-500 hover:border-primary-600',
												color: 'text-primary-500',
												link: EMPLOYEE_PAGE_URL(member.employee.id),
												title: 'view profile',
											},
										];
										if (canEdit)
											actions.push({
												bg: 'bg-white hover:bg-red-100',
												border: 'border border-red-500 hover:border-red-600',
												color: 'text-red-500',
												onClick: () =>
													deleteMember({
														id: member.id,
														projectId: id,
													}),
												title: 'Remove',
											});
										return (
											<PersonCard
												key={index}
												title="Team member"
												name={
													member.employee.user.firstName +
													' ' +
													member.employee.user.lastName
												}
												label={
													member.employee.job
														? member.employee.job.name
														: '------'
												}
												image={{
													src:
														member.employee.user.profile?.image?.url ||
														DEFAULT_IMAGE,
												}}
												options={
													canEdit
														? [
																{
																	bg: 'bg-white hover:bg-success-100',
																	border:
																		'border border-success-500 hover:border-success-600',
																	color: 'text-success-500',
																	onClick: () =>
																		appointMember({
																			id: member.id,
																			projectId: id,
																			decision: 'appoint',
																			data: {
																				employeeId: member.employee.id,
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
									There are currently no team members
								</p>
							)}
						</div>
					</div>
					{canEdit && (authData?.isAdmin || authData?.isSuperUser) && (
						<DynamicModal
							close={() => setModalVisible(false)}
							component={
								!modalVisible ? (
									<DynamicAlert
										type="warning"
										message="Unable show import form. Please try again!"
										onClose={() => setModalVisible(false)}
									/>
								) : (
									<DynamicImportForm
										onSuccess={(data: any) => {
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
												title: 'project_id',
												value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
											},
											{
												title: 'employee_id',
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
										]}
										sample={samples.projectTeam}
										url={importUrl}
									/>
								)
							}
							keepVisible
							description="Upload import file using the form below"
							title="Import Project Files"
							visible={modalVisible}
						/>
					)}
				</div>
			)}
		</Container>
	);
};

export default Team;
