import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// const SwaggerUI = dynamic<{
// 	spec: any;
// }>(import('swagger-ui-react'), { ssr: false });

const SwaggerUI = dynamic<any>(import('swagger-ui-react'), { ssr: false });

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
	return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
	const spec: Record<string, any> = createSwaggerSpec({
		apiFolder: 'pages/api',
		definition: {
			openapi: '3.0.0',
			info: {
				description:
					'Kite Human Resource Management System. A human resource management system built using NextJs and Typescript',
				title: 'Kite HRMS',
				version: '1.0',
			},
			paths: {
				'/api/auth/login/': {
					post: {
						// description: 'Sign In User',
						requestBody: {
							required: true,
							content: {
								'application/json': {
									schema: {
										type: 'object',
										properties: {
											email: {
												type: 'string',
											},
											password: {
												type: 'string',
											},
										},
										example: {
											email: 'jandoe@gmail.com',
											password: 'Password?1234',
										},
									},
								},
							},
						},
						responses: {
							'200': {
								description: 'User Authentication Data',
							},
						},
						summary: 'Sign In User',
						tags: ['Authentication'],
					},
				},
			},
		},
	});

	return {
		props: {
			spec,
		},
	};
};

ApiDoc.noWrapper = true;

export default ApiDoc;
