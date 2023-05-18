import { userHeaders as headers, permissions } from '../../../config';
import { getUsers } from '../../../db';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { NextApiRequestExtendUser, UserType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

type ResponseType = {
	total: number;
	result: DataType[];
	inactive: number;
	active: number;
	on_leave: number;
	employees: number;
	clients: number;
};

type DataType = UserType & {
	permissions: {
		codename: string;
	}[];
	groups: {
		name: string;
	}[];
};

async function getUsersData(req: NextApiRequestExtendUser) {
	const placeholder: ResponseType = {
		result: [],
		total: 0,
		inactive: 0,
		active: 0,
		on_leave: 0,
		employees: 0,
		clients: 0,
	};
	const result = await getRecords<ResponseType>({
		model: 'users',
		perm: 'user',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getUsers<DataType>({
				...params,
				select: {
					permissions: {
						select: {
							codename: true,
						},
					},
					groups: {
						select: {
							name: true,
						},
					},
				},
			});
		},
	});
	const data = result ? result.data : placeholder;

	const users = data.result.map((user) => {
		return {
			id: user.id,
			email: user.email,
			first_name: user.firstName,
			last_name: user.lastName,
			dob: user.profile?.dob || null,
			gender: user.profile?.gender || null,
			image: user.profile?.image || null,
			address: user.profile?.address || null,
			phone: user.profile?.phone || null,
			state: user.profile?.state || null,
			city: user.profile?.city || null,
			permissions: user.permissions.map((perm) => perm.codename).join(','),
			groups: user.groups.map((group) => group.name).join(','),
			is_active: user.isActive,
			is_admin: user.isAdmin,
			is_superuser: user.isSuperUser,
			email_verified: user.isEmailVerified,
			updated_at: user.updatedAt,
			created_at: user.createdAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: users.map((user) => user.id),
		model: 'users',
	});

	return {
		data: users,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	getUsersData(req)
		.then((data) => {
			return exportData(data, headers, {
				type: (req.query.type as string) || 'csv',
				userId: req.user.id,
			});
		})
		.then((data) => {
			let message =
				'File exported successfully. Click on the download link to proceed!';
			if (data.size) {
				const size = String(data.size / (1024 * 1024));
				const sizeString =
					size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
				message = `File (${sizeString}MB) exported successfully. Click on the download link to proceed!`;
			}
			createNotification({
				message,
				messageId: data.file,
				recipient: req.user.id,
				title: 'Users data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Users data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
