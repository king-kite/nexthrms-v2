import { useCallback, useMemo, useState } from 'react';

import { Container, Modal } from '../../../components/common';
import {
	Cards,
	Form,
	Topbar,
	LeaveAdminTable,
} from '../../../components/Leaves';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	LEAVES_ADMIN_EXPORT_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useGetLeavesAdminQuery,
	useCreateLeaveMutation,
} from '../../../store/queries';
import {
	CreateLeaveQueryType,
	CreateLeaveErrorResponseType,
	GetLeavesResponseType,
} from '../../../types';
import { downloadFile, hasModelPermission } from '../../../utils';

const Leave = ({ leaves }: { leaves: GetLeavesResponseType['data'] }) => {
	const [dateQuery, setDateQuery] = useState<{ from?: string; to?: string }>();
	const [errors, setErrors] = useState<
		CreateLeaveErrorResponseType & {
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
			  hasModelPermission(authData.permissions, [permissions.leave.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.leave.EXPORT])
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.leave.VIEW]) ||
			  !!authData.objPermissions.find(
					(perm) => perm.modelName === 'leaves' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, isLoading, isFetching, refetch } = useGetLeavesAdminQuery(
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
				return leaves;
			},
		}
	);

	const {
		mutate: createLeave,
		isLoading: createLoading,
		isSuccess,
	} = useCreateLeaveMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Leave was created successfully!',
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
		(form: CreateLeaveQueryType) => {
			setErrors(undefined);
			if (!form.employee) {
				setErrors((prevState) => ({
					...prevState,
					employee: 'Employee ID is required',
				}));
			} else if (canCreate) createLeave(form);
		},
		[canCreate, createLeave]
	);

	return (
		<Container
			heading="Leaves (Admin)"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
			loading={isLoading}
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
					let url = LEAVES_ADMIN_EXPORT_URL + '?type=' + type;
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
						name: type === 'csv' ? 'leaves.csv' : 'leaves.xlsx',
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
				<LeaveAdminTable leaves={data?.result || []} />
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
					description="Fill in the form below to create a leave"
					keepVisible
					title="Create Leave"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Leave;
