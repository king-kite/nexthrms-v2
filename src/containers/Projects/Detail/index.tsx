import { Button } from '@king-kite/react-kit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { FaPen, FaTasks, FaTrash, FaUsers } from 'react-icons/fa';

import { Container, Modal, TabNavigator } from '../../../components/common';
import {
	Form,
	ProjectDetail,
	ProjectFiles,
	ProjectImages,
	Task,
} from '../../../components/Projects';
import {
	DEFAULT_PAGINATION_SIZE,
	PROJECT_TASKS_PAGE_URL,
	PROJECT_TEAM_PAGE_URL,
} from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import {
	useGetProjectQuery,
	useGetProjectFilesQuery,
	useGetProjectTasksQuery,
	useEditProjectMutation,
	useDeleteProjectMutation,
} from '../../../store/queries';
import {
	CreateProjectErrorResponseType,
	CreateProjectQueryType,
	GetProjectFilesResponseType,
	GetProjectTasksResponseType,
	ProjectType,
	SuccessResponseType,
} from '../../../types';

const Tasks = ({
	tasks,
}: {
	tasks: {
		id: string;
		name: string;
		completed: boolean;
	}[];
}) => {
	return tasks && tasks.length > 0 ? (
		<ul>
			{tasks.map((task, index) => (
				<Task key={index} title={task.name} completed={task.completed} />
			))}
		</ul>
	) : (
		<div className="p-2">
			<p className="text-sm text-gray-700">
				There are no tasks in this section
			</p>
		</div>
	);
};

const Detail = ({
	projectFiles,
	project,
	projectTasks,
}: {
	project: SuccessResponseType<ProjectType>['data'];
	projectFiles: GetProjectFilesResponseType['data'];
	projectTasks: GetProjectTasksResponseType['data'];
}) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = useState(false);
	const [formErrors, setFormErrors] =
		useState<CreateProjectErrorResponseType>();

	const { open: showAlert } = useAlertContext();

	const { data, refetch, isLoading, isFetching } = useGetProjectQuery(
		{ id },
		{
			initialData() {
				return project;
			},
		}
	);
	const { data: tasks, refetch: tasksRefetch } = useGetProjectTasksQuery(
		{
			id,
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		{
			initialData() {
				return projectTasks;
			},
		}
	);

	const { data: files, refetch: filesRefetch } = useGetProjectFilesQuery(
		{ id },
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

	const screens = [
		{ title: 'all tasks', component: <Tasks tasks={tasks?.result || []} /> },
		{
			title: 'completed tasks',
			component: (
				<Tasks
					tasks={
						tasks ? tasks.result.filter((task) => task.completed === true) : []
					}
				/>
			),
		},
		{
			title: 'pending tasks',
			component: (
				<Tasks
					tasks={
						tasks ? tasks.result.filter((task) => task.completed === false) : []
					}
				/>
			),
		},
	];

	const progress = useMemo(() => {
		if (tasks && tasks.total > 0 && tasks.completed > 0) {
			return tasks.completed / tasks.total;
		}
		return 0;
	}, [tasks]);

	return (
		<Container
			background="bg-gray-100 overflow-y-hidden"
			heading="Project Information"
			loading={isLoading}
			refresh={{
				onClick: () => {
					refetch();
					filesRefetch();
					tasksRefetch();
				},
				loading: isFetching,
			}}
			icon
		>
			{data && (
				<>
					<div className="flex flex-wrap items-center w-full lg:justify-end">
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
						<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
							<Button
								iconLeft={FaPen}
								onClick={() => setModalVisible(true)}
								rounded="rounded-xl"
								disabled={editLoading}
								title={editLoading ? 'Editing Project...' : 'Edit Project'}
							/>
						</div>
						<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4 lg:w-1/5">
							<Button
								bg="bg-red-600 hover:bg-red-500"
								focus="focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
								iconLeft={FaTrash}
								rounded="rounded-xl"
								title={delLoading ? 'Deleting Project...' : 'Delete Project'}
								disabled={delLoading}
								onClick={() => deleteProject(id)}
							/>
						</div>
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
									<span className="font-medium mr-1 text-gray-800 text-sm md:text-base">
										{tasks?.ongoing || 0}{' '}
										<span className="font-bold text-gray-600">open tasks</span>,
									</span>
									<span className="font-medium mr-1 text-gray-800 text-sm md:text-base">
										{tasks?.completed || 0}{' '}
										<span className="font-bold text-gray-600">
											tasks completed
										</span>
									</span>
								</div>
								<div className="my-1">
									<p className="font-semibold my-2 text-left text-sm text-gray-600 md:text-base">
										{data.description}
									</p>
								</div>
							</div>

							<ProjectImages
								files={
									files
										? files.result.filter((file) => file.type === 'IMAGE')
										: []
								}
							/>

							<ProjectFiles
								files={
									files
										? files.result.filter((file) => file.type !== 'IMAGE')
										: []
								}
							/>

							<div className="bg-white my-4 p-4 rounded-md shadow-lg">
								<TabNavigator container="" screens={screens} />
								<div className="w-1/3">
									<Button
										bg="bg-gray-300 hover:bg-blue-100"
										border="border-gray-700 hover:bg-primary-600"
										caps
										color="text-primary-500"
										focus="focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
										link={PROJECT_TASKS_PAGE_URL(id)}
										renderLinkAs={(props) => {
											return (
												<Link href={props.link || '#'}>
													<a {...props}>{props.children}</a>
												</Link>
											);
										}}
										title="See all"
									/>
								</div>
							</div>
						</div>

						<ProjectDetail data={data} progress={progress} />
					</div>
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
				</>
			)}
		</Container>
	);
};

export default Detail;
