import { useCallback, useState } from 'react';

import { Form, Topbar, HolidayTable } from '../components/Holidays';
import { Container, Modal } from '../components/common';
import { DEFAULT_PAGINATION_SIZE } from '../config';
import { useAlertContext } from '../store/contexts';
import { useGetHolidaysQuery } from '../store/queries';
import { GetHolidaysResponseType } from '../types';

type HolidayCreateType = {
	name: string;
	date: string;
};

const Holidays = ({
	holidays,
}: {
	holidays: GetHolidaysResponseType['data'];
}) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState({ name: '', date: '' });
	const [editId, setEditId] = useState<string>();

	const { open: showAlert } = useAlertContext();

	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');

	const { data, isLoading, isFetching, refetch } = useGetHolidaysQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
		},
		{
			initialData() {
				return holidays;
			},
		}
	);

	const handleChange = useCallback((name: string, value: string) => {
		setForm((prevState) => ({ ...prevState, [name]: value }));
	}, []);

	return (
		<Container
			heading="Holidays"
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			disabledLoading={isLoading || isFetching}
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
			<Topbar
				openModal={() => {
					setEditId(undefined);
					setForm({ name: '', date: '' });
					setModalVisible(true);
				}}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
			/>
			<HolidayTable
				holidays={data ? data.result : []}
				onEdit={(id: string, data: HolidayCreateType) => {
					setEditId(id);
					setForm(data);
					setModalVisible(true);
				}}
			/>
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						editId={editId}
						form={form}
						onSuccess={() => {
							if (editId) setEditId(undefined);
							setModalVisible(false);
							showAlert({
								type: 'success',
								message: editId
									? 'Holiday updated successfully!'
									: 'Holiday created successfully!',
							});
						}}
						onChange={handleChange}
					/>
				}
				keepVisible
				description={
					editId
						? 'Fill in the form below to edit this holiday'
						: 'Fill in the form below to add a new holiday'
				}
				title={editId ? 'Edit Holiday' : 'Add a holiday'}
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Holidays;
