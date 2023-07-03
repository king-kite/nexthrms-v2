import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';
import { IconType } from 'react-icons';
import {
	FaExclamationCircle,
	FaPen,
	FaTrash,
	FaUserShield,
} from 'react-icons/fa';

import { permissions, JOB_OBJECT_PERMISSIONS_PAGE_URL } from '../../config';
import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from '../../store/contexts';
import { useDeleteJobMutation } from '../../store/queries/jobs';
import { JobType } from '../../types/jobs';
import { hasModelPermission, toCapitalize } from '../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ type: 'actions', value: 'edit' },
];

const getRows = (
	data: JobType[],
	disableAction: boolean,
	canViewPermissions: boolean,
	updateJob?: (id: string, data: { name: string }) => void,
	deleteJob?: (id: string) => void
): TableRowType[] =>
	data.map((job) => {
		const actions: {
			color: string;
			disabled?: boolean;
			icon: IconType;
			link?: string;
			onClick?: () => void;
		}[] = [];
		if (updateJob)
			actions.push({
				color: 'primary',
				disabled: disableAction,
				icon: FaPen,
				onClick: () =>
					updateJob(job.id, {
						name: job.name,
					}),
			});
		if (deleteJob)
			actions.push({
				color: 'danger',
				disabled: disableAction,
				icon: FaTrash,
				onClick: () => deleteJob(job.id),
			});

		if (canViewPermissions)
			actions.push({
				color: 'info',
				icon: FaUserShield,
				link: JOB_OBJECT_PERMISSIONS_PAGE_URL(job.id),
			});

		return {
			id: job.id,
			rows: [
				{ value: job.name },
				{
					type: 'actions',
					value: actions,
				},
			],
		};
	});

type TableType = {
	jobs: JobType[];
	updateJob?: (id: string, data: { name: string }) => void;
};

const JobTable = ({ jobs = [], updateJob }: TableType) => {
	const { open: openAlert } = useAlertContext();
	const { data: authData } = useAuthContext();
	const {
		close: closeModal,
		open: openModal,
		showLoader,
	} = useAlertModalContext();

	const [canDelete, canViewPermissions] = React.useMemo(() => {
		if (!authData) return [false, false];
		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [permissions.job.DELETE]);
		const canViewPermission =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.permissionobject.VIEW,
			]);
		return [canDelete, canViewPermission];
	}, [authData]);

	const { mutate: deleteJob, isLoading } = useDeleteJobMutation({
		onSuccess() {
			closeModal();
			openAlert({
				type: 'success',
				message: 'Job Deleted Successfully.',
			});
		},
		onError(error) {
			closeModal();
			openAlert({
				message: error.message,
				type: 'danger',
			});
		},
	});

	const handleDelete = React.useCallback(
		(id: string) => {
			if (!canDelete) return;
			openModal({
				closeOnButtonClick: false,
				color: 'danger',
				decisions: [
					{
						color: 'info',
						disabled: isLoading,
						onClick: closeModal,
						title: 'Cancel',
					},
					{
						color: 'danger',
						disabled: isLoading,
						onClick: () => {
							showLoader();
							deleteJob(id);
						},
						title: 'Confirm',
					},
				],
				icon: FaExclamationCircle,
				header: 'Delete Job?',
				message: 'Do you want to delete this Job?.',
			});
		},
		[closeModal, canDelete, isLoading, openModal, showLoader, deleteJob]
	);

	const deferredValue = React.useDeferredValue(jobs);
	const rows = React.useMemo(
		() =>
			getRows(
				deferredValue,
				isLoading,
				canViewPermissions,
				updateJob,
				handleDelete
			),
		[deferredValue, updateJob, canViewPermissions, handleDelete, isLoading]
	);

	return <Table heads={heads} rows={rows} />;
};

export default JobTable;
