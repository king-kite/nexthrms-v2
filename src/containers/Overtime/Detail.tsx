import { ButtonType, InfoComp } from 'kite-react-tailwind';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { FaCheckCircle, FaEdit, FaTimesCircle, FaTrash } from 'react-icons/fa';

import { Container, InfoTopBar, Modal } from '../../components/common';
import { Form } from '../../components/Overtime';
import { DEFAULT_IMAGE } from '../../config';
import { useAlertContext } from '../../store/contexts';
import {
	useGetOvertimeQuery,
	useApproveOvertimeMutation,
	useDeleteOvertimeMutation,
	useRequestOvertimeUpdateMutation,
} from '../../store/queries';
import {
	CreateOvertimeErrorResponseType,
	CreateOvertimeQueryType,
	OvertimeType,
} from '../../types';
import { getDate } from '../../utils';

type ErrorType = CreateOvertimeErrorResponseType & {
	message?: string;
};

const Detail = ({
	admin,
	overtime,
}: {
	admin?: boolean;
	overtime: OvertimeType;
}) => {
	const router = useRouter();
	const id = router.query.id as string;

	const [modalVisible, setModalVisible] = useState(false);
	const [errors, setErrors] = useState<ErrorType>();

	const { open } = useAlertContext();

	const { data, isFetching, isLoading, refetch } = useGetOvertimeQuery(
		{ id, admin },
		{
			initialData() {
				return overtime;
			},
		}
	);
	const { mutate: approveOvertime, isLoading: appLoading } =
		useApproveOvertimeMutation({
			onRequestComplete({ message, error }) {
				open({
					type: error ? 'danger' : 'success',
					message: error || message,
				});
			},
		});
	const { deleteOvertime } = useDeleteOvertimeMutation({
		onSuccess() {
			router.back();
		},
		onError({ message }) {
			open({
				type: 'danger',
				message,
			});
		},
	});
	const { mutate: updateOvertime, isLoading: editLoading } =
		useRequestOvertimeUpdateMutation({
			onSuccess() {
				setModalVisible(false);
				open({
					type: 'success',
					message: 'Overtime request was updated successfully!',
				});
			},
			onError(err) {
				setErrors((prevState) => ({
					...prevState,
					...err,
				}));
			},
		});

	const handleSubmit = useCallback(
		(form: CreateOvertimeQueryType) => {
			setErrors(undefined);
			updateOvertime({ id, admin, data: form });
		},
		[updateOvertime, id, admin]
	);

	let actions: ButtonType[] = [
		{
			disabled: editLoading,
			iconLeft: FaEdit,
			onClick: () => setModalVisible(true),
			title: 'Request Overtime Update',
		},
		{
			bg: 'bg-red-600 hover:bg-red-500',
			iconLeft: FaTrash,
			disabled: appLoading,
			onClick: () => deleteOvertime(id),
			title: 'Delete Overtime',
		},
	];
	if (admin) {
		actions = [
			...actions,
			{
				bg: 'bg-green-600 hover:bg-green-500',
				disabled: appLoading,
				iconLeft: FaCheckCircle,
				onClick: () => approveOvertime({ id, approval: 'APPROVED' }),
				title: 'Approve Overtime',
			},
			{
				bg: 'bg-yellow-600 hover:bg-yellow-500',
				disabled: appLoading,
				iconLeft: FaTimesCircle,
				onClick: () => approveOvertime({ id, approval: 'DENIED' }),
				title: 'Deny Overtime',
			},
		];
	}

	return (
		<Container
			heading={admin ? 'Overtime Information (Admin)' : 'Overtime Information'}
			icon
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			loading={isLoading}
		>
			{data && (
				<>
					<InfoTopBar
						email={data.employee.user.email}
						full_name={
							data.employee.user.firstName + ' ' + data.employee.user.lastName
						}
						image={data.employee.user.profile?.image || DEFAULT_IMAGE}
						actions={actions}
					/>

					<div className="mt-4">
						<InfoComp
							infos={[
								{
									title: 'First Name',
									value: data.employee.user.firstName,
								},
								{
									title: 'Last Name',
									value: data.employee.user.lastName,
								},
								{ title: 'E-mail', value: data.employee.user.email },
								{
									title: 'Department',
									value: data.employee.department?.name || '------',
								},
								{ title: 'Job', value: data.employee.job?.name || '------' },
							]}
							title="employee information"
						/>

						<InfoComp
							infos={[
								{
									title: 'Type of Overtime',
									value: data.type,
								},
								{
									options: {
										bg:
											data.status === 'APPROVED'
												? 'success'
												: data.status === 'DENIED'
												? 'error'
												: data.status === 'PENDING'
												? 'warning'
												: 'info',
									},
									title: 'Status',
									value: data.status,
									type: 'badge',
								},
								{
									title: 'Date',
									value: getDate(data.date, true) as string,
								},
								{
									title: 'Hours',
									value: data.hours,
								},
								{ title: 'Reason For Overtime', value: data.reason },
								{
									title: 'Last Updated',
									value: getDate(data.updatedAt, true) as string,
								},
								{
									title: 'Date Requested',
									value: getDate(data.createdAt, true) as string,
								},
							]}
							title="overtime information"
						/>

						{data.createdBy && (
							<InfoComp
								infos={[
									{
										title: 'Profile Image',
										type: 'image',
										value: {
											src: data.createdBy.user.profile?.image || DEFAULT_IMAGE,
											alt:
												data.createdBy.user.firstName +
												' ' +
												data.createdBy.user.lastName,
										},
									},
									{
										title: 'First Name',
										value: data.createdBy.user.firstName,
									},
									{
										title: 'Last Name',
										value: data.createdBy.user.lastName,
									},
									{
										title: 'Email',
										value: data.createdBy.user.email,
									},
									{
										title: 'Department',
										value: data.createdBy.department?.name || '-------',
									},
									{
										title: 'Job',
										value: data.createdBy.job?.name || '-------',
									},
								]}
								title="Created By"
							/>
						)}

						{data.approvedBy && (
							<InfoComp
								infos={[
									{
										title: 'Profile Image',
										type: 'image',
										value: {
											src: data.approvedBy.user.profile?.image || DEFAULT_IMAGE,
											alt:
												data.approvedBy.user.firstName +
												' ' +
												data.approvedBy.user.lastName,
										},
									},
									{
										title: 'First Name',
										value: data.approvedBy.user.firstName,
									},
									{
										title: 'Last Name',
										value: data.approvedBy.user.lastName,
									},
									{
										title: 'Email',
										value: data.approvedBy.user.email,
									},
									{
										title: 'Department',
										value: data.approvedBy.department?.name || '-------',
									},
									{
										title: 'Job',
										value: data.approvedBy.job?.name || '-------',
									},
								]}
								title="Approved/Denied By"
							/>
						)}
					</div>
					<Modal
						close={() => setModalVisible(false)}
						component={
							<Form
								adminView={admin}
								errors={errors}
								initState={data}
								loading={editLoading}
								onSubmit={handleSubmit}
							/>
						}
						description="Fill in the form below to update overtime request."
						keepVisible
						title="Update overtime request"
						visible={modalVisible}
					/>
				</>
			)}
		</Container>
	);
};

Detail.defaultProps = {
	admin: false,
};

export default Detail;
