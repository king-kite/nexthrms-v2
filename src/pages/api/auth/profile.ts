import { MEDIA_PROFILE_URL } from '../../../config';
import prisma from '../../../db/client';
import {
	getProfile,
	profileUserSelectQuery as profileSelect,
} from '../../../db/queries/auth';
import { updateObjectPermissions } from '../../../db/utils/permission';
import { auth } from '../../../middlewares';
import { ProfileType } from '../../../types';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { profileUpdateSchema } from '../../../validators/auth';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const data = await getProfile(req.user.id);
		if (!data) {
			return res.status(404).json({
				status: 'error',
				message: 'Profile does not exist.!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched profile successfully!',
			data,
		});
	})
	.put(async (req, res) => {
		const { fields, files } = (await parseForm(req)) as {
			files: any;
			fields: any;
		};
		if (!fields.form) {
			return res.status(400).json({
				status: 'error',
				message: "'Form' field is required",
			});
		}
		const form = JSON.parse(fields.form);

		const valid = await profileUpdateSchema.validate(form, {
			abortEarly: false,
		});

		const data: any = {
			...valid,
			profile: {
				...valid.profile,
				image: valid.profile.image
					? {
							url: valid.profile.image,
					  }
					: undefined,
			},
		};

		if (files.image) {
			// Upload file to cloudinary or media folder

			try {
				const name = (
					valid.firstName +
					'_' +
					valid.lastName +
					'_' +
					valid.email
				).toLowerCase();

				const location = MEDIA_PROFILE_URL + name;

				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});

				Object(data.profile).image = {
					url: result.secure_url || result.url,
					name,
					size: files.image.size,
					type: 'image',
					storageInfo: {
						location: result.location,
						public_id: result.public_id,
						name: result.original_filename,
						type: result.resource_type,
					},
					userId: req.user.id,
				};
			} catch (error) {
				if (process.env.NODE_ENV === 'development')
					console.log('PROFILE IMAGE ERROR :>> ', error);
			}
		}

		const user = (await prisma.user.update({
			where: {
				id: req.user.id,
			},
			data: {
				...data,
				profile: {
					update: {
						...data.profile,
						image: data.profile.image
							? {
									upsert: {
										create: data.profile.image,
										update: data.profile.image,
									},
							  }
							: undefined,
					},
				},
			},
			select: profileSelect,
		})) as unknown as ProfileType;

		if (files.image && user.profile?.image) {
			// set managed files permissions
			await updateObjectPermissions({
				model: 'managed_files',
				objectId: user.profile.image.id,
				users: [req.user.id],
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Profile updated successfully!',
			data: user,
		});
	});
