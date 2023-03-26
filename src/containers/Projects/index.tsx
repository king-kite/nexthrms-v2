import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, Form, ProjectTable, Topbar } from '../../components/Projects';
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
import { downloadFile, hasModelPermission } from '../../utils';

interface ErrorType extends CreateProjectErrorResponseType {
	message?: string;
}

const Projects = ({
	projects,
}: {
	projects: GetProjectsResponseType['data'];
}) => {
	const [errors, setErrors] = useState<ErrorType>();
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = useMemo(() => {
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

	const handleSubmit = useCallback(
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
			paginate={
				(canCreate || canView) && data && data.total > 0
					? {
							loading: isFetching,
							offset,
							setOffset,
							totalItems: data.total,
					  }
					: undefined
			}
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
				exportLoading={exportLoading}
				exportData={async (type, filtered) => {
					if (!canExport) return;
					let url = PROJECTS_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'projects.csv' : 'projects.xlsx',
						setLoading: setExportLoading,
					});
					if (result?.status !== 200) {
						showAlert({
							type: 'danger',
							message: 'An error occurred. Unable to export file!',
						});
					}
				}}
			/>
			{(canCreate || canView) && (
				<ProjectTable loading={isLoading} projects={data?.result || []} />
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
