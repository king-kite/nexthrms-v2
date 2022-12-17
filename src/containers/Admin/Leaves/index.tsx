import { useCallback, useState } from 'react';

import { Container, Modal } from '../../../components/common';
import {
	Cards,
	Form,
	Topbar,
	LeaveAdminTable,
} from '../../../components/Leaves';
import {
	DEFAULT_PAGINATION_SIZE,
	LEAVES_ADMIN_EXPORT_URL,
} from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import {
	useGetLeavesAdminQuery,
	useCreateLeaveMutation,
} from '../../../store/queries';
import {
	CreateLeaveQueryType,
	CreateLeaveErrorResponseType,
	GetLeavesResponseType,
} from '../../../types';
import { downloadFile } from '../../../utils';

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

	const { data, isLoading, isFetching, refetch } = useGetLeavesAdminQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
			from: dateQuery?.from || undefined,
			to: dateQuery?.to || undefined,
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
			} else createLeave(form);
		},
		[createLeave]
	);

	return (
		<Container
			heading="Leaves (Admin)"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
			paginate={
				data
					? {
							loading: isFetching,
							setOffset,
							offset,
							totalItems: data.total,
					  }
					: undefined
			}
		>
			<Cards
				approved={data?.approved || 0}
				denied={data?.denied || 0}
				pending={data?.pending || 0}
			/>
			<Topbar
				adminView
				loading={isFetching}
				dateForm={dateQuery}
				setDateForm={setDateQuery}
				searchSubmit={(value) => setSearch(value)}
				openModal={() => setModalVisible(true)}
				exportData={async (type, filtered) => {
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
			<LeaveAdminTable leaves={data?.result || []} />
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
		</Container>
	);
};

export default Leave;
