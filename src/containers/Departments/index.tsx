import { Button, InputButton } from '@king-kite/react-kit';
import { useCallback, useRef, useState } from 'react';
import {
	FaCheckCircle,
	FaCloudDownloadAlt,
	FaPlus,
	FaSearch,
} from 'react-icons/fa';

import { Container, Modal } from '../../components/common';
import { Form, DepartmentTable } from '../../components/Departments';
import { useAlertModalContext } from '../../store/contexts';
import { useGetDepartmentsQuery } from '../../store/queries';
import { GetDepartmentsResponseType } from '../../types';

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

	const { open: openModal } = useAlertModalContext();

	const [offset, setOffset] = useState(0);
	const [nameSearch, setNameSearch] = useState('');

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
					<Button
						caps
						iconLeft={FaCloudDownloadAlt}
						onClick={() => window.alert('Downloading...')}
						margin="lg:mr-6"
						padding="px-3 py-2 md:px-6"
						rounded="rounded-xl"
						title="export"
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
