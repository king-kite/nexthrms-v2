import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getAllOvertimeAdmin } from '../../../../db';
import { auth } from '../../../../middlewares';
import { OvertimeType } from '../../../../types';
import { validateParams } from '../../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getAllOvertimeAdmin({ ...params });

	const overtime = data.result.map((ove) => {
		const overtime = ove as OvertimeType;
		return {
			id: overtime.id,
			employee_id: overtime.employee.id,
			first_name: overtime.employee.user.firstName,
			last_name: overtime.employee.user.lastName,
			email: overtime.employee.user.email,
			date: overtime.date,
			type: overtime.type,
			status: overtime.status,
			reason: overtime.reason,
			created_by: overtime.createdBy ? overtime.createdBy.id : null,
			approved_by: overtime.approvedBy ? overtime.approvedBy.id : null,
			created_at: overtime.createdAt,
			updated_at: overtime.updatedAt,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(overtime);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="overtime.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Overtime'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Employee ID', key: 'employee_id', width: 10 },
			{ header: 'First Name', key: 'first_name', width: 10 },
			{ header: 'Last Name', key: 'last_name', width: 10 },
			{ header: 'E-mail', key: 'email', width: 10 },
			{ header: 'Date', key: 'date', width: 10 },
			{ header: 'Type', key: 'type', width: 10 },
			{ header: 'Status', key: 'status', width: 10 },
			{ header: 'Reason', key: 'reason', width: 10 },
			{ header: 'Created By', key: 'created_by', width: 10 },
			{ header: 'Approved By', key: 'approved_by', width: 10 },
			{ header: 'Created At', key: 'created_at', width: 10 },
			{ header: 'Updated At', key: 'updated_at', width: 10 },
		];

		worksheet.addRows(overtime);

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
			'attachment; filename="overtime.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
