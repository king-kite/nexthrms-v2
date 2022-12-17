import { useCallback, useState } from 'react';

import { Container, Modal } from '../../../components/common';
import {
	Cards,
	Form,
	Topbar,
	OvertimeAdminTable,
} from '../../../components/Overtime';
import {
	DEFAULT_PAGINATION_SIZE,
	OVERTIME_ADMIN_EXPORT_URL,
} from '../../../config';
import { useAlertContext } from '../../../store/contexts';
import {
	useGetAllOvertimeAdminQuery,
	useCreateOvertimeMutation,
} from '../../../store/queries';
import {
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	GetAllOvertimeResponseType,
} from '../../../types';
import { downloadFile } from '../../../utils';

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

	const { data, isLoading, isFetching, refetch } = useGetAllOvertimeAdminQuery(
		{
			limit: DEFAULT_PAGINATION_SIZE,
			offset,
			search,
			from: dateQuery?.from || undefined,
			to: dateQuery?.to || undefined,
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
			} else createOvertime(form);
		},
		[createOvertime]
	);

	return (
		<Container
			heading="Overtime (Admin)"
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
			<OvertimeAdminTable overtime={data?.result || []} />
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
		</Container>
	);
};

export default Overtime;
