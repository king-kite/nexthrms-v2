import React from 'react';

import { Container, Modal, TablePagination } from '../../components/common';
import { Cards, Form, ProjectTable, Topbar } from '../../components/projects';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	PROJECTS_EXPORT_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useCreateProjectMutation,
	useGetProjectsQuery,
} from '../../store/queries';
import {
	CreateProjectQueryType,
	CreateProjectErrorResponseType,
	GetProjectsResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';

interface ErrorType extends CreateProjectErrorResponseType {
	message?: string;
}

const Projects = ({
	projects,
}: {
	projects: GetProjectsResponseType['data'];
}) => {
	const [errors, setErrors] = React.useState<ErrorType>();
	const [offset, setOffset] = React.useState(0);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.project.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.project.EXPORT])
			: false;
		// TODO: Add Object Level Permissions As Well
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.project.VIEW]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) => perm.modelName === 'projects' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, refetch, isLoading, isFetching } = useGetProjectsQuery(
		{
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
				return projects;
			},
		}
	);

	const {
		mutate: createProject,
		isLoading: createLoading,
		isSuccess: createSuccess,
		reset: createReset,
	} = useCreateProjectMutation({
		onSuccess() {
			showAlert({
				type: 'success',
				message: 'Project was created successfully',
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
		(form: CreateProjectQueryType) => {
			if (canCreate) createProject(form);
		},
		[canCreate, createProject]
	);

	return (
		<Container
			heading="Projects"
			disabledLoading={isLoading}
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			{(canCreate || canView) && (
				<Cards
					total={data?.total || 0}
					ongoing={data?.ongoing || 0}
					completed={data?.completed || 0}
				/>
			)}
			<Topbar
				openModal={() => {
					createReset();
					setModalVisible(true);
				}}
				loading={isLoading}
				onSubmit={(e: string) => setSearch(e)}
				exportData={
					!canExport
						? undefined
						: {
								all: PROJECTS_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${limit}&search=${search}`,
						  }
				}
			/>
			{(canCreate || canView) && (
				<div className="mt-7 rounded-lg py-2 md:py-3 lg:py-4">
					<ProjectTable loading={isLoading} projects={data?.result || []} />
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
			)}
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
					description="Fill in the form below to add a new project"
					title="Add a new Project"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Projects;
