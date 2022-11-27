import { useState } from 'react';

import { Container, Modal } from '../../components/common';
import { Cards, UserTable, Form, Topbar } from '../../components/Users';
import { DEFAULT_PAGINATION_SIZE, USERS_EXPORT_URL } from '../../config';
import { useAlertContext } from '../../store/contexts';
import { useCreateUserMutation, useGetUsersQuery } from '../../store/queries';
import { CreateUserErrorResponseType, GetUsersResponseType } from '../../types';
import { downloadFile } from '../../utils';

interface ErrorType extends CreateUserErrorResponseType {
	message?: string;
}

const Users = ({ users: userData }: { users: GetUsersResponseType }) => {
	const [errors, setErrors] = useState<ErrorType>();

	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();

	const { data, isFetching, isLoading, refetch } = useGetUsersQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
		},
		{
			initialData() {
				return userData;
			},
		}
	);

	const {
		mutate: createUser,
		isLoading: loading,
		isSuccess: formSuccess,
	} = useCreateUserMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'User was created successfully!',
			});
		},
		onError(err) {
			setErrors((prevState) => {
				if (err?.data)
					return {
						...prevState,
						...err?.data,
					};
				return {
					...prevState,
					message: err?.message || 'Unable to create user. Please try again!',
				};
			});
		},
	});

	return (
		<Container
			heading="Users"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			paginate={
				data
					? {
							offset,
							setOffset,
							loading: isFetching,
							totalItems: data.total || 0,
					  }
					: undefined
			}
		>
			<Cards
				active={data?.active || 0}
				leave={data?.on_leave || 0}
				inactive={data?.inactive || 0}
				employees={data?.employees || 0}
				clients={data?.clients || 0}
				total={data?.total || 0}
			/>
			<Topbar
				openModal={() => setModalVisible(true)}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={async (type, filtered) => {
					let url = USERS_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'data.csv' : 'data.xlsx',
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
			<div className="mt-3">
				<UserTable users={data?.result || []} />
			</div>
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						errors={errors}
						resetErrors={() => setErrors(undefined)}
						loading={loading}
						onSubmit={createUser}
						success={formSuccess}
					/>
				}
				description="Fill in the form below to add a new User"
				title="Add User"
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Users;
