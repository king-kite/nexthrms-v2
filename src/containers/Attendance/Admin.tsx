import React from 'react';

import { Container, Modal } from '../../components/common';
import { AdminTable as Table, Form, Topbar } from '../../components/Attendance';
import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertContext } from '../../store/contexts';
import { useGetAttendanceAdminQuery } from '../../store/queries';
import { AttendanceCreateType, GetAttendanceResponseType } from '../../types';

function AttendanceAdmin({
	attendance,
}: {
	attendance: GetAttendanceResponseType['data'];
}) {
	const [form, setForm] = React.useState<
		AttendanceCreateType & {
			editId?: string;
		}
	>({
		employee: '',
		date: new Date().toLocaleDateString('en-Ca'),
		punchIn: '08:00',
	});
	const [dateQuery, setDateQuery] = React.useState({ from: '', to: '' });
	const [modalVisible, setModalVisible] = React.useState(false);
	const [search, setSearch] = React.useState('');

	const { open: showAlert } = useAlertContext();

	const [offset, setOffset] = React.useState(0);
	const { data, refetch, isLoading, isFetching } = useGetAttendanceAdminQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
		},
		{
			initialData() {
				return attendance;
			},
		}
	);

	const handleChange = React.useCallback((name: string, value: string) => {
		if (name === 'hours' || name === 'reason') {
			setForm((prevState) => ({
				...prevState,
				overtime: {
					hours: name === 'hours' ? parseInt(value) : 0,
					reason: name === 'reason' ? String(value) : '',
				},
			}));
		} else {
			setForm((prevState) => ({
				...prevState,
				[name]: value,
			}));
		}
	}, []);

	return (
		<Container
			heading="Attendance (Admin)"
			loading={isLoading}
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			paginate={
				data
					? {
							offset,
							setOffset,
							loading: isFetching,
							totalItems: data.total || 0,
					  }
					: undefined
			}
		>
			<Topbar
				loading={isFetching}
				dateSubmit={({ fromDate, toDate }) =>
					setDateQuery({ from: fromDate, to: toDate })
				}
				searchSubmit={(value) => setSearch(value)}
				openModal={() => {
					setForm({
						employee: '',
						date: new Date().toLocaleDateString('en-Ca'),
						punchIn: '08:00',
					});
					setModalVisible(true);
				}}
			/>
			<Table
				attendance={data ? data.result : []}
				loading={isFetching}
				updateAtd={(form) => {
					setForm(form);
					setModalVisible(true);
				}}
			/>
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						editId={form?.editId}
						form={form}
						onChange={handleChange}
						onSuccess={() => {
							setModalVisible(false);
							if (form?.editId) {
								showAlert({
									message: 'Attendance record was updated successfully!',
									type: 'success',
								});
							} else {
								showAlert({
									message: 'Attendance record was added successfully!',
									type: 'success',
								});
							}
							setForm({
								employee: '',
								date: new Date().toLocaleDateString('en-Ca'),
								punchIn: '08:00',
							});
						}}
					/>
				}
				keepVisible
				description={
					'Fill in the form below to ' +
					(form?.editId
						? 'update attendance record'
						: 'add a new attendance record')
				}
				title={
					form?.editId ? 'Update Attendance Record' : 'Add Attendance Record'
				}
				visible={modalVisible}
			/>
		</Container>
	);
}

export default AttendanceAdmin;
