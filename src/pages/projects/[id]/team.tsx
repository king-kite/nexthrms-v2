import type { InferGetServerSidePropsType } from 'next';

import Team from '../../../containers/projects/detail/team';
import { getProject } from '../../../db';
import { getRecord } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';
import { uuidSchema } from '../../../validators';

const Page = ({
	project,
	objPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title
			title={`Project Team - ${project.name} - Project Team Information`}
		/>
		<Team projectData={project} objPerm={objPerm} />
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	params,
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('PROJECT TEAM :>> ', error);
	}

	if (!req.user) {
		return {
			props: {
				auth: undefined,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	try {
		await uuidSchema.validateAsync(params?.id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const record = await getRecord({
		model: 'projects',
		perm: 'project',
		objectId: params?.id as string,
		user: req.user,
		getData() {
			return getProject(params?.id as string);
		},
	});

	const auth = await serializeUserData(req.user);

	if (!record)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};
	if (!record.data)
		return {
			notFound: true,
		};

	return {
		props: {
			auth: req.user,
			objPerm: record.perm,
			project: record.data,
		},
	};
};

export default Page;
