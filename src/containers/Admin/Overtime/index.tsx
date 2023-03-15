import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../../components/common';
import {
	Cards,
	Form,
	Topbar,
	OvertimeAdminTable,
} from '../../../components/Overtime';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	OVERTIME_ADMIN_EXPORT_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useGetAllOvertimeAdminQuery,
	useCreateOvertimeMutation,
} from '../../../store/queries';
import {
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	GetAllOvertimeResponseType,
} from '../../../types';
import { downloadFile, hasModelPermission } from '../../../utils';

const Overtime = ({
	overtime,
}: {
	overtime: GetAllOvertimeResponseType['data'];
}) => {
	const [dateQuery, setDateQuery] = useState<{ from?: string; to?: string }>();
	const [errors, setErrors] = useState<
		CreateOvertimeErrorResponseType & {
			message?: string;
		}
	>();
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canCreate, canExport, canView] = useMemo(() => {
		if (!authData?.isAdmin && !authData?.isSuperUser)
			return [false, false, false];

		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.overtime.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.overtime.EXPORT])
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.overtime.VIEW]) ||
			  !!authData.objPermissions.find(
					(perm) => perm.modelName === 'overtime' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetAllOvertimeAdminQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
			from: dateQuery?.from || undefined,
			to: dateQuery?.to || undefined,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
		},
		{
			initialData() {
				return overtime;
			},
		}
	);

	const {
		mutate: createOvertime,
		isLoading: createLoading,
		isSuccess,
	} = useCreateOvertimeMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Overtime was created successfully!',
			});
		},
		onError: (err) => {
			setErrors((prevState) => ({
				...prevState,
				...err,
			}));
		},
	});

	const handleSubmit = useCallback(
		(form: CreateOvertimeQueryType) => {
			setErrors(undefined);
			if (!form.employee) {
				setErrors((prevState) => ({
					...prevState,
					employee: 'Employee ID is required',
				}));
			} else if (canCreate) createOvertime(form);
		},
		[canCreate, createOvertime]
	);

	return (
		<Container
			heading="Overtime (Admin)"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
			paginate={
				(canCreate || canView) && data
					? {
							loading: isFetching,
							setOffset,
							offset,
							totalItems: data.total,
					  }
					: undefined
			}
		>
			{(canCreate || canView) && (
				<Cards
					approved={data?.approved || 0}
					denied={data?.denied || 0}
					pending={data?.pending || 0}
				/>
			)}
			<Topbar
				adminView
				loading={isFetching}
				dateForm={dateQuery}
				setDateForm={setDateQuery}
				searchSubmit={(value) => setSearch(value)}
				openModal={() => setModalVisible(true)}
				exportData={async (type, filtered) => {
					if (!canExport) return;
					let url = OVERTIME_ADMIN_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${
								search || ''
							}`;
						if (dateQuery?.from && dateQuery?.to) {
							url += `&from=${dateQuery.from}&to=${dateQuery.to}`;
						}
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'overtime.csv' : 'overtime.xlsx',
						setLoading: setExportLoading,
					});
					if (result?.status !== 200) {
						open({
							type: 'danger',
							message: 'An error occurred. Unable to export file!',
						});
					}
				}}
				exportLoading={exportLoading}
			/>
			{(canCreate || canView) && (
				<OvertimeAdminTable overtime={data?.result || []} />
			)}
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<Form
							adminView
							errors={errors}
							loading={createLoading}
							success={isSuccess}
							onSubmit={handleSubmit}
						/>
					}
					description="Fill in the form below to create a overtime"
					keepVisible
					title="Create Overtime"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Overtime;
