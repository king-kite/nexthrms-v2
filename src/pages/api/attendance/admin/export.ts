import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../../config';
import { getAttendanceAdmin } from '../../../../db';
import { getRecords } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.attendance.EXPORT,
		]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	const placeholder = {
		total: 0,
		result: [],
	};
	const result = await getRecords({
		model: 'attendance',
		perm: 'attendance',
		query: req.query,
		placeholder,
		user: req.user,
		getData(params) {
			return getAttendanceAdmin(params);
		},
	});

	const data = result ? result.data : placeholder;

	const attendance = data.result.map((attend) => {
		return {
			id: attend.id,
			employee_id: attend.employee.id,
			first_name: attend.employee.user.firstName,
			last_name: attend.employee.user.lastName,
			email: attend.employee.user.email,
			date: attend.date,
			punch_in: attend.punchIn,
			punch_out: attend.punchOut,
			last_update: attend.updatedAt,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(attendance);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="attendance.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Attendance'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Date', key: 'date', width: 10 },
			{ header: 'Punch In', key: 'punch_in', width: 10 },
			{ header: 'Punch Out', key: 'punch_out', width: 10 },
			{ header: 'Employee ID', key: 'employee_id', width: 10 },
			{ header: 'First Name', key: 'first_name', width: 10 },
			{ header: 'Last Name', key: 'last_name', width: 10 },
			{ header: 'Email Address', key: 'email', width: 10 },
			{ header: 'Last Update', key: 'last_update', width: 10 },
		];

		worksheet.addRows(attendance);

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
			'attachment; filename="attendance.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
