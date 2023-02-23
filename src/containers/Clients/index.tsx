import { useCallback, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { Container, Modal } from '../../components/common';
import { Cards, ClientTable, Form, Topbar } from '../../components/Clients';
import { permissions, CLIENTS_EXPORT_URL, DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAuthContext, useAlertContext, useAlertModalContext } from '../../store/contexts';
import {
	useGetClientsQuery,
	useCreateClientMutation,
} from '../../store/queries';
import {
	CreateClientErrorResponseType,
	GetClientsResponseType,
} from '../../types';
import { downloadFile, hasPermission } from '../../utils';
import { handleAxiosErrors } from '../../validators';

const Clients = ({ clients }: { clients: GetClientsResponseType['data'] }) => {
	const [modalVisible, setModalVisible] = useState(false);

	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();
	const { open: openModal } = useAlertModalContext();
	const { data: authData } = useAuthContext();

	const canCreate = authData ? authData.isSuperUser || hasPermission(authData.permissions, [permissions.client.CREATE]) : false;
	const canExport = authData ? authData.isSuperUser || hasPermission(authData.permissions, [permissions.client.EXPORT]) : false;
	// TODO: Add Object Level Permissions As Well
	const canView = authData ? authData.isSuperUser || hasPermission(authData.permissions, [permissions.client.VIEW]) : false;

	const { data, refetch, isLoading, isFetching } = useGetClientsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
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
				openModal({
					closeOnButtonClick: true,
					color: 'success',
					decisions: [
						{
							color: 'success',
							title: 'OK',
						},
					],
					Icon: FaCheckCircle,
					header: 'Client Added',
					message: 'Client was added successfully!',
				});
			},
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				openModal({
					closeOnButtonClick: true,
					color: 'danger',
					decisions: [
						{
							color: 'danger',
							title: 'OK',
						},
					],
					Icon: FaTimesCircle,
					header: 'Create client failed!',
					message: error?.message || 'Failed to create client',
				});
			},
		}
	);

	const handleSubmit = useCallback(
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
			error={!canView && {
				statusCode: 403,
				title: 'You are not authorized to view this page!'
			}}
			paginate={
				canView && data
					? {
							loading: isFetching,
							offset,
							setOffset,
							totalItems: data.total || 0,
					  }
					: undefined
			}
		>
			<Cards
				active={data ? data.active : 0}
				inactive={data ? data.inactive : 0}
				total={data ? data.total : 0}
			/>
			<Topbar
				openModal={() => setModalVisible(true)}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={async (type, filtered) => {
					if (canExport) {
						let url = CLIENTS_EXPORT_URL + '?type=' + type;
						if (filtered) {
							url =
								url +
								`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
						}
						const result = await downloadFile({
							url,
							name: type === 'csv' ? 'clients.csv' : 'clients.xlsx',
							setLoading: setExportLoading,
						});
						if (result?.status !== 200) {
							open({
								type: 'danger',
								message: 'An error occurred. Unable to export file!',
							});
						}
					}
				}}
				exportLoading={exportLoading}
			/>
			<ClientTable clients={data ? data.result : []} />
			{canCreate && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<Form
							errors={
								createError
									? { ...createError?.data, message: createError.message }
									: undefined
							}
							loading={createData.isLoading}
							onSubmit={(form: FormData) => handleSubmit(form)}
							success={createData.isSuccess}
						/>
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
