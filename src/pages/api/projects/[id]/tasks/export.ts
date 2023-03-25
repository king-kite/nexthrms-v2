import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../../../config';
import { getProjectTasks } from '../../../../../db';
import { getRecords, hasViewPermission } from '../../../../../db/utils';
import { admin } from '../../../../../middlewares';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';

export default admin()
	.use(async (req, res, next) => {
		// Check the user can view the project
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextApiErrorMessage(403);
		next();
	})
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EXPORT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const placeholder = {
			total: 0,
			result: [],
			project: {
				id: req.query.id as string,
				name: '',
			},
			ongoing: 0,
			completed: 0,
		};

		const result = await getRecords({
			model: 'projects_tasks',
			perm: 'projecttask',
			user: req.user,
			query: req.query,
			placeholder,
			getData(params) {
				return getProjectTasks({
					...params,
					id: req.query.id as string,
				});
			},
		});

		const data = result ? result.data : placeholder;

		const tasks = data.result.map((task) => {
			return {
				id: task.id,
				name: task.name,
				description: task.description,
				dueDate: task.dueDate,
				completed: task.completed,
				priority: task.priority,
				updated_at: task.updatedAt,
			};
		});

		let fileName = data.project.name + ' tasks';

		if (req.query.type === 'csv') {
			const data = parse(tasks);
			fileName += '.csv';
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="${fileName}"`
			);

			return res.status(200).end(data);
		} else {
			const workbook = new excelJS.Workbook(); // Create a new workbook
			const worksheet = workbook.addWorksheet('Projects'); // New Worksheet

			worksheet.columns = [
				{ header: 'ID', key: 'id', width: 10 },
				{ header: 'Name', key: 'name', width: 10 },
				{ header: 'Description', key: 'description', width: 10 },
				{ header: 'Due Date', key: 'dueDate', width: 10 },
				{ header: 'Completed', key: 'completed', width: 10 },
				{ header: 'Priority', key: 'priority', width: 10 },
				{ header: 'Last Update', key: 'updated_at', width: 10 },
			];

			worksheet.addRows(tasks);

			// Making first line in excel bold
			worksheet.getRow(1).eachCell((cell) => {
				cell.font = { bold: true };
			});

			fileName += '.xlsx';
			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			);
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="${fileName}"`
			);

			return workbook.xlsx.write(res).then(function () {
				res.status(200).end();
			});
		}
	});
