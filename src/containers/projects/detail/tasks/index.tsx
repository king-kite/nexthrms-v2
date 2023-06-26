import { useRouter } from 'next/router';
import React from 'react';

import {
	Container,
	Modal,
	TablePagination,
} from '../../../../components/common';
import {
	TaskCards as Cards,
	TaskForm as Form,
	TaskTable,
	TaskTopbar as Topbar,
} from '../../../../components/projects/tasks';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	PROJECT_TASKS_EXPORTS_URL,
} from '../../../../config';
import { useAlertContext, useAuthContext } from '../../../../store/contexts';
import {
	useCreateProjectTaskMutation,
	useGetProjectTasksQuery,
} from '../../../../store/queries/projects';
import {
	CreateProjectTaskQueryType,
	CreateProjectTaskErrorResponseType,
	GetProjectTasksResponseType,
} from '../../../../types';
import { hasModelPermission } from '../../../../utils';

type ErrorType = CreateProjectTaskErrorResponseType;

const ProjectTasks = ({
	tasks,
}: {
	tasks: GetProjectTasksResponseType['data'];
}) => {
	const [errors, setErrors] = React.useState<ErrorType>();
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.projecttask.CREATE,
			  ])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.projecttask.EXPORT,
					]))
			: false;
		return [canCreate, canExport];
	}, [authData]);

	const { data, refetch, isLoading, isFetching } = useGetProjectTasksQuery(
		{
			id,
			limit,
			offset,
			search,
			onError(error) {
				showAlert({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
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

	const handleSubmit = React.useCallback(
		(form: CreateProjectTaskQueryType) => {
			setErrors(undefined);
			if (canCreate) createTask({ projectId: id, data: form });
		},
		[id, canCreate, createTask]
	);

	return (
		<Container
			background="bg-gray-100"
			heading="Tasks"
			title={data ? data.project.name : ''}
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			icon
		>
			<Cards
				total={data?.total || 0}
				pending={data?.ongoing || 0}
				completed={data?.completed || 0}
			/>
			<Topbar
				openModal={() => {
					createReset();
					setModalVisible(true);
				}}
				loading={isLoading}
				onSubmit={(e: string) => setSearch(e)}
				projectId={id}
				exportData={
					!canExport
						? undefined
						: {
								all: PROJECT_TASKS_EXPORTS_URL(id),
								filtered: `&offset=${offset}&limit=${limit}&search=${search}`,
						  }
				}
			/>
			<div className="mt-7 rounded-lg py-2 md:py-3 lg:py-4">
				<TaskTable
					projectId={id}
					loading={isLoading}
					tasks={data?.result || []}
				/>
				{data && data?.total > 0 && (
					<TablePagination
						disabled={isFetching}
						totalItems={data.total}
						onChange={(pageNo: number) => {
							const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
							offset !== value && setOffset(value * limit);
						}}
						onSizeChange={(size) => setLimit(size)}
						pageSize={limit}
					/>
				)}
			</div>
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<Form
							success={createSuccess}
							errors={errors}
							resetErrors={setErrors}
							loading={createLoading}
							onSubmit={handleSubmit}
						/>
					}
					keepVisible
					description="Fill in the form below to add a new task"
					title="Add a new Task"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default ProjectTasks;
