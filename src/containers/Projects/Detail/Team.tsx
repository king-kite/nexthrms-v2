import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { Container, PersonCard } from '../../../components/common';
import {
	CLIENT_PAGE_URL,
	EMPLOYEE_PAGE_URL,
	DEFAULT_IMAGE,
} from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import {
	useGetProjectQuery,
	useGetProjectTeamQuery,
	useAppointProjectTeamLeaderMutation,
	useDeleteProjectTeamMemberMutation,
} from '../../../store/queries';
import {
	ProjectType,
	GetProjectTeamResponseType,
	SuccessResponseType,
} from '../../../types';

const Team = ({
	teamData,
	projectData,
}: {
	teamData: GetProjectTeamResponseType['data'];
	projectData: SuccessResponseType<ProjectType>['data'];
}) => {
	const router = useRouter();
	const id = router.query.id as string;

	const { open } = useAlertContext();
	const project = useGetProjectQuery(
		{ id },
		{
			initialData() {
				return projectData;
			},
		}
	);
	const { data, isLoading, isFetching, refetch } = useGetProjectTeamQuery(
		{ id },
		{
			initialData() {
				return teamData;
			},
		}
	);

	const leaders = useMemo(() => {
		if (data) {
			return data.result.filter((member) => member.isLeader === true);
		}
		return [];
	}, [data]);

	const team = useMemo(() => {
		if (data) {
			return data.result.filter((member) => member.isLeader === false);
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

	return (
		<Container
			background="bg-gray-100"
			heading="Team Information"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			icon
		>
			{data && (
				<div className="w-full">
					<div className="py-2 w-full sm:px-4">
						<div className="bg-white p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									{project.data
										? project.data.name
										: 'Loading Project Details...'}
								</h3>
							</div>
						</div>
						<div className="bg-gray-200 my-4 p-4 rounded-md">
							<div className="my-2">
								<h3 className="capitalize cursor-pointer font-bold text-lg text-gray-800 tracking-wide md:text-xl">
									Client
								</h3>
							</div>
							{project.data && project.data.client ? (
								<div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-4">
									<PersonCard
										title={project.data.client.company || '------'}
										name={
											project.data.client.contact.firstName +
											' ' +
											project.data.client.contact.lastName
										}
										label={project.data.client.position || '------'}
										image={{
											src:
												project.data.client.contact.profile?.image ||
												DEFAULT_IMAGE,
										}}
										actions={[
											{
												bg: 'bg-white hover:bg-green-100',
												border:
													'border border-green-500 hover:border-green-600',
												color: 'text-green-600',
												loader: true,
												link: CLIENT_PAGE_URL(project.data.client.id),
												title: 'view profile',
											},
										]}
									/>
								</div>
							) : (
								<p className="my-2 text-center text-gray-700 text-sm md:text-base">
									{project.isLoading
										? 'Loading Client Information...'
										: 'Client information is not available.'}
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
									{leaders.map((leader, index) => (
										<PersonCard
											key={index}
											title="Team Leader"
											name={
												leader.employee.user.firstName +
												' ' +
												leader.employee.user.lastName
											}
											label={
												leader.employee.job ? leader.employee.job.name : '-----'
											}
											image={{
												src:
													leader.employee.user.profile?.image || DEFAULT_IMAGE,
											}}
											options={[
												{
													bg: 'bg-white hover:bg-red-100',
													border: 'border border-red-500 hover:border-red-600',
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
											]}
											actions={[
												{
													bg: 'bg-white hover:bg-blue-100',
													border:
														'border border-primary-500 hover:border-primary-600',
													color: 'text-primary-500',
													link: EMPLOYEE_PAGE_URL(leader.employee.id),
													title: 'view profile',
												},
												{
													bg: 'bg-white hover:bg-red-100',
													border: 'border border-red-500 hover:border-red-600',
													color: 'text-red-500',
													onClick: () =>
														deleteMember({
															id: leader.id,
															projectId: id,
														}),
													title: 'Remove',
												},
											]}
										/>
									))}
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
									{team.map((member, index) => (
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
													member.employee.user.profile?.image || DEFAULT_IMAGE,
											}}
											options={[
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
											]}
											actions={[
												{
													bg: 'bg-white hover:bg-blue-100',
													border:
														'border border-primary-500 hover:border-primary-600',
													color: 'text-primary-500',
													link: EMPLOYEE_PAGE_URL(member.employee.id),
													title: 'view profile',
												},
												{
													bg: 'bg-white hover:bg-red-100',
													border: 'border border-red-500 hover:border-red-600',
													color: 'text-red-500',
													onClick: () =>
														deleteMember({
															id: member.id,
															projectId: id,
														}),
													title: 'Remove',
												},
											]}
										/>
									))}
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
