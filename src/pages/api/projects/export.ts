import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getProjects } from '../../../db';
import { auth } from '../../../middlewares';
import { ProjectType } from '../../../types';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getProjects({ ...params });

	const projects = data.result.map((project: ProjectType) => ({
		id: project.id,
		name: project.name,
		description: project.description,
		startDate: project.startDate,
		endDate: project.endDate,
		completed: project.completed,
		initial_cost: project.initialCost,
		rate: project.rate,
		priority: project.priority,
		client_id: project.client.id,
		client_company: project.client.company,
		client_position: project.client.position,
		client_first_name: project.client.contact.firstName,
		client_last_name: project.client.contact.lastName,
		client_email: project.client.contact.email,
		updated_at: project.updatedAt,
	}));

	if (req.query.type === 'csv') {
		const data = parse(projects);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="projects.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Projects'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Description', key: 'description', width: 10 },
			{ header: 'Start Date', key: 'startDate', width: 10 },
			{ header: 'End Date', key: 'endDate', width: 10 },
			{ header: 'Completed', key: 'completed', width: 10 },
			{ header: 'Initial Cost', key: 'initial_cost', width: 10 },
			{ header: 'Rate', key: 'rate', width: 10 },
			{ header: 'Priority', key: 'priority', width: 10 },
			{ header: 'Client ID', key: 'client_id', width: 10 },
			{ header: 'Client Company', key: 'client_company', width: 10 },
			{ header: 'Client Position', key: 'client_position', width: 10 },
			{ header: 'Client First Name', key: 'client_first_name', width: 10 },
			{ header: 'Client Last Name', key: 'client_last_name', width: 10 },
			{ header: 'Client Email', key: 'client_email', width: 10 },
			{ header: 'Last Update', key: 'updated_at', width: 10 },
		];

		worksheet.addRows(projects);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="projects.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
