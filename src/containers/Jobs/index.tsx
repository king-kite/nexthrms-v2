import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
	FaCheckCircle,
	FaCloudDownloadAlt,
	FaPlus,
	FaSearch,
} from 'react-icons/fa';

import { Container, ExportForm, Modal } from '../../components/common';
import { Form, JobTable } from '../../components/Jobs';
import {
	DEFAULT_PAGINATION_SIZE,
	JOBS_EXPORT_URL,
	permissions,
} from '../../config';
import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from '../../store/contexts';
import { useGetJobsQuery } from '../../store/queries';
import { JobType } from '../../types';
import { downloadFile, hasModelPermission } from '../../utils';

const Jobs = ({
	jobs,
}: {
	jobs: {
		total: number;
		result: JobType[];
	};
}) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState({ name: '' });
	const [editId, setEditId] = useState<string>();

	const { open } = useAlertContext();
	const { open: openModal } = useAlertModalContext();
	const { data: authData } = useAuthContext();

	const [offset, setOffset] = useState(0);
	const [nameSearch, setNameSearch] = useState('');
	const [exportLoading, setExportLoading] = useState(false);

	const searchRef = useRef<HTMLInputElement>(null);

	const [canCreate, canExport, canView, canEdit] = useMemo(() => {
		if (!authData) return [false, false, false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.job.CREATE]);
		const canExport =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.job.EXPORT]);
		const canView =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.job.VIEW]) ||
			!!authData.objPermissions.find(
				(perm) => perm.modelName === 'jobs' && perm.permission === 'VIEW'
			);
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.job.EDIT]);
		return [canCreate, canExport, canView, canEdit];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetJobsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search: nameSearch,
			onError(error) {
				open({
					type: 'danger',
					message: error.message,
				});
			},
		},
		{
			initialData() {
				return jobs;
			},
		}
	);

	const handleChange = useCallback((name: string, value: string) => {
		setForm((prevState) => ({ ...prevState, [name]: value }));
	}, []);

	return (
		<Container
			heading="Jobs"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canCreate && !canView ? { statusCode: 403 } : undefined}
			disabledLoading={isLoading}
			paginate={
				(canCreate || canView) && data
					? {
							loading: isFetching,
							offset,
							setOffset,
							totalItems: data.total || 0,
					  }
					: undefined
			}
		>
			<div className="flex flex-col md:flex-row md:items-center">
				<form
					className="flex items-center mb-3 pr-8 w-full lg:mb-0 lg:w-3/5"
					onSubmit={(e) => {
						e.preventDefault();
						if (searchRef.current?.value)
							setNameSearch(searchRef.current?.value);
					}}
				>
					<InputButton
						buttonProps={{
							caps: true,
							disabled: isFetching,
							iconLeft: FaSearch,
							// padding: 'pl-2 pr-4 py-[0.545rem]',
							title: 'Search',
							type: 'submit',
						}}
						inputProps={{
							// bdrColor: 'border-primary-500',
							disabled: isFetching,
							icon: FaSearch,
							onChange: ({ target: { value } }) => {
								if (value === '') setNameSearch('');
							},
							placeholder: 'Search Job By Name e.g. accountant',
							rounded: 'rounded-l-lg',
							type: 'search',
						}}
						ref={searchRef}
					/>
				</form>
				{canCreate && (
					<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
						<Button
							bold="normal"
							caps
							onClick={() => {
								setForm({ name: '' });
								setEditId(undefined);
								setModalVisible(true);
							}}
							iconRight={FaPlus}
							rounded="rounded-lg"
							title="Add Job"
						/>
					</div>
				)}
				{canExport && (
					<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-0 lg:pl-4 xl:pl-5 xl:w-1/4">
						<ButtonDropdown
							component={() => (
								<ExportForm
									loading={exportLoading}
									onSubmit={async (
										type: 'csv' | 'excel',
										filtered: boolean
									) => {
										let url = JOBS_EXPORT_URL + '?type=' + type;
										if (filtered) {
											url =
												url +
												`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${nameSearch}`;
										}
										const result = await downloadFile({
											url,
											name: type === 'csv' ? 'jobs.csv' : 'jobs.xlsx',
											setLoading: setExportLoading,
										});
										if (result?.status !== 200) {
											open({
												type: 'danger',
												message: 'An error occurred. Unable to export file!',
											});
										}
									}}
								/>
							)}
							props={{
								caps: true,
								iconLeft: FaCloudDownloadAlt,
								margin: 'lg:mr-6',
								padding: 'px-3 py-2 md:px-6',
								rounded: 'rounded-xl',
								title: 'export',
							}}
						/>
					</div>
				)}
			</div>
			<JobTable
				jobs={data?.result || []}
				updateJob={
					!canEdit
						? undefined
						: (id: string, form: { name: string }) => {
								setEditId(id);
								setForm({ name: form.name });
								setModalVisible(true);
						  }
				}
			/>
			{(canCreate || canEdit) && (
				<Modal
					close={() => {
						setModalVisible(false);
						setEditId(undefined);
						setForm({ name: '' });
					}}
					component={
						<Form
							form={form}
							editId={canEdit && editId ? editId : undefined}
							onChange={handleChange}
							onSuccess={() => {
								setModalVisible(false);
								openModal({
									closeOnButtonClick: true,
									color: 'success',
									decisions: [
										{
											color: 'success',
											title: 'OK',
										},
									],
									Icon: FaCheckCircle,
									header: editId ? 'Job Edited' : 'Job Created',
									message: editId
										? 'Job Edited Successfully'
										: 'Job Created Successfully.',
								});
								setEditId(undefined);
								setForm({ name: '' });
							}}
						/>
					}
					description={
						editId ? 'Update Job' : 'Fill in the form below to add a job'
					}
					keepVisible
					title={editId ? 'Update Job' : 'Add Job'}
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Jobs;
