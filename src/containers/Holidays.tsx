import { useCallback, useMemo, useState } from 'react';

import { Form, Topbar, HolidayTable } from '../components/Holidays';
import { Container, Modal } from '../components/common';
import {
	DEFAULT_PAGINATION_SIZE,
	HOLIDAYS_EXPORT_URL,
	permissions,
} from '../config';
import { useAlertContext, useAuthContext } from '../store/contexts';
import { useGetHolidaysQuery } from '../store/queries';
import { GetHolidaysResponseType } from '../types';
import { downloadFile, hasModelPermission } from '../utils';

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
	const [exportLoading, setExportLoading] = useState(false);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');

	const [canCreate, canView, canEdit, canExport] = useMemo(() => {
		if (!authData) return [false, false, false, false];
		const canCreate =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.holiday.CREATE]);
		const canView =
			authData.isSuperUser ||
			!!authData.employee ||
			hasModelPermission(authData.permissions, [permissions.holiday.VIEW]) ||
			!!authData.objPermissions.find(
				(perm) => perm.modelName === 'holiday' && perm.permission === 'VIEW'
			);
		const canEdit =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.holiday.EDIT]);
		const canExport =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.holiday.EXPORT]);
		return [canCreate, canView, canEdit, canExport];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetHolidaysQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
			onError(error) {
				showAlert({
					type: 'danger',
					message: error.message,
				});
			},
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
			<Topbar
				openModal={() => {
					setEditId(undefined);
					setForm({ name: '', date: '' });
					setModalVisible(true);
				}}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportLoading={exportLoading}
				exportData={async (type, filtered) => {
					if (!canExport) return;
					let url = HOLIDAYS_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'holidays.csv' : 'holidays.xlsx',
						setLoading: setExportLoading,
					});
					if (result?.status !== 200) {
						showAlert({
							type: 'danger',
							message: 'An error occurred. Unable to export file!',
						});
					}
				}}
			/>
			{(canCreate || canView) && (
				<HolidayTable
					holidays={data ? data.result : []}
					onEdit={
						!canEdit
							? undefined
							: (id: string, data: HolidayCreateType) => {
									setEditId(id);
									setForm(data);
									setModalVisible(true);
							  }
					}
				/>
			)}
			{(canCreate || canEdit) && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<Form
							editId={canEdit && editId ? editId : undefined}
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
			)}
		</Container>
	);
};

export default Holidays;
