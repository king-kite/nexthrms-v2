import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
	FaCheckCircle,
	FaExclamationCircle,
	FaEye,
	FaTrash,
} from 'react-icons/fa';

import { PROJECT_PAGE_URL } from '../../config/routes';
import { useAlertContext } from '../../store/contexts';
import {
	useDeleteProjectMutation,
	useMarkProjectMutation,
} from '../../store/queries';
import { ProjectType } from '../../types';
import { getStringedDate } from '../../utils';

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
		deleteProject: (e: string) => void;
		markProject: (e: ProjectType) => void;
	}
): TableRowType[] =>
	data.map((project) => ({
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
				value: [
					{
						color: 'primary',
						icon: FaEye,
						link: PROJECT_PAGE_URL(project.id),
					},
					{
						color: project.completed ? 'warning' : 'success',
						icon: project.completed ? FaExclamationCircle : FaCheckCircle,
						onClick: () => actions.markProject(project),
					},
					{
						color: 'danger',
						icon: FaTrash,
						onClick: () => actions.deleteProject(project.id),
					},
				],
			},
		],
	}));

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
		setRows(getRows(finalList, { deleteProject, markProject }));
	}, [activeRow, projects, deleteProject, markProject]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table
				disabled={loading}
				heads={heads}
				rows={rows}
				renderActionLinkAs={({ link, props, children }) => (
					<Link href={link}>
						<a className={props.className} style={props.style}>
							{children}
						</a>
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
