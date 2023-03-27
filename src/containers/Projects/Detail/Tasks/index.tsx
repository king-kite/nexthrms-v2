import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../../../components/common';
import {
	TaskCards as Cards,
	TaskForm as Form,
	TaskTable,
	TaskTopbar as Topbar,
} from '../../../../components/Projects/Tasks';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	PROJECT_TASKS_EXPORTS_URL,
} from '../../../../config';
import { useAlertContext, useAuthContext } from '../../../../store/contexts';
import {
	useCreateProjectTaskMutation,
	useGetProjectTasksQuery,
} from '../../../../store/queries';
import {
	CreateProjectTaskQueryType,
	CreateProjectTaskErrorResponseType,
	GetProjectTasksResponseType,
} from '../../../../types';
import { downloadFile, hasModelPermission } from '../../../../utils';

type ErrorType = CreateProjectTaskErrorResponseType;

const ProjectTasks = ({
	tasks,
}: {
	tasks: GetProjectTasksResponseType['data'];
}) => {
	const [errors, setErrors] = useState<ErrorType>();
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const router = useRouter();
	const id = router.query.id as string;

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport] = useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.projecttask.CREATE,
			  ])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.projecttask.EXPORT,
			  ])
			: false;
		return [canCreate, canExport];
	}, [authData]);

	const { data, refetch, isLoading, isFetching } = useGetProjectTasksQuery(
		{
			id,
			limit: DEFAULT_PAGINATION_SIZE,
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

	const handleSubmit = useCallback(
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
			disabledLoading={isLoading}
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
					setModalVisible(true);
				}}
				loading={isLoading}
				onSubmit={(e: string) => setSearch(e)}
				exportData={async (type, filtered) => {
					if (!canExport) return;
					let url = PROJECT_TASKS_EXPORTS_URL(id) + '?type=' + type;
					let name = data
						? `${data.project.name} project team`
						: 'project team ' + id;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? `${name}.csv` : `${name}.xlsx`,
						setLoading: setExportLoading,
					});
					if (result?.status !== 200) {
						showAlert({
							type: 'danger',
							message: 'An error occurred. Unable to export file!',
						});
					}
				}}
				exportLoading={exportLoading}
			/>
			<TaskTable loading={isLoading} tasks={data?.result || []} />
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
