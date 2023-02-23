import React from 'react';

import { Container, Modal } from '../../components/common';
import {
	AdminTable as Table,
	Form,
	SearchForm,
	Topbar,
} from '../../components/Attendance';
import {
	ATTENDANCE_ADMIN_EXPORT_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../../config';
import { useAlertContext } from '../../store/contexts';
import { useGetAttendanceAdminQuery } from '../../store/queries';
import { AttendanceCreateType, GetAttendanceResponseType } from '../../types';
import { downloadFile, getDate } from '../../utils';

const date = new Date();
date.setHours(0, 0, 0, 0);

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
		date: getDate(undefined, true) as string,
		punchIn: '08:00',
	});

	const [modalVisible, setModalVisible] = React.useState(false);
	const [searchForm, setSearchForm] = React.useState<{
		name?: string;
		startDate?: string;
		endDate?: string;
	}>();
	const [exportLoading, setExportLoading] = React.useState(false);

	const { open: showAlert } = useAlertContext();

	const [offset, setOffset] = React.useState(0);
	const { data, refetch, isLoading, isFetching } = useGetAttendanceAdminQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search: searchForm?.name,
			date:
				searchForm?.startDate && searchForm?.endDate
					? {
							from: searchForm.startDate,
							to: searchForm.endDate,
					  }
					: undefined,
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
				openModal={() => {
					setForm({
						employee: '',
						date: getDate(undefined, true) as string,
						punchIn: '08:00',
					});
					setModalVisible(true);
				}}
				exportData={async (type, filtered) => {
					let url = ATTENDANCE_ADMIN_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${
								searchForm?.name || ''
							}`;
						if (searchForm?.startDate && searchForm?.endDate) {
							url += `&from=${searchForm?.startDate}&to=${searchForm?.endDate}`;
						}
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'attendance.csv' : 'attendance.xlsx',
						setLoading: setExportLoading,
					});
					if (result?.status !== 200) {
						showAlert({
							type: 'danger',
							message: 'An error occurred. Unable to export file!',
						});
					}
				}}
				exportLoading={exportLoading}
			/>
			<div className="py-2 md:pt-4 lg:pt-6">
				<SearchForm
					form={searchForm}
					loading={isFetching}
					setForm={setSearchForm}
				/>
			</div>
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
								date: getDate(undefined, true) as string,
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
