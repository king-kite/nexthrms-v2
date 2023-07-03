import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import dynamic from 'next/dynamic';
import React from 'react';
import {
	FaCheckCircle,
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaPlus,
	FaSearch,
} from 'react-icons/fa';

import Container from '../../components/common/container';
import DepartmentTable from '../../components/departments/table';
import {
	DEFAULT_PAGINATION_SIZE,
	DEPARTMENTS_EXPORT_URL,
	DEPARTMENTS_IMPORT_URL,
	permissions,
	samples,
} from '../../config';
import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from '../../store/contexts';
import { useGetDepartmentsQuery } from '../../store/queries/departments';
import { GetDepartmentsResponseType } from '../../types';
import { hasModelPermission } from '../../utils';

const DynamicExportForm = dynamic<any>(
	() =>
		import('../../components/common/export-form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
		),
		ssr: false,
	}
);
const DynamicImportForm = dynamic<any>(
	() =>
		import('../../components/common/import-form').then((mod) => mod.default),
	{
		loading: () => (
			<p className="text-center text-gray-500 text-sm md:text-base">
				Loading Form...
			</p>
		),
		ssr: false,
	}
);
const DynamicForm = dynamic<any>(
	() => import('../../components/departments/form').then((mod) => mod.default),
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

const Departments = ({
	departments,
}: {
	departments: GetDepartmentsResponseType['data'];
}) => {
	const [bulkForm, setBulkForm] = React.useState(false);
	const [modalVisible, setModalVisible] = React.useState(false);
	const [form, setForm] = React.useState<{
		name: string;
		hod: string | null;
	}>({ name: '', hod: null });
	const [editId, setEditId] = React.useState<string>();

	const { open } = useAlertContext();
	const { open: openModal } = useAlertModalContext();
	const { data: authData } = useAuthContext();

	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [nameSearch, setNameSearch] = React.useState('');

	const searchRef = React.useRef<HTMLInputElement>(null);

	const [canCreate, canExport, canView, canEdit] = React.useMemo(() => {
		if (!authData) return [false, false, false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.department.CREATE]);
		const canExport =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.department.EXPORT]);
		const canView =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.department.VIEW]) ||
			!!authData.objPermissions.find(
				(perm) => perm.modelName === 'departments' && perm.permission === 'VIEW'
			);
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.department.EDIT]);
		return [canCreate, canExport, canView, canEdit];
	}, [authData]);

	const { data, isFetching, isLoading, refetch } = useGetDepartmentsQuery(
		{
			limit,
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
				return departments;
			},
		}
	);

	const handleChange = React.useCallback(
		(name: string, value: string | null) => {
			setForm((prevState) => ({ ...prevState, [name]: value }));
		},
		[]
	);

	return (
		<Container
			heading="Departments"
			disabledLoading={isLoading}
			error={!canCreate && !canView ? { statusCode: 403 } : undefined}
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
		>
			<div className="flex flex-wrap items-center mb-2 py-2 w-full lg:pb-0">
				<form
					className="flex items-center mb-3 w-full md:mb-0 md:w-1/2 lg:mb-0 lg:w-2/5"
					onSubmit={(e) => {
						e.preventDefault();
						if (searchRef.current?.value)
							setNameSearch(searchRef.current?.value);
					}}
				>
					<InputButton
						buttonProps={{
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
								if (!value || value === '') setNameSearch('');
							},
							placeholder: 'Search department by name e.g. engineering',
							rounded: 'rounded-l-lg',
							type: 'search',
						}}
						ref={searchRef}
					/>
				</form>
				{canCreate && (
					<>
						<div className="my-3 w-full sm:pr-1 sm:w-1/3 md:w-1/4 md:my-0 md:px-3 lg:pl-2 lg:pr-0 lg:w-1/5">
							<Button
								caps
								iconLeft={FaPlus}
								onClick={() => {
									setForm({ name: '', hod: null });
									setEditId(undefined);
									setModalVisible(true);
								}}
								margin="lg:mr-6"
								padding="px-3 py-2 md:px-6"
								rounded="rounded-xl"
								title="add department"
							/>
						</div>
						<div className="my-3 w-full sm:px-2 sm:w-1/3 md:w-1/4 md:px-0 md:my-0 lg:px-2 lg:w-1/5">
							<Button
								bold="normal"
								caps
								onClick={() => {
									setBulkForm(true);
									setForm({ name: '', hod: null });
									setEditId(undefined);
									setModalVisible(true);
								}}
								iconRight={FaCloudUploadAlt}
								rounded="rounded-lg"
								title="Bulk Import"
							/>
						</div>
					</>
				)}
				{canExport && (
					<div className="my-3 w-full sm:pl-1 sm:w-1/3 md:mb-0 md:mt-5 md:pl-0 md:w-1/4 lg:my-0 lg:w-1/5">
						<ButtonDropdown
							component={() => (
								<DynamicExportForm
									all={DEPARTMENTS_EXPORT_URL}
									filtered={`&offset=${offset}&limit=${limit}&search=${nameSearch}`}
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
			<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
				<DepartmentTable
					departments={data?.result || []}
					updateDep={
						canEdit
							? (form: { id: string; name: string; hod: string | null }) => {
									setEditId(form.id);
									setForm({ name: form.name, hod: form.hod });
									setModalVisible(true);
							  }
							: undefined
					}
				/>
				{data && data?.total > 0 && (
					<DynamicTablePagination
						disabled={isFetching}
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
			{(canCreate || canEdit) && (
				<DynamicModal
					close={() => {
						setModalVisible(false);
						setEditId(undefined);
						setForm({ name: '', hod: null });
					}}
					component={
						canCreate && bulkForm ? (
							<DynamicImportForm
								onSuccess={(data: any) => {
									open({
										type: 'success',
										message: data.message,
									});
									setModalVisible(false);
									setBulkForm(false);
								}}
								requirements={[
									{
										required: false,
										title: 'id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'name',
										value: 'finance',
									},
									{
										required: false,
										title: 'updated_at',
										value: '2023-03-26T21:49:51.090Z',
									},
									{
										required: false,
										title: 'created_at',
										value: '2023-03-26T21:49:51.090Z',
									},
								]}
								sample={samples.departments}
								url={DEPARTMENTS_IMPORT_URL}
							/>
						) : (
							<DynamicForm
								form={form}
								editId={editId}
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
										icon: FaCheckCircle,
										header: editId ? 'Department Edited' : 'Department Created',
										message: editId
											? 'Department Edited Successfully'
											: 'Department Created Successfully.',
									});
									setEditId(undefined);
									setForm({ name: '', hod: null });
								}}
							/>
						)
					}
					description={
						editId
							? 'Update Department'
							: 'Fill in the form below to add a department'
					}
					keepVisible
					title={editId ? 'Update Department' : 'Add Department'}
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Departments;
