import { DEFAULT_IMAGE, USE_LOCAL_MEDIA_STORAGE } from '../../../config';
import {
	getProfile,
	prisma,
	profileUserSelectQuery as profileSelect,
} from '../../../db';
import { auth } from '../../../middlewares';
import { ProfileUpdateType } from '../../../types';
import { deleteFile, upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { profileUpdateSchema } from '../../../validators';

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

		const valid: ProfileUpdateType = await profileUpdateSchema.validateAsync(
			form
		);

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

				const location = `media/users/profile/${name}`;

				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});

				Object(data.profile).image = {
					url: result.secure_url || result.url,
					name: result.original_filename,
					size: files.image.size,
					type: 'image',
					storageInfo: {
						id: result.public_id,
						name: result.original_filename,
						type: result.resource_type,
					},
				};

				// delete the old user profile image
				if (
					req.user.profile?.image &&
					req.user.profile.image.url !== DEFAULT_IMAGE
				) {
					const profile = await prisma.profile.findUnique({
						where: {
							userId: req.user.id,
						},
						select: {
							image: {
								select: {
									url: true,
									storageInfo: true,
								},
							},
						},
					});
					if (profile !== null && profile.image) {
						const id = USE_LOCAL_MEDIA_STORAGE
							? profile.image.url
							: (profile.image.storageInfo as any).public_id;
						deleteFile(id).catch((error) => {
							console.log('DELETE PROFILE IMAGE FILE ERROR :>>', error);
						});
					}
				}
			} catch (error) {
				if (process.env.NODE_ENV === 'development')
					console.log('PROFILE IMAGE ERROR :>> ', error);
			}
		}

		const user = await prisma.user.update({
			where: {
				id: req.user.id,
			},
			data: {
				...data,
				profile: {
					upsert: {
						create: {
							...data.profile,
							image: data.profile.image
								? {
										create: data.profile.image,
								  }
								: undefined,
						},
						update: {
							...data.profile,
							image: data.profile.image
								? {
										update: data.profile.image,
								  }
								: undefined,
						},
					},
				},
			},
			select: profileSelect,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Profile updated successfully!',
			data: user,
		});
	});
