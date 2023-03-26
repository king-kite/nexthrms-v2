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
	PROJECT_PAGE_URL,
	PROJECT_OBJECT_PERMISSIONS_PAGE_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useDeleteProjectMutation,
	useMarkProjectMutation,
} from '../../store/queries';
import { ProjectType } from '../../types';
import { getStringedDate, hasModelPermission } from '../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'priority' },
	{ value: 'start date' },
	{ value: 'deadline' },
	{ value: 'status' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: ProjectType[],
	actions: {
		deleteProject: ((e: string) => void) | null;
		markProject: ((e: ProjectType) => void) | null;
		objPermLink?: (id: string) => string;
	}
): TableRowType[] =>
	data.map((project) => {
		const buttons: {
			color: string;
			icon: IconType;
			onClick?: () => void;
			link?: string;
		}[] = [
			{
				color: 'primary',
				icon: FaArrowRight,
				link: PROJECT_PAGE_URL(project.id),
			},
		];
		if (actions.markProject !== null) {
			buttons.push({
				color: project.completed ? 'warning' : 'success',
				icon: project.completed ? FaExclamationCircle : FaCheckCircle,
				onClick: () => {
					actions?.markProject(project);
				},
			});
		}
		if (actions.deleteProject !== null) {
			buttons.push({
				color: 'danger',
				icon: FaTrash,
				onClick: () => {
					actions.deleteProject(project.id);
				},
			});
		}
		if (actions.objPermLink !== undefined) {
			buttons.push({
				color: 'info',
				icon: FaUserShield,
				link: actions.objPermLink(project.id),
			});
		}
		return {
			id: project.id,
			rows: [
				{
					link: PROJECT_PAGE_URL(project.id),
					value: project.name || '---',
				},
				{
					options: {
						bg:
							project.priority === 'MEDIUM'
								? 'warning'
								: project.priority === 'LOW'
								? 'green'
								: 'danger',
					},
					type: 'badge',
					value: project.priority,
				},
				{
					value: project.startDate ? getStringedDate(project.startDate) : '---',
				},
				{
					value: project.endDate ? getStringedDate(project.endDate) : '---',
				},
				{
					options: {
						bg: project.completed ? 'green' : 'warning',
					},
					type: 'badge',
					value: project.completed ? 'completed' : 'ongoing',
				},
				{
					type: 'actions',
					value: buttons,
				},
			],
		};
	});

type TableType = {
	projects: ProjectType[];
	loading: boolean;
};

const ProjectTable = ({ projects, loading }: TableType) => {
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
			  hasModelPermission(authData.permissions, [permissions.project.EDIT])
			: false;
		const canDelete = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [permissions.project.DELETE])
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

	const { deleteProject } = useDeleteProjectMutation({
		onSuccess() {
			showAlert({
				message: 'Project deleted successfully!',
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

	const { markProject } = useMarkProjectMutation({
		onSuccess() {
			showAlert({
				message: 'Project was updated successfully!',
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
			finalList = projects.filter((project) => project.completed === false);
		} else if (activeRow === 'completed') {
			finalList = projects.filter((project) => project.completed === true);
		} else {
			finalList = projects;
		}
		setRows(
			getRows(finalList, {
				deleteProject: canDelete ? deleteProject : null,
				markProject: canEdit ? markProject : null,
				objPermLink: canViewObjectPermissions
					? PROJECT_OBJECT_PERMISSIONS_PAGE_URL
					: undefined,
			})
		);
	}, [
		activeRow,
		projects,
		canEdit,
		canDelete,
		canViewObjectPermissions,
		deleteProject,
		markProject,
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
