import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getClients } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { GetClientsResponseType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.client.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const placeholder: GetClientsResponseType['data'] = {
		active: 0,
		inactive: 0,
		total: 0,
		result: [],
	};

	const result = await getRecords<GetClientsResponseType['data']>({
		model: 'clients',
		perm: 'client',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getClients(params);
		},
	});

	const data = result ? result.data : placeholder;

	const clients = data.result.map((client) => {
		return {
			id: client.id,
			company: client.company,
			position: client.position,
			first_name: client.contact.firstName,
			last_name: client.contact.lastName,
			email: client.contact.email,
			dob: client.contact.profile?.dob || null,
			gender: client.contact.profile?.gender || null,
			address: client.contact.profile?.address || null,
			phone: client.contact.profile?.phone || null,
			state: client.contact.profile?.state || null,
			city: client.contact.profile?.city || null,
			is_active: client.contact.isActive,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(clients);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Clients'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Company', key: 'company', width: 10 },
			{ header: 'Position', key: 'position', width: 10 },
			{ header: 'First Name', key: 'first_name', width: 10 },
			{ header: 'Last Name', key: 'last_name', width: 10 },
			{ header: 'Email Address', key: 'email', width: 10 },
			{ header: 'Date of Birth', key: 'dob', width: 10 },
			{ header: 'Gender', key: 'gender', width: 10 },
			{ header: 'Address', key: 'address', width: 10 },
			{ header: 'Phone', key: 'phone', width: 10 },
			{ header: 'State', key: 'state', width: 10 },
			{ header: 'City', key: 'city', width: 10 },
			{ header: 'Is Active', key: 'is_active', width: 10 },
		];

		worksheet.addRows(clients);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader('Content-Disposition', 'attachment; filename="clients.xlsx"');

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
