import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import { Container, Modal } from '../../../../components/common';
import {
	TaskCards as Cards,
	TaskForm as Form,
	TaskTable,
	TaskTopbar as Topbar,
} from '../../../../components/Projects/Tasks';
import { DEFAULT_PAGINATION_SIZE } from '../../../../config';
import { useAlertContext } from '../../../../store/contexts';
import {
	useCreateProjectTaskMutation,
	useEditProjectTaskMutation,
	useGetProjectTasksQuery,
} from '../../../../store/queries';
import {
	ProjectTaskType,
	CreateProjectTaskQueryType,
	CreateProjectTaskErrorResponseType,
	GetProjectTasksResponseType,
} from '../../../../types';

type ErrorType = CreateProjectTaskErrorResponseType;

const ProjectTasks = ({
	tasks,
}: {
	tasks: GetProjectTasksResponseType['data'];
}) => {
	const [errors, setErrors] = useState<ErrorType>();
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [editTask, setEditTask] = useState<ProjectTaskType>();
	const [modalVisible, setModalVisible] = useState(false);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();

	const { data, refetch, isLoading, isFetching } = useGetProjectTasksQuery(
		{
			id,
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
		},
		{
			initialData() {
				return tasks;
			},
		}
	);

	const {
		mutate: createTask,
		isLoading: createLoading,
		isSuccess: createSuccess,
		reset: createReset,
	} = useCreateProjectTaskMutation({
		onSuccess() {
			showAlert({
				type: 'success',
				message: 'Task was created successfully',
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

	const {
		mutate: updateTask,
		isLoading: editLoading,
		isSuccess: editSuccess,
		reset: editReset,
	} = useEditProjectTaskMutation({
		onSuccess() {
			showAlert({
				type: 'success',
				message: 'Task was updated successfully',
			});
			setModalVisible(false);
			setEditTask(undefined);
		},
		onError(err) {
			setErrors((prevState) => ({
				...prevState,
				...err,
			}));
		},
	});

	const handleSubmit = useCallback(
		(form: CreateProjectTaskQueryType) => {
			setErrors(undefined);
			if (editTask) updateTask({ projectId: id, id: editTask.id, data: form });
			else createTask({ projectId: id, data: form });
		},
		[id, createTask, editTask, updateTask]
	);

	return (
		<Container
			background="bg-gray-100"
			heading="Tasks"
			loading={isLoading}
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			icon
			paginate={
				data && data.total > 0
					? {
							loading: isFetching,
							offset,
							setOffset,
							totalItems: data.total,
					  }
					: undefined
			}
		>
			<Cards
				total={data?.total || 0}
				pending={data?.ongoing || 0}
				completed={data?.completed || 0}
			/>
			<Topbar
				openModal={() => {
					createReset();
					setEditTask(undefined);
					setModalVisible(true);
				}}
				loading={isLoading}
				onSubmit={(e: string) => setSearch(e)}
				exportData={() => window.alert('Exporting...')}
			/>
			<TaskTable
				loading={isFetching}
				tasks={data?.result || []}
				editTask={(task: ProjectTaskType) => {
					editReset();
					setEditTask(task);
					setModalVisible(true);
				}}
			/>
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						initState={editTask}
						editMode={!!editTask?.id}
						success={editTask ? editSuccess : createSuccess}
						errors={errors}
						resetErrors={setErrors}
						loading={!editTask ? createLoading : editLoading}
						onSubmit={handleSubmit}
					/>
				}
				keepVisible
				description={
					editTask
						? 'Fill in the form below to edit this task'
						: 'Fill in the form below to add a new task'
				}
				title={editTask ? 'Edit Task' : 'Add a new Task'}
				visible={modalVisible}
			/>
		</Container>
	);
};

export default ProjectTasks;
