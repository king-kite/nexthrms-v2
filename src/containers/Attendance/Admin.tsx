import { Alert } from 'kite-react-tailwind';
import React from 'react';

import { Container, Modal } from '../../components/common';
import {
	AdminTable as Table,
	Detail,
	Form,
	SearchForm,
	Topbar,
} from '../../components/Attendance';
import {
	ATTENDANCE_ADMIN_EXPORT_URL,
	DEFAULT_PAGINATION_SIZE,
	permissions,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useGetAttendanceAdminQuery } from '../../store/queries';
import {
	AttendanceCreateType,
	AttendanceType,
	GetAttendanceResponseType,
} from '../../types';
import { downloadFile, getDate, hasModelPermission } from '../../utils';

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

	const [attendDetail, setAttendDetail] = React.useState<AttendanceType>();
	const [modalVisible, setModalVisible] = React.useState(false);
	const [searchForm, setSearchForm] = React.useState<{
		name?: string;
		startDate?: string;
		endDate?: string;
	}>();
	const [exportLoading, setExportLoading] = React.useState(false);

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
			paginate={
				(canCreate || canView) && data
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
					setAttendDetail(undefined);
					setForm({
						employee: '',
						date: getDate(undefined, true) as string,
						punchIn: '08:00',
					});
					setModalVisible(true);
				}}
				exportData={async (type, filtered) => {
					if (!canExport) return;
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
