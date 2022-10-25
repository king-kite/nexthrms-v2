import { useCallback, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, Form, ProjectTable, Topbar } from '../../components/Projects';
import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useCreateProjectMutation,
	useEditProjectMutation,
	useGetProjectsQuery,
} from '../../store/queries';
import {
	ProjectType,
	CreateProjectQueryType,
	CreateProjectErrorResponseType,
	GetProjectsResponseType,
} from '../../types';

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
	const [editProject, setEditProject] = useState<ProjectType>();
	const [modalVisible, setModalVisible] = useState(false);

	const { open: showAlert } = useAlertContext();

	const { data, refetch, isLoading, isFetching } = useGetProjectsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
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

	const {
		mutate: updateProject,
		isLoading: editLoading,
		isSuccess: editSuccess,
		reset: editReset,
	} = useEditProjectMutation({
		onSuccess() {
			showAlert({
				type: 'success',
				message: 'Project was updated successfully',
			});
			setModalVisible(false);
			setEditProject(undefined);
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
			setErrors(undefined);
			if (editProject) updateProject({ id: editProject.id, data: form });
			else createProject(form);
		},
		[createProject, editProject, updateProject]
	);

	return (
		<Container
			background="bg-gray-100"
			heading="Projects"
			disabledLoading={isLoading}
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
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
				ongoing={data?.ongoing || 0}
				completed={data?.completed || 0}
			/>
			<Topbar
				openModal={() => {
					createReset();
					setEditProject(undefined);
					setModalVisible(true);
				}}
				loading={isLoading}
				onSubmit={(e: string) => setSearch(e)}
				exportData={() => window.alert('Exporting...')}
			/>
			<ProjectTable
				loading={isLoading}
				projects={data?.result || []}
				editProject={(project: ProjectType) => {
					editReset();
					setEditProject(project);
					setModalVisible(true);
				}}
			/>
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						initState={editProject}
						editMode={!!editProject?.id}
						success={editProject ? editSuccess : createSuccess}
						errors={errors}
						resetErrors={setErrors}
						loading={!editProject ? createLoading : editLoading}
						onSubmit={handleSubmit}
					/>
				}
				keepVisible
				description={
					editProject
						? 'Fill in the form below to edit this project'
						: 'Fill in the form below to add a new project'
				}
				title={editProject ? 'Edit Project' : 'Add a new Project'}
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Projects;
