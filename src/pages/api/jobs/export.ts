import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getJobs } from '../../../db';
import { auth } from '../../../middlewares';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getJobs({ ...params });

	const jobs = data.result.map((job) => ({
		id: job.id,
		name: job.name
	}));

	if (req.query.type === 'csv') {
		const data = parse(jobs);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="jobs.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Jobs'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
		];

		worksheet.addRows(jobs);

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
			'attachment; filename="jobs.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
