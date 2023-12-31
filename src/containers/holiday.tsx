import dynamic from 'next/dynamic';
import React from 'react';

import { Topbar, HolidayTable } from '../components/holidays';
import Container from '../components/common/container';
import {
	DEFAULT_PAGINATION_SIZE,
	HOLIDAYS_EXPORT_URL,
	HOLIDAYS_IMPORT_URL,
	permissions,
	samples,
} from '../config';
import { useAlertContext, useAuthContext } from '../store/contexts';
import { useGetHolidaysQuery } from '../store/queries/holidays';
import { GetHolidaysResponseType } from '../types';
import { hasModelPermission } from '../utils';

const DynamicImportForm = dynamic<any>(
	() => import('../components/common/import-form').then((mod) => mod.default),
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
	() => import('../components/holidays/form').then((mod) => mod.default),
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
	() => import('../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);
const DynamicTablePagination = dynamic<any>(
	() =>
		import('../components/common/table/pagination').then((mod) => mod.default),
	{
		ssr: false,
	}
);

type HolidayCreateType = {
	name: string;
	date: string;
};

const Holidays = ({
	holidays,
}: {
	holidays: GetHolidaysResponseType['data'];
}) => {
	const [bulkForm, setBulkForm] = React.useState(false);
	const [modalVisible, setModalVisible] = React.useState(false);
	const [form, setForm] = React.useState({ name: '', date: '' });
	const [editId, setEditId] = React.useState<string>();

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');

	const paginateRef = React.useRef<{
		changePage: (num: number) => void;
	} | null>(null);

	const [canCreate, canView, canEdit, canExport] = React.useMemo(() => {
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
			limit,
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

	const handleChange = React.useCallback((name: string, value: string) => {
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
		>
			<Topbar
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setEditId(undefined);
					setForm({ name: '', date: '' });
					setModalVisible(true);
				}}
				loading={isFetching}
				onSubmit={(name: string) => {
					// change to page 1
					paginateRef.current?.changePage(1);
					setSearch(name);
				}}
				exportData={
					!canExport
						? undefined
						: {
								all: HOLIDAYS_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${limit}&search=${search}`,
						  }
				}
			/>
			{(canCreate || canView) && (
				<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
					<HolidayTable
						holidays={data ? data.result : []}
						offset={offset}
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
					{data && data?.total > 0 && (
						<DynamicTablePagination
							disabled={isFetching}
							totalItems={data.total}
							handleRef={{ ref: paginateRef }}
							onChange={(pageNo: number) => {
								const value = pageNo - 1 <= 0 ? 0 : pageNo - 1;
								offset !== value && setOffset(value * limit);
							}}
							onSizeChange={(size: number) => setLimit(size)}
							pageSize={limit}
						/>
					)}
				</div>
			)}
			{(canCreate || canEdit) && (
				<DynamicModal
					close={() => setModalVisible(false)}
					component={
						canCreate && bulkForm ? (
							<DynamicImportForm
								onSuccess={(data: any) => {
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
										title: 'name',
										value: 'finance',
									},
									{
										title: 'date',
										value: '2023-03-26T21:49:51.090Z',
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
								sample={samples.holiday}
								url={HOLIDAYS_IMPORT_URL}
							/>
						) : (
							<DynamicForm
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
						)
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
