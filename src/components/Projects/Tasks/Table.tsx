import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import {
	FaArrowRight,
	FaCheckCircle,
	FaExclamationCircle,
	FaTrash,
	FaUserShield,
} from 'react-icons/fa';

import {
	permissions,
	PROJECT_TASK_PAGE_URL,
	PROJECT_TASK_OBJECT_PERMISSIONS_PAGE_URL,
} from '../../../config';
import { useAlertContext, useAuthContext } from '../../../store/contexts';
import {
	useDeleteProjectTaskMutation,
	useMarkProjectTaskMutation,
} from '../../../store/queries';
import { ProjectTaskType } from '../../../types';
import { getStringedDate, hasModelPermission } from '../../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'priority' },
	{ value: 'due date' },
	{ value: 'status' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: ProjectTaskType[],
	{
		objPermLink,
		deleteTask,
		markTask,
	}: {
		objPermLink?: (id: string) => string;
		deleteTask?: (q: { projectId: string; id: string }) => void;
		markTask?: (e: ProjectTaskType) => void;
	}
): TableRowType[] =>
	data.map((task) => {
		const buttons: {
			color: string;
			icon: IconType;
			onClick?: () => void;
			link?: string;
		}[] = [
			{
				color: 'primary',
				icon: FaArrowRight,
				link: PROJECT_TASK_PAGE_URL(task.project.id, task.id),
			},
		];
		if (markTask) {
			buttons.push({
				color: task.completed ? 'warning' : 'success',
				icon: task.completed ? FaExclamationCircle : FaCheckCircle,
				onClick: () => markTask(task),
			});
		}
		if (deleteTask) {
			buttons.push({
				color: 'danger',
				icon: FaTrash,
				onClick: () => deleteTask({ projectId: task.project.id, id: task.id }),
			});
		}
		if (objPermLink) {
			buttons.push({
				color: 'info',
				icon: FaUserShield,
				link: objPermLink(task.id),
			});
		}
		return {
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
					value: buttons,
				},
			],
		};
	});

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
	const { data: authData } = useAuthContext();

	// has model permission
	const [canEdit, canDelete, canViewObjectPermissions] = useMemo(() => {
		const canEdit = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.projecttask.EDIT])
			: false;
		const canDelete = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.projecttask.DELETE,
			  ])
			: false;
		const canViewObjectPermissions = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.permissionobject.VIEW,
					]))
			: false;
		return [canEdit, canDelete, canViewObjectPermissions];
	}, [authData]);

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
		setRows(
			getRows(finalList, {
				deleteTask: canDelete ? deleteTask : undefined,
				markTask: canEdit ? markTask : undefined,
				objPermLink: canViewObjectPermissions
					? PROJECT_TASK_OBJECT_PERMISSIONS_PAGE_URL
					: undefined,
			})
		);
	}, [
		activeRow,
		canEdit,
		canDelete,
		canViewObjectPermissions,
		tasks,
		deleteTask,
		markTask,
	]);

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
