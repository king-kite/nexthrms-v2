import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getJobs } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.job.EXPORT]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	const placeholder = {
		total: 0,
		result: [],
	};

	const result = await getRecords({
		query: req.query,
		user: req.user,
		model: 'jobs',
		perm: 'job',
		placeholder,
		getData(params) {
			return getJobs(params);
		},
	});

	const data = result ? result.data : placeholder;

	const jobs = data.result.map((job) => ({
		id: job.id,
		name: job.name,
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
		res.setHeader('Content-Disposition', 'attachment; filename="jobs.xlsx"');

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
