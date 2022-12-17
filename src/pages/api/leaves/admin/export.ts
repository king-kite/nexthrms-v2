import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getLeavesAdmin } from '../../../../db';
import { auth } from '../../../../middlewares';
import { LeaveType } from '../../../../types';
import { validateParams } from '../../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getLeavesAdmin({ ...params });

	const leaves = data.result.map((lve) => {
		const leave = lve as LeaveType;
		return {
			id: leave.id,
			employee_id: leave.employee.id,
			first_name: leave.employee.user.firstName,
			last_name: leave.employee.user.lastName,
			email: leave.employee.user.email,
			start_date: leave.startDate,
			end_date: leave.endDate,
			type: leave.type,
			status: leave.status,
			reason: leave.reason,
			created_by: leave.createdBy ? leave.createdBy.id : null,
			approved_by: leave.approvedBy ? leave.approvedBy.id : null,
			created_at: leave.createdAt,
			updated_at: leave.updatedAt,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(leaves);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="leaves.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Leaves'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Employee ID', key: 'employee_id', width: 10 },
			{ header: 'First Name', key: 'first_name', width: 10 },
			{ header: 'Last Name', key: 'last_name', width: 10 },
			{ header: 'E-mail', key: 'email', width: 10 },
			{ header: 'Start Date', key: 'start_date', width: 10 },
			{ header: 'End Date', key: 'end_date', width: 10 },
			{ header: 'Type', key: 'type', width: 10 },
			{ header: 'Status', key: 'status', width: 10 },
			{ header: 'Reason', key: 'reason', width: 10 },
			{ header: 'Created By', key: 'created_by', width: 10 },
			{ header: 'Approved By', key: 'approved_by', width: 10 },
			{ header: 'Created At', key: 'created_at', width: 10 },
			{ header: 'Updated At', key: 'updated_at', width: 10 },
		];

		worksheet.addRows(leaves);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader('Content-Disposition', 'attachment; filename="leaves.xlsx"');

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
