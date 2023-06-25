import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

import { permissions } from '../config';
import { authPage } from '../middlewares';
import { ExtendedGetServerSideProps } from '../types';
import { hasModelPermission, Title } from '../utils';
import { serializeUserData } from '../utils/serializers';

const DynamicDocComponent = dynamic<any>(import('../containers/docs'), {
	ssr: false,
});

function ApiDoc() {
	return (
		<>
			<Title title="KiteHRMS Swagger Documentation" />
			<DynamicDocComponent />
		</>
	);
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		try {
			await authPage().run(req, res);
		} catch (error) {
			if (process.env.NODE_ENV === 'development')
				console.log('DOCS PAGE :>> ', error);
		}

		if (!req.user) {
			return {
				props: {
					auth: null,
					errorPage: {
						statusCode: 401,
					},
				},
			};
		}

		const auth = await serializeUserData(req.user);

		if (!req.user.isSuperUser && !req.user.isAdmin) {
			return {
				props: {
					auth,
					errorPage: {
						statusCode: 403,
					},
				},
			};
		}

		if (
			!req.user.isSuperUser &&
			!hasModelPermission(req.user.allPermissions, [permissions.apidoc.VIEW])
		) {
			return {
				props: {
					auth,
					errorPage: {
						statusCode: 403,
					},
				},
			};
		}

		return {
			props: {
				auth,
			},
		};
	} catch (error) {
		return {
			props: {
				errorPage: {
					statusCode: 500,
					message: (error as any)?.message,
				},
			},
		};
	}
};

ApiDoc.noWrapper = true;

export default ApiDoc;
