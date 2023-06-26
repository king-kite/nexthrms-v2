import { Badge, Select } from 'kite-react-tailwind';
import Image from 'next/image';

import { StatusProgressBar } from '../../common';
import { DEFAULT_IMAGE } from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import { useEditProjectMutation } from '../../../store/queries';
import { ProjectType } from '../../../types';
import { getDate } from '../../../utils';

const ProjectDetail = ({
	data,
	progress = 0,
	canEdit = false,
}: {
	data: ProjectType;
	progress?: number;
	canEdit?: boolean;
}) => {
	const start_date = data ? new Date(data.startDate) : undefined;
	const end_date = data ? new Date(data.endDate) : undefined;
	const hours =
		start_date && end_date
			? (end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60)
			: undefined;
	const total_cost =
		data && hours ? (data.initialCost || 0) + (data.rate || 0) * hours : 0;
	const leaders = data.team.filter((member) => member.isLeader === true);
	const team = data.team.filter((member) => member.isLeader === false);

	const { open: showAlert } = useAlertContext();

	const { mutate: editProject } = useEditProjectMutation({
		onError({ message = "Sorry, unable to change the project's priority" }) {
			showAlert({ type: 'danger', message });
		},
	});

	return data ? (
		<div className="py-2 w-full sm:px-4 lg:pr-0 lg:w-1/3">
			<div className="flex flex-col items-center md:flex-row md:items-start lg:flex-col lg:items-center">
				<div className="bg-white my-4 p-4 rounded-md shadow-lg w-full md:mr-6 md:w-[55%] lg:mr-0 lg:mt-0 lg:w-full">
					<h3 className="capitalize font-bold text-lg text-gray-800 tracking-wide md:text-xl">
						project details
					</h3>
					<ul className="pb-1 pt-3">
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 capitalize font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>initial cost:</p>
							<p>${data.initialCost || 0}</p>
						</li>
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>Total Hours:</p>
							<p>
								{hours || 0} hour{hours ? (hours > 1 ? 's' : '') : ''}
							</p>
						</li>
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>Rate / Hour:</p>
							<p>${data.rate || 0}</p>
						</li>
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 capitalize font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>total cost:</p>
							<p>${total_cost}</p>
						</li>
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 capitalize font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>created:</p>
							<p>{start_date ? start_date.toDateString() : '------'}</p>
						</li>
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 capitalize font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>deadline:</p>
							<p>{end_date ? end_date.toDateString() : '------'}</p>
						</li>
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 capitalize font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>Priority:</p>
							{canEdit ? (
								<div>
									<Select
										bg={
											data.priority === 'HIGH'
												? 'bg-red-100'
												: data.priority === 'MEDIUM'
												? 'bg-yellow-100'
												: 'bg-green-100'
										}
										bdrColor={
											data.priority === 'HIGH'
												? 'border-red-600'
												: data.priority === 'MEDIUM'
												? 'border-yellow-600'
												: 'border-green-600'
										}
										color={
											data.priority === 'HIGH'
												? 'text-red-700'
												: data.priority === 'MEDIUM'
												? 'text-yellow-700'
												: 'text-green-700'
										}
										onChange={({ target: { value } }) => {
											editProject({
												id: data.id,
												data: {
													name: data.name,
													description: data.description,
													initialCost: data.initialCost,
													rate: data.rate,
													completed: data.completed,
													startDate: getDate(data.startDate, false) as Date,
													endDate: getDate(data.endDate, false) as Date,
													priority: value as 'HIGH' | 'MEDIUM' | 'LOW',
													client: data.client?.id || '',
												},
											});
										}}
										value={data.priority}
										options={[
											{ title: 'High', value: 'HIGH' },
											{ title: 'Medium', value: 'MEDIUM' },
											{ title: 'Low', value: 'LOW' },
										]}
									/>
								</div>
							) : (
								<div>
									<Badge
										bg={
											data.priority === 'HIGH'
												? 'danger'
												: data.priority === 'LOW'
												? 'success'
												: 'warning'
										}
										centered
										padding="px-4"
										title={data.priority}
									/>
								</div>
							)}
						</li>
						<li className="odd:bg-gray-100 rounded-sm flex items-center justify-between p-2 capitalize font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<p>status:</p>
							<p className={data.completed ? 'text-green-600' : 'text-red-600'}>
								{data.completed ? 'Completed' : 'Ongoing'}
							</p>
						</li>
						<li className="rounded-sm flex items-center justify-between capitalize font-medium text-gray-800 text-base md:text-lg lg:text-base">
							<StatusProgressBar
								background="bg-green-600"
								containerColor="bg-white"
								border="border-none"
								title="Progress"
								result={progress}
								value={parseInt(String(progress * 100)) + '%'}
							/>
						</li>
					</ul>
				</div>

				<div className="bg-white my-4 p-4 rounded-md shadow-lg w-full md:w-[45%] lg:w-full">
					<h3 className="font-bold text-lg text-gray-800 tracking-wide md:text-xl">
						Assigned Leader{leaders.length > 1 ? 's' : ''}
					</h3>
					{leaders.length > 0 ? (
						<ul className="pb-1 pt-3">
							{leaders.map((leader, index) => (
								<li
									key={index}
									className="flex items-start rounded-md px-1 py-2 odd:bg-gray-100"
								>
									<div className="w-[15%]">
										<div className="h-[30px] mx-1 relative w-[30px] rounded-full">
											<Image
												className="h-[30px] rounded-full w-[30px]"
												src={
													leader.employee.user.profile?.image?.url ||
													DEFAULT_IMAGE
												}
												layout="fill"
												alt=""
											/>
										</div>
									</div>
									<div className="px-2 w-[85%]">
										<p className="capitalize text-sm text-gray-800 md:text-base">
											{`${leader.employee.user.firstName} ${leader.employee.user.lastName}`}
										</p>
										<span className="capitalize text-gray-600 text-xs md:text-sm">
											{leader.employee.job?.name || '-------'}
										</span>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-700">
							There are no assigned leaders
						</p>
					)}
				</div>
			</div>

			<div className="bg-white my-4 p-4 rounded-md shadow-lg w-full">
				<h3 className="font-bold text-lg text-gray-800 tracking-wide md:text-xl">
					Assigned Team
				</h3>
				<ul className="grid grid-cols-1 pb-1 pt-3 sm:grid-cols-2 lg:grid-cols-1">
					{team.length > 0 ? (
						<ul className="pb-1 pt-3">
							{team.map((member, index) => (
								<li
									key={index}
									className="flex items-start rounded-md px-1 py-2 odd:bg-gray-100"
								>
									<div className="w-[15%]">
										<div className="h-[30px] mx-1 relative w-[30px] rounded-full">
											<Image
												className="h-[30px] rounded-full w-[30px]"
												src={
													member.employee.user.profile?.image?.url ||
													DEFAULT_IMAGE
												}
												layout="fill"
												alt=""
											/>
										</div>
									</div>
									<div className="px-2 w-[85%]">
										<p className="capitalize text-sm text-gray-800 md:text-base">
											{`${member.employee.user.firstName} ${member.employee.user.lastName}`}
										</p>
										<span className="capitalize text-gray-600 text-xs md:text-sm">
											{member.employee.job?.name || '-------'}
										</span>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-700">There is no team</p>
					)}
				</ul>
			</div>
		</div>
	) : (
		<></>
	);
};

export default ProjectDetail;
