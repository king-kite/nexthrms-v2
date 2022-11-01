import { Button, ButtonDropdown, InputButton } from 'kite-react-tailwind';
import { useCallback, useRef, useState } from 'react';
import {
	FaCheckCircle,
	FaCloudDownloadAlt,
	FaPlus,
	FaSearch,
} from 'react-icons/fa';

import { Container, ExportForm, Modal } from '../../components/common';
import { Form, DepartmentTable } from '../../components/Departments';
import { DEFAULT_PAGINATION_SIZE, DEPARTMENTS_EXPORT_URL } from '../../config';
import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import { useGetDepartmentsQuery } from '../../store/queries';
import { GetDepartmentsResponseType } from '../../types';
import { downloadFile } from '../../utils';

const Departments = ({
	departments,
}: {
	departments: GetDepartmentsResponseType['data'];
}) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState<{
		name: string;
		hod: string | null;
	}>({ name: '', hod: null });
	const [editId, setEditId] = useState<string>();

	const { open } = useAlertContext();
	const { open: openModal } = useAlertModalContext();

	const [offset, setOffset] = useState(0);
	const [nameSearch, setNameSearch] = useState('');
	const [exportLoading, setExportLoading] = useState(false);

	const searchRef = useRef<HTMLInputElement>(null);

	const { data, isFetching, refetch } = useGetDepartmentsQuery(
		{
			limit: 50,
			offset,
			search: nameSearch,
		},
		{
			initialData() {
				return departments;
			},
		}
	);

	const handleChange = useCallback((name: string, value: string | null) => {
		setForm((prevState) => ({ ...prevState, [name]: value }));
	}, []);

	return (
		<Container
			heading="Departments"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			paginate={
				data
					? {
							loading: isFetching,
							offset,
							setOffset,
							totalItems: data.total || 0,
					  }
					: undefined
			}
		>
			<div className="flex flex-col my-2 w-full lg:flex-row lg:items-center">
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
							disabled: isFetching,
							iconLeft: FaSearch,
							padding: 'pl-2 pr-4 py-[0.545rem]',
							title: 'Search',
							type: 'submit',
						}}
						inputProps={{
							bdrColor: 'border-primary-500',
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
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:px-4 xl:px-5 xl:w-1/4">
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
				<div className="my-3 pr-4 w-full sm:w-1/3 lg:my-0 lg:pr-0 lg:pl-4 xl:pl-5 xl:w-1/4">
					<ButtonDropdown
						component={() => (
							<ExportForm
								loading={exportLoading}
								onSubmit={async (type: 'csv' | 'excel', filtered: boolean) => {
									let url = DEPARTMENTS_EXPORT_URL + '?type=' + type;
									if (filtered) {
										url =
											url +
											`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${nameSearch}`;
									}
									const result = await downloadFile({
										url,
										name:
											type === 'csv' ? 'departments.csv' : 'departments.xlsx',
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
			</div>
			<DepartmentTable
				departments={data?.result || []}
				updateDep={(form: { id: string; name: string; hod: string | null }) => {
					setEditId(form.id);
					setForm({ name: form.name, hod: form.hod });
					setModalVisible(true);
				}}
			/>
			<Modal
				close={() => {
					setModalVisible(false);
					setEditId(undefined);
					setForm({ name: '', hod: null });
				}}
				component={
					<Form
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
								Icon: FaCheckCircle,
								header: editId ? 'Department Edited' : 'Department Created',
								message: editId
									? 'Department Edited Successfully'
									: 'Department Created Successfully.',
							});
							setEditId(undefined);
							setForm({ name: '', hod: null });
						}}
					/>
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
		</Container>
	);
};

export default Departments;
