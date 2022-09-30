import { InfoComp } from '@king-kite/react-kit';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
	FaCheckCircle,
	FaTimesCircle,
	FaUserCheck,
	FaUserEdit,
	FaUserSlash,
	FaLock,
	FaTrash,
} from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { UpdateForm } from '../../components/Clients';
import { ChangePasswordForm } from '../../components/Employees';

import { CLIENTS_PAGE_URL, DEFAULT_IMAGE } from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useActivateUserMutation,
	useDeleteClientMutation,
	useGetClientQuery,
} from '../../store/queries';
import { ClientType } from '../../types';
import { toCapitalize, getDate } from '../../utils';

const ClientDetail = ({ client }: { client: ClientType }) => {
	const router = useRouter();

	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = useState(false);
	const [formType, setFormType] = useState<'client' | 'password'>('client');

	const { open: showAlert } = useAlertContext();

	const { data, isLoading, isFetching, refetch } = useGetClientQuery(
		{ id },
		{
			initialData() {
				return client;
			},
		}
	);

	const { deleteClient, isLoading: delLoading } = useDeleteClientMutation({
		onSuccess() {
			router.push(CLIENTS_PAGE_URL);
		},
		onError({ message }) {
			showAlert({ type: 'success', message });
		},
	});

	const { activate, isLoading: loading } = useActivateUserMutation();

	return (
		<Container
			heading="Client Information"
			refresh={{
				onClick: refetch,
				loading: isFetching,
			}}
			title={data ? data.company.toUpperCase() : undefined}
			icon
			loading={isLoading}
		>
			{data && (
				<>
					<InfoTopBar
						email={data?.contact.email}
						full_name={toCapitalize(
							`${data?.contact.firstName} ${data?.contact.lastName}`
						)}
						image={data?.contact.profile?.image || DEFAULT_IMAGE}
						actions={[
							{
								onClick: () => {
									formType !== 'client' && setFormType('client');
									setModalVisible(true);
								},
								disabled: loading || delLoading,
								iconLeft: FaUserEdit,
								title: 'Edit Client',
							},
							{
								bg: 'bg-yellow-600 hover:bg-yellow-500',
								iconLeft: FaLock,
								disabled: loading || delLoading,
								onClick: () => {
									formType !== 'password' && setFormType('password');
									setModalVisible(true);
								},
								title: 'Change Password',
							},
							{
								bg: data.contact.isActive
									? 'bg-gray-500 hover:bg-gray-600'
									: 'bg-green-500 hover:bg-green-600',
								disabled: loading || delLoading,
								onClick: () =>
									data?.contact
										? activate(
												[data.contact.email],
												data.contact.isActive ? 'deactivate' : 'activate'
										  )
										: () => {},
								iconLeft: data.contact.isActive ? FaUserSlash : FaUserCheck,
								title: data.contact.isActive
									? loading
										? 'Deactivating...'
										: 'Deactivate Client'
									: loading
									? 'Activating...'
									: 'Activate Client',
							},
							{
								bg: 'bg-red-600 hover:bg-red-500',
								iconLeft: FaTrash,
								disabled: loading || delLoading,
								onClick: () => deleteClient(data.id),
								title: delLoading ? 'Deleting Client...' : 'Delete Client',
							},
						]}
					/>

					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'Company',
									value: data?.company?.toUpperCase() || '',
								},
								{ title: 'Position', value: data?.position || '' },
								{
									title: 'Status',
									type: 'badge',
									value: data.contact.isActive ? 'active' : 'inactive',
									options: {
										bg: data.contact.isActive ? 'success' : 'error',
										Icon: data.contact.isActive ? FaCheckCircle : FaTimesCircle,
									},
								},
							]}
							title="client information"
						/>
					</div>
					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'First Name',
									value: toCapitalize(data?.contact.firstName) || '',
								},
								{
									title: 'Last Name',
									value: toCapitalize(data?.contact.lastName) || '',
								},
								{ title: 'E-mail', value: data?.contact.email || '' },
								{
									title: 'Birthday',
									value: data?.contact.profile?.dob
										? (getDate(data.contact.profile.dob, true) as string)
										: '',
								},
								{
									title: 'Gender',
									value: toCapitalize(data?.contact?.profile?.gender) || '',
								},
							]}
							title="contact person information"
						/>
					</div>
					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'Phone',
									value: data?.contact.profile?.phone || '',
								},
								{
									title: 'Address',
									value: data?.contact.profile?.address || '',
								},
								{
									title: 'State',
									value: toCapitalize(data?.contact.profile?.state || ''),
								},
								{
									title: 'City',
									value: toCapitalize(data?.contact.profile?.city || ''),
								},
							]}
							title="contact & support information"
						/>
					</div>
					<Modal
						close={() => setModalVisible(false)}
						component={
							formType === 'client' && data !== undefined ? (
								<UpdateForm
									onSuccess={() => {
										showAlert({
											type: 'success',
											message: 'Client was updated successfully!',
										});
										setModalVisible(false);
									}}
									client={data}
								/>
							) : formType === 'password' && data ? (
								<ChangePasswordForm
									onSuccess={() => {
										setModalVisible(false);
										showAlert({
											type: 'success',
											message: 'Password changed successfully!',
										});
									}}
									email={data.contact.email}
								/>
							) : (
								<></>
							)
						}
						description={
							formType === 'password'
								? 'Fill the form to change client password'
								: 'Fill in the form to update client information'
						}
						keepVisible
						title={
							formType === 'password'
								? 'Change Client Password'
								: 'Update Client Information'
						}
						visible={modalVisible}
					/>
				</>
			)}
		</Container>
	);
};

export default ClientDetail;
