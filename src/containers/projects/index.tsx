import dynamic from 'next/dynamic';
import React from 'react';

import Container from '../../components/common/container';
import { Cards, ProjectTable, Topbar } from '../../components/projects';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	PROJECTS_EXPORT_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useCreateProjectMutation,
	useGetProjectsQuery,
} from '../../store/queries/projects';
import {
	CreateProjectQueryType,
	CreateProjectErrorResponseType,
	GetProjectsResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';

interface ErrorType extends CreateProjectErrorResponseType {
	message?: string;
}

const DynamicForm = dynamic<any>(
	() => import('../../components/projects/form').then((mod) => mod.default),
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
	() => import('../../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);

const DynamicTablePagination = dynamic<any>(
	() =>
		import('../../components/common/table/pagination').then(
			(mod) => mod.default
		),
	{
		ssr: false,
	}
);

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

	const paginateRef = React.useRef<{
		changePage: (num: number) => void;
	} | null>(null);

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
				onSubmit={(e: string) => {
					// change page to one
					paginateRef.current?.changePage(1);
					setSearch(e);
				}}
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
					<ProjectTable offset={offset} projects={data?.result || []} />
					{data && data?.total > 0 && (
						<DynamicTablePagination
							disabled={isFetching}
							handleRef={{ ref: paginateRef }}
							totalItems={data.total}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							onSizeChange={(size: number) => setLimit(size)}
							pageSize={limit}
						/>
					)}
				</div>
			)}
			{canCreate && (
				<DynamicModal
					close={() => setModalVisible(false)}
					component={
						<DynamicForm
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
