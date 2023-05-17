import {
	DEFAULT_IMAGE,
	DEFAULT_PASSWORD,
	userHeaders as headers,
	permissions,
} from '../../../config';
import { prisma } from '../../../db';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	UserImportQueryType,
	ObjectPermissionImportType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getUserInput(user: UserImportQueryType) {
	return {
		id: user.id && user.id.length > 0 ? user.id : undefined,
		email: user.email,
		firstName: user.first_name,
		lastName: user.last_name,
		profile: {
			dob: user.dob ? new Date(user.dob) : undefined,
			gender: user.gender || 'MALE',
			image: user.image || DEFAULT_IMAGE,
			address: user.address,
			city: user.city,
			state: user.state,
			phone: user.phone,
		},
		permissions: user.permissions ? user.permissions.split(',') : null,
		groups: user.groups ? user.groups.split(',') : null,
		isActive: !!user.is_active,
		isAdmin: !!user.is_admin,
		isSuperUser: !!user.is_superuser,
		isEmailVerified: !!user.email_verified,
		updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
		createdAt: user.created_at ? new Date(user.created_at) : new Date(),
	};
}

function createUsers(
	req: NextApiRequestExtendUser,
	data: UserImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getUserInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.user.upsert({
						where: data.id
							? {
									id: data.id,
							  }
							: {
									email: data.email,
							  },
						update: {
							...data,
							profile: {
								update: data.profile,
							},
							permissions: data.permissions
								? {
										set: data.permissions.map((codename) => ({ codename })),
								  }
								: undefined,
							groups: data.groups
								? {
										set: data.groups.map((name) => ({ name })),
								  }
								: undefined,
						},
						create: {
							...data,
							password: DEFAULT_PASSWORD,
							profile: {
								create: data.profile,
							},
							permissions: data.permissions
								? {
										connect: data.permissions.map((codename) => ({ codename })),
								  }
								: undefined,
							groups: data.groups
								? {
										connect: data.groups.map((name) => ({ name })),
								  }
								: undefined,
						},
						select: {
							id: true,
						},
					})
				)
			);
			await Promise.all(
				result.map((user) =>
					addObjectPermissions({
						model: 'users',
						objectId: user.id,
						users: [req.user.id],
					})
				)
			);
			if (perms) await importPermissions(perms);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

export default admin().post(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.CREATE]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const { files } = (await parseForm(req)) as { files: any };

	if (!files.data)
		throw new NextApiErrorMessage(400, 'Data field is required!');

	if (
		files.data.mimetype !== 'text/csv' &&
		files.data.mimetype !== 'application/zip' &&
		files.data.mimetype !==
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	)
		throw new NextApiErrorMessage(
			400,
			'Sorry, only CSVs, Microsoft excel files and Zip files are allowed!'
		);

	importData<UserImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
		zipName: 'users.csv',
	})
		.then((result) => createUsers(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Users data was imported successfully.',
				recipient: req.user.id,
				title: 'Import User Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import User Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
