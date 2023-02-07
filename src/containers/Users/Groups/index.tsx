import { useState } from 'react';

import { Container, Modal } from '../../../components/common';
import { GroupTable, Form, Topbar } from '../../../components/Groups';
import { DEFAULT_PAGINATION_SIZE, GROUPS_EXPORT_URL } from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import {
	useCreateGroupMutation,
	useGetGroupsQuery,
} from '../../../store/queries';
import {
	CreateGroupErrorResponseType,
	GetGroupsResponseType,
} from '../../../types';
import { downloadFile } from '../../../utils';

interface ErrorType extends CreateGroupErrorResponseType {
	message?: string;
}

const Groups = ({
	groups: groupData,
}: {
	groups: GetGroupsResponseType['data'];
}) => {
	const [errors, setErrors] = useState<ErrorType>();
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	const { open } = useAlertContext();

	const { data, isFetching, refetch } = useGetGroupsQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
			users: {
				limit: DEFAULT_PAGINATION_SIZE,
				offset: 0,
				search: '',
			},
		},
		{
			initialData() {
				return groupData;
			},
		}
	);

	const {
		mutate: createGroup,
		isLoading: loading,
		isSuccess: formSuccess,
	} = useCreateGroupMutation({
		onSuccess() {
			setModalVisible(false);
			open({
				type: 'success',
				message: 'Group was created successfully!',
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
					message: err?.message || 'Unable to create group. Please try again!',
				};
			});
		},
	});

	return (
		<Container
			heading="Groups"
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
			<Topbar
				openModal={() => setModalVisible(true)}
				loading={isFetching}
				onSubmit={(name: string) => setSearch(name)}
				exportData={async (type, filtered) => {
					let url = GROUPS_EXPORT_URL + '?type=' + type;
					if (filtered) {
						url =
							url +
							`&offset=${offset}&limit=${DEFAULT_PAGINATION_SIZE}&search=${search}`;
					}
					const result = await downloadFile({
						url,
						name: type === 'csv' ? 'groups.csv' : 'groups.xlsx',
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
				<GroupTable groups={data?.result || []} />
			</div>
			<Modal
				close={() => setModalVisible(false)}
				component={
					<Form
						errors={errors}
						resetErrors={() => setErrors(undefined)}
						loading={loading}
						success={formSuccess}
						onSubmit={createGroup}
					/>
				}
				description="Fill in the form below to add a new group"
				title="Add Group"
				visible={modalVisible}
			/>
		</Container>
	);
};

export default Groups;