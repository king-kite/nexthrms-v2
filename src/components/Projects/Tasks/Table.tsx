import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
	FaCheckCircle,
	FaExclamationCircle,
	FaEye,
	FaTrash,
} from 'react-icons/fa';

import { PROJECT_TASK_PAGE_URL } from '../../../config/routes';
import { useAlertContext } from '../../../store/contexts';
import {
	useDeleteProjectTaskMutation,
	useMarkProjectTaskMutation,
} from '../../../store/queries';
import { ProjectTaskType } from '../../../types';
import { getStringedDate } from '../../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'priority' },
	{ value: 'due date' },
	{ value: 'status' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: ProjectTaskType[],
	actions: {
		deleteTask: (q: { projectId: string; id: string }) => void;
		markTask: (e: ProjectTaskType) => void;
	}
): TableRowType[] =>
	data.map((task) => ({
		id: task.id,
		rows: [
			{
				link: PROJECT_TASK_PAGE_URL(task.project.id, task.id),
				value: task.name || '---',
			},
			{
				options: {
					bg:
						task.priority === 'MEDIUM'
							? 'warning'
							: task.priority === 'LOW'
							? 'green'
							: 'danger',
				},
				type: 'badge',
				value: task.priority,
			},
			{
				value: task.dueDate ? getStringedDate(task.dueDate) : '---',
			},
			{
				options: {
					bg: task.completed ? 'green' : 'warning',
				},
				type: 'badge',
				value: task.completed ? 'completed' : 'ongoing',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaEye,
						link: PROJECT_TASK_PAGE_URL(task.project.id, task.id),
					},
					{
						color: task.completed ? 'warning' : 'success',
						icon: task.completed ? FaExclamationCircle : FaCheckCircle,
						onClick: () => actions.markTask(task),
					},
					{
						color: 'danger',
						icon: FaTrash,
						onClick: () =>
							actions.deleteTask({ projectId: task.project.id, id: task.id }),
					},
				],
			},
		],
	}));

type TableType = {
	tasks: ProjectTaskType[];
	loading: boolean;
};

const ProjectTable = ({ tasks, loading }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);
	const [activeRow, setActiveRow] = useState<'all' | 'ongoing' | 'completed'>(
		'all'
	);

	const { open: showAlert } = useAlertContext();

	const { deleteTask } = useDeleteProjectTaskMutation({
		onSuccess() {
			showAlert({
				message: 'Task deleted successfully!',
				type: 'success',
			});
		},
		onError({ message }) {
			showAlert({
				message,
				type: 'danger',
			});
		},
	});

	const { markTask } = useMarkProjectTaskMutation({
		onSuccess() {
			showAlert({
				message: 'Task was updated successfully!',
				type: 'success',
			});
		},
		onError({ message }) {
			showAlert({
				message,
				type: 'danger',
			});
		},
	});

	useEffect(() => {
		let finalList;
		if (activeRow === 'ongoing') {
			finalList = tasks.filter((task) => task.completed === false);
		} else if (activeRow === 'completed') {
			finalList = tasks.filter((task) => task.completed === true);
		} else {
			finalList = tasks;
		}
		setRows(getRows(finalList, { deleteTask, markTask }));
	}, [activeRow, tasks, deleteTask, markTask]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table
				disabled={loading}
				heads={heads}
				rows={rows}
				renderActionLinkAs={({ link, children, ...props }) => (
					<Link href={link}>
						<a {...props}>{children}</a>
					</Link>
				)}
				renderContainerLinkAs={(props) => (
					<Link href={props.link}>
						<a className={props.className}>{props.children}</a>
					</Link>
				)}
				split={{
					actions: [
						{
							active: activeRow === 'all',
							onClick: () => setActiveRow('all'),
							title: 'all',
						},
						{
							active: activeRow === 'completed',
							onClick: () => setActiveRow('completed'),
							title: 'completed',
						},
						{
							active: activeRow === 'ongoing',
							onClick: () => setActiveRow('ongoing'),
							title: 'ongoing',
						},
					],
				}}
			/>
		</div>
	);
};

export default ProjectTable;
