import { useCallback, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { Container, Modal } from '../../components/common';
import { Cards, ClientTable, Form, Topbar } from '../../components/Clients';
import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertModalContext } from '../../store/contexts';
import {
	useGetClientsQuery,
	useCreateClientMutation,
} from '../../store/queries';
import {
	ClientCreateQueryType,
	CreateClientErrorResponseType,
	GetClientsResponseType,
} from '../../types';
import { handleAxiosErrors } from '../../validators';

const Clients = ({ clients }: { clients: GetClientsResponseType['data'] }) => {
	const [modalVisible, setModalVisible] = useState(false);

	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');

	const { open: openModal } = useAlertModalContext();

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
		(form: ClientCreateQueryType) => {
			createClient(form);
		},
		[createClient]
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
			paginate={
				data
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
				openModal={() => {
					setModalVisible(true);
				}}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
			/>
			<ClientTable clients={data ? data.result : []} />
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
						onSubmit={(form: ClientCreateQueryType) => handleSubmit(form)}
						success={createData.isSuccess}
					/>
				}
				keepVisible
				description="Fill in the form below to add a new Client"
				title="Add Client"
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Clients;
