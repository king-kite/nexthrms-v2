import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../../config';
import { getLeavesAdmin } from '../../../../db';
import { getRecords } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { GetLeavesResponseType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.leave.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const placeholder: GetLeavesResponseType['data'] = {
		approved: 0,
		denied: 0,
		pending: 0,
		result: [],
		total: 0,
	};

	const result = await getRecords<GetLeavesResponseType['data']>({
		model: 'leaves',
		perm: 'leave',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getLeavesAdmin(params);
		},
	});

	const data = result ? result.data : placeholder;

	const leaves = data.result.map((leave) => {
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
