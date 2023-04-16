import { USE_LOCAL_MEDIA_STORAGE } from '../../../config';
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

				valid.profile.image = result.secure_url || result.url;
				Object(valid.profile).imageStorageInfo = {
					id: result.public_id,
					name: result.original_filename,
					type: result.resource_type,
				};

				// delete the old user profile image
				if (req.user.profile?.image) {
					const profile = await prisma.profile.findUnique({
						where: {
							userId: req.user.id,
						},
						select: {
							imageStorageInfo: true,
						},
					});
					if (USE_LOCAL_MEDIA_STORAGE) {
						deleteFile(req.user.profile?.image).catch((error) => {
							console.log('DELETE PROFILE IMAGE FILE ERROR :>>', error);
						});
					} else if (
						profile?.imageStorageInfo &&
						(profile?.imageStorageInfo as any).public_id
					) {
						deleteFile((profile?.imageStorageInfo as any).public_id).catch(
							(error) => {
								console.log('DELETE PROFILE IMAGE FILE ERROR :>>', error);
							}
						);
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
				...valid,
				profile: {
					update: valid.profile,
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
