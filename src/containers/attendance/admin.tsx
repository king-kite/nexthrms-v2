import { Alert } from 'kite-react-tailwind';
import React from 'react';

import {
	Container,
	ImportForm,
	Modal,
	TablePagination,
} from '../../components/common';
import {
	AdminTable as Table,
	Detail,
	Form,
	SearchForm,
	Topbar,
} from '../../components/attendance';
import {
	ATTENDANCE_ADMIN_EXPORT_URL,
	ATTENDANCE_ADMIN_IMPORT_URL,
	DEFAULT_PAGINATION_SIZE,
	permissions,
	samples,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useGetAttendanceAdminQuery } from '../../store/queries';
import {
	AttendanceCreateType,
	AttendanceType,
	GetAttendanceResponseType,
} from '../../types';
import { getDate, hasModelPermission } from '../../utils';

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

	const [bulkForm, setBulkForm] = React.useState(false);
	const [attendDetail, setAttendDetail] = React.useState<AttendanceType>();
	const [modalVisible, setModalVisible] = React.useState(false);
	const [searchForm, setSearchForm] = React.useState<{
		name?: string;
		startDate?: string;
		endDate?: string;
	}>();

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = React.useMemo(() => {
		if (!authData) return [false, false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.attendance.CREATE]);
		const canExport =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.attendance.EXPORT]);
		const canView =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.attendance.VIEW]) ||
			!!authData.objPermissions.find(
				(perm) => perm.modelName === 'attendance' && perm.permission === 'VIEW'
			);
		return [canCreate, canExport, canView];
	}, [authData]);

	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const { data, refetch, isLoading, isFetching } = useGetAttendanceAdminQuery(
		{
			limit,
			offset,
			search: searchForm?.name,
			date:
				searchForm?.startDate && searchForm?.endDate
					? {
							from: searchForm.startDate,
							to: searchForm.endDate,
					  }
					: undefined,
			onError(error) {
				showAlert({
					type: 'danger',
					message: error.message || 'Sorry, unable to fetch data!',
				});
			},
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
			error={!canCreate && !canView ? { statusCode: 403 } : undefined}
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
		>
			<Topbar
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setAttendDetail(undefined);
					setForm({
						employee: '',
						date: getDate(undefined, true) as string,
						punchIn: '08:00',
					});
					setModalVisible(true);
				}}
				exportData={
					!canExport
						? undefined
						: {
								all: ATTENDANCE_ADMIN_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${limit}&search=${
									searchForm?.name || ''
								}${
									searchForm?.startDate && searchForm?.endDate
										? `&from=${searchForm?.startDate}&to=${searchForm?.endDate}`
										: ''
								}`,
						  }
				}
			/>
			<div className="py-2 md:pt-4 lg:pt-6">
				<SearchForm
					form={searchForm}
					loading={isFetching}
					setForm={setSearchForm}
				/>
			</div>
			<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
				<Table
					attendance={data ? data.result : []}
					loading={isFetching}
					showAttendance={(attendance) => {
						setForm((prevState) => ({ ...prevState, editId: undefined }));
						setAttendDetail(attendance);
						setModalVisible(true);
					}}
					updateAtd={(form) => {
						setAttendDetail(undefined);
						setForm(form);
						setModalVisible(true);
					}}
				/>
				{data && data?.total > 0 && (
					<TablePagination
						disabled={isFetching}
						totalItems={data.total}
						onChange={(pageNo: number) => {
							const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
							offset !== value && setOffset(value * limit);
						}}
						onSizeChange={(size) => setLimit(size)}
						pageSize={limit}
					/>
				)}
			</div>

			<Modal
				close={() => setModalVisible(false)}
				component={
					attendDetail ? (
						<Detail
							data={attendDetail}
							editAttendance={(form) => {
								setAttendDetail(undefined);
								setForm(form);
							}}
							closePanel={() => setModalVisible(false)}
						/>
					) : bulkForm ? (
						<ImportForm
							onSuccess={(data) => {
								showAlert({
									type: 'success',
									message: data.message,
								});
								setModalVisible(false);
								setBulkForm(false);
							}}
							requirements={[
								{
									title: 'id',
									value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
								},
								{
									title: 'date',
									value: '2023-03-26T00:00:00.090Z',
								},
								{
									title: 'punch_in',
									value: '2023-03-26T08:00:0.090Z',
								},
								{
									required: false,
									title: 'punch_out',
									value: '2023-03-26T18:00:0.090Z',
								},
								{
									title: 'employee_id',
									value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
								},
								{
									required: false,
									title: 'updated_at',
									value: '2023-03-26T21:49:51.090Z',
								},
							]}
							sample={samples.attendance}
							url={ATTENDANCE_ADMIN_IMPORT_URL}
						/>
					) : form ? (
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
					) : (
						<div className="p-4">
							<Alert
								type="info"
								visible
								message="Sorry, unable to display any content at the moment."
								onClose={() => {
									setModalVisible(false);
								}}
							/>
						</div>
					)
				}
				keepVisible
				description={
					attendDetail
						? 'Below is more information about this attendance record'
						: 'Fill in the form below to ' +
						  (form?.editId
								? 'update attendance record'
								: 'add a new attendance record')
				}
				title={
					attendDetail
						? 'Attendance Information'
						: form?.editId
						? 'Update Attendance Record'
						: 'Add Attendance Record'
				}
				visible={modalVisible}
			/>
		</Container>
	);
}

export default AttendanceAdmin;
