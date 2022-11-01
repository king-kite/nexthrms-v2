import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';
import {
	FaCheckCircle,
	FaExclamationCircle,
	FaPen,
	FaTrash,
} from 'react-icons/fa';

import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import { useDeleteJobMutation } from '../../store/queries';
import { JobType } from '../../types/jobs';
import { toCapitalize } from '../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ type: 'actions', value: 'edit' },
];

const getRows = (
	data: JobType[],
	updateJob: (id: string, data: { name: string }) => void,
	deleteJob: (id: string) => void,
	disableAction: boolean
): TableRowType[] =>
	data.map((job) => ({
		id: job.id,
		rows: [
			{ value: toCapitalize(job.name) || '---' },
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						disabled: disableAction,
						icon: FaPen,
						onClick: () =>
							updateJob(job.id, {
								name: job.name,
							}),
					},
					{
						color: 'danger',
						disabled: disableAction,
						icon: FaTrash,
						onClick: () => deleteJob(job.id),
					},
				],
			},
		],
	}));

type TableType = {
	jobs: JobType[];
	updateJob: (id: string, data: { name: string }) => void;
};

const JobTable = ({ jobs = [], updateJob }: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	const { open: openAlert } = useAlertContext();
	const {
		close: closeModal,
		open: openModal,
		showLoader,
	} = useAlertModalContext();

	const { mutate: deleteJob, isLoading } = useDeleteJobMutation({
		onSuccess() {
			openModal({
				color: 'success',
				decisions: [
					{
						color: 'success',
						title: 'OK',
					},
				],
				Icon: FaCheckCircle,
				header: 'Job Deleted',
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
			openModal({
				closeOnButtonClick: true,
				color: 'warning',
				decisions: [
					{
						color: 'danger',
						disabled: isLoading,
						onClick: () => {
							showLoader();
							deleteJob(id);
						},
						title: 'Confirm',
					},
					{
						color: 'info',
						disabled: isLoading,
						onClick: closeModal,
						title: 'Cancel',
					},
				],
				Icon: FaExclamationCircle,
				header: 'Delete Job?',
				message: 'Do you want to delete this Job?.',
			});
		},
		[closeModal, isLoading, openModal, showLoader, deleteJob]
	);

	React.useEffect(() => {
		setRows(getRows(jobs, updateJob, handleDelete, isLoading));
	}, [jobs, updateJob, handleDelete, isLoading]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table heads={heads} rows={rows} tick />
		</div>
	);
};

export default JobTable;
