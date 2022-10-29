import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getProjectTasks } from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { ProjectTaskType } from '../../../../../types';
import { validateParams } from '../../../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getProjectTasks({ ...params, id: req.query.id as string });

	const tasks = data.result.map((t) => {
		const task = t as ProjectTaskType;
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
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

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
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
