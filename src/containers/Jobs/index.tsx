import { Button, InputButton } from '@king-kite/react-kit';
import { useCallback, useRef, useState } from 'react';
import { FaCheckCircle, FaPlus, FaSearch } from 'react-icons/fa';

import { Container, Modal } from '../../components/common';
import { Form, JobTable } from '../../components/Jobs';
import { useAlertModalContext } from '../../store/contexts';
import { useGetJobsQuery } from '../../store/queries';
import { JobType } from '../../types';

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

	const { open: openModal } = useAlertModalContext();

	const [offset, setOffset] = useState(0);
	const [nameSearch, setNameSearch] = useState('');

	const searchRef = useRef<HTMLInputElement>(null);

	const { data, isLoading, isFetching, refetch } = useGetJobsQuery(
		{
			limit: 50,
			offset,
			search: nameSearch,
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
			disabledLoading={isLoading}
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
			<div className="flex flex-col md:flex-row md:items-center">
				<form
					className="flex items-center mb-3 pr-8 w-full lg:mb-0"
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
							padding: 'pl-2 pr-4 py-[0.545rem]',
							title: 'Search',
							type: 'submit',
						}}
						inputProps={{
							bdrColor: 'border-primary-500',
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
				<div className="flex w-full lg:justify-end">
					<div className="w-1/2">
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
				</div>
			</div>
			<JobTable
				jobs={data?.result || []}
				updateJob={(id: string, form: { name: string }) => {
					setEditId(id);
					setForm({ name: form.name });
					setModalVisible(true);
				}}
			/>
			<Modal
				close={() => {
					setModalVisible(false);
					setEditId(undefined);
					setForm({ name: '' });
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
		</Container>
	);
};

export default Jobs;
