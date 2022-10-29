import {
	firebaseBucket,
	getProfile,
	prisma,
	profileUserSelectQuery as profileSelect,
} from '../../../db';
import { auth } from '../../../middlewares';
import { ProfileUpdateType } from '../../../types';
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
			// Upload a file to the bucket using firebase admin
			try {
				const name = (
					valid.firstName +
					'_' +
					valid.lastName +
					'_' +
					valid.email
				).toLowerCase();
				const splitText = files.image.originalFilename?.split('.');
				const extension = splitText[splitText.length - 1];
				const [obj, file] = await firebaseBucket.upload(files.image.filepath, {
					contentType: files.image.mimetype || undefined,
					destination: `users/profile/${name}.${extension}`,
				});
				valid.profile.image = file.mediaLink;
				Object(valid.profile).imageStorageInfo = {
					name: file.name,
					generation: file.generation,
				};
			} catch (error) {
				if (process.env.NODE_ENV === 'development')
					console.log('FIREBASE CONTACT IMAGE ERROR :>> ', error);
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
