import { ButtonType } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { Container, PersonCard } from '../../../components/common';
import {
	permissions,
	CLIENT_PAGE_URL,
	EMPLOYEE_PAGE_URL,
	DEFAULT_IMAGE,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useGetProjectQuery,
	useGetUserObjectPermissionsQuery,
	useAppointProjectTeamLeaderMutation,
	useDeleteProjectTeamMemberMutation,
} from '../../../store/queries';
import {
	ProjectType,
	SuccessResponseType,
	UserObjPermType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';

const Team = ({
	objPerm,
	projectData,
}: {
	objPerm: UserObjPermType;
	projectData: SuccessResponseType<ProjectType>['data'];
}) => {
	const router = useRouter();
	const id = router.query.id as string;

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
	const leaders = useMemo(() => {
		if (data) {
			return data.team.filter((member) => member.isLeader === true);
		}
		return [];
	}, [data]);

	const team = useMemo(() => {
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

	const [canEdit] = useMemo(() => {
		if (!authData) return [];
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.project.EDIT]) ||
			(objPermData && objPermData.edit);
		return [canEdit];
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
					<div className="py-2 w-full sm:px-4">
						<div className="bg-white p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									{data.name}
								</h3>
							</div>
						</div>
						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
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
											src: data.client.contact.profile?.image || DEFAULT_IMAGE,
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
								<p className="my-2 text-center text-gray-700 text-sm md:text-base">
									Client information is not available.
								</p>
							)}
						</div>
						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
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
														leader.employee.user.profile?.image ||
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
								<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
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
														member.employee.user.profile?.image ||
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
				</div>
			)}
		</Container>
	);
};

export default Team;
