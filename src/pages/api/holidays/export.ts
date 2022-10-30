import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getHolidays } from '../../../db';
import { auth } from '../../../middlewares';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getHolidays({ ...params });

	const holidays = data.result.map((holiday) => ({
		id: holiday.id,
		name: holiday.name,
		date: holiday.date,
	}));

	if (req.query.type === 'csv') {
		const data = parse(holidays);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="holidays.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Holidays'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Date', key: 'date', width: 10 },
		];

		worksheet.addRows(holidays);

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
			'attachment; filename="holidays.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
