import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getHolidays } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { employeeMiddleware as employee } from '../../../middlewares/api';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin()
	.use(employee)
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.holiday.EXPORT]);
		if (!hasPerm) throw new NextApiErrorMessage(403);

		const placeholder = {
			total: 0,
			result: [],
		};

		const result = await getRecords({
			model: 'holiday',
			perm: 'holiday',
			user: req.user,
			query: req.query,
			placeholder,
			getData(params) {
				return getHolidays(params);
			},
		});

		const data = result ? result.data : placeholder;

		const holidays = data.result.map((holiday) => ({
			id: holiday.id,
			name: holiday.name,
			date: holiday.date,
		}));

		if (req.query.type === 'csv') {
			const data = parse(holidays);

			res.setHeader('Content-Type', 'text/csv');
			res.setHeader(
				'Content-Disposition',
				'attachment; filename="holidays.csv"'
			);

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
