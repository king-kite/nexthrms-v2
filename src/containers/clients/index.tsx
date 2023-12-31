import dynamic from 'next/dynamic';
import React from 'react';

import Container from '../../components/common/container';
import { Cards, ClientTable, Topbar } from '../../components/clients';
import {
	permissions,
	samples,
	CLIENTS_EXPORT_URL,
	CLIENTS_IMPORT_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../../config';
import { useAuthContext, useAlertContext } from '../../store/contexts';
import {
	useGetClientsQuery,
	useCreateClientMutation,
} from '../../store/queries/clients';
import {
	CreateClientErrorResponseType,
	GetClientsResponseType,
} from '../../types';
import { hasModelPermission } from '../../utils';
import { handleAxiosErrors } from '../../validators';

const DynamicImportForm = dynamic<any>(
	() =>
		import('../../components/common/import-form').then((mod) => mod.default),
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
	() => import('../../components/clients/form').then((mod) => mod.default),
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
	() => import('../../components/common/modal').then((mod) => mod.default),
	{
		ssr: false,
	}
);

const DynamicTablePagination = dynamic<any>(
	() =>
		import('../../components/common/table/pagination').then(
			(mod) => mod.default
		),
	{
		ssr: false,
	}
);

const Clients = ({ clients }: { clients: GetClientsResponseType['data'] }) => {
	const [bulkForm, setBulkForm] = React.useState(false);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [offset, setOffset] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const paginateRef = React.useRef<{
		changePage: (num: number) => void;
	} | null>(null);

	const [canCreate, canExport, canView] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.client.CREATE])
			: false;
		const canExport = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.client.EXPORT])
			: false;
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.client.VIEW]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) => perm.modelName === 'clients' && perm.permission === 'VIEW'
			  )
			: false;
		return [canCreate, canExport, canView];
	}, [authData]);

	const { data, refetch, isLoading, isFetching } = useGetClientsQuery(
		{
			limit,
			offset,
			search,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get data!',
					type: 'danger',
				});
			},
		},
		{
			initialData() {
				return clients;
			},
		}
	);
	const { mutate: createClient, ...createData } = useCreateClientMutation(
		{
			onSuccess() {
				setModalVisible(false);
				open({
					message: 'Client was added successfully!',
					type: 'success',
				});
			},
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				open({
					message: error?.message || 'Failed to create client',
					type: 'danger',
				});
			},
		}
	);

	const handleSubmit = React.useCallback(
		(form: FormData) => {
			if (canCreate) createClient(form);
		},
		[canCreate, createClient]
	);

	const createError = createData.error
		? handleAxiosErrors<CreateClientErrorResponseType>(createData.error)
		: undefined;

	return (
		<Container
			heading="Clients"
			disabledLoading={isLoading}
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			{(canView || canCreate) && (
				<Cards
					active={data ? data.active : 0}
					inactive={data ? data.inactive : 0}
					total={data ? data.total : 0}
				/>
			)}
			<Topbar
				openModal={(bulk = false) => {
					setBulkForm(bulk);
					setModalVisible(true);
				}}
				loading={isFetching}
				onSubmit={(name: string) => {
					// change paage to 1
					paginateRef.current?.changePage(1);
					setSearch(name);
				}}
				exportData={
					!canExport
						? undefined
						: {
								all: CLIENTS_EXPORT_URL,
								filtered: `&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`,
						  }
				}
			/>
			{(canView || canCreate) && (
				<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
					<ClientTable clients={data ? data.result : []} offset={offset} />
					{data && data?.total > 0 && (
						<DynamicTablePagination
							disabled={isFetching}
							handleRef={{
								ref: paginateRef,
							}}
							totalItems={data.total}
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
			{canCreate && (
				<DynamicModal
					close={() => setModalVisible(false)}
					component={
						bulkForm ? (
							<DynamicImportForm
								onSuccess={(data: any) => {
									open({
										type: 'success',
										message: data.message,
									});
									setModalVisible(false);
									setBulkForm(false);
								}}
								requirements={[
									{
										required: false,
										title: 'id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
									},
									{
										title: 'company',
										value: 'Forest Co',
									},
									{
										title: 'position',
										value: 'Business Consultant',
									},
									{
										title: 'contact_id',
										value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
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
								sample={samples.clients}
								url={CLIENTS_IMPORT_URL}
							/>
						) : (
							<DynamicForm
								errors={
									createError
										? { ...createError?.data, message: createError.message }
										: undefined
								}
								loading={createData.isLoading}
								onSubmit={(form: FormData) => handleSubmit(form)}
								success={createData.isSuccess}
							/>
						)
					}
					keepVisible
					description="Fill in the form below to add a new Client"
					title="Add Client"
					visible={modalVisible}
				/>
			)}
		</Container>
	);
};

export default Clients;
