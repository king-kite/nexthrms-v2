import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getGroups } from '../../../db';
import { auth } from '../../../middlewares';
import { GroupType } from '../../../types';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getGroups(params);

	const groups = data.result.map((item) => {
		const group = item as GroupType;
		return {
			id: group.id,
			name: group.name,
			permissions: group.permissions.map(perm => perm.id).join(",")
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(groups);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="groups.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Groups'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Permissions', key: 'permissions', width: 10 },
		];

		worksheet.addRows(groups);

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
			'attachment; filename="groups.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
