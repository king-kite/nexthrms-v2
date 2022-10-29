import { useCallback, useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, Form, ProjectTable, Topbar } from '../../components/Projects';
import { DEFAULT_PAGINATION_SIZE, PROJECTS_EXPORT_URL } from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useCreateProjectMutation,
	useGetProjectsQuery,
} from '../../store/queries';
import {
	CreateProjectQueryType,
	CreateProjectErrorResponseType,
	GetProjectsResponseType,
} from '../../types';
import { downloadFile } from '../../utils';

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

	const handleSubmit = useCallback(
		(form: CreateProjectQueryType) => {
			createProject(form);
		},
		[createProject]
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
					setModalVisible(true);
				}}
				loading={isLoading}
				onSubmit={(e: string) => setSearch(e)}
				exportLoading={exportLoading}
				exportData={async (type, filtered) => {
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
			<ProjectTable loading={isLoading} projects={data?.result || []} />
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
		</Container>
	);
};

export default Projects;
