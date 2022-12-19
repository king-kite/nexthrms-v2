import { GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import Link from 'next/link';
import { createSwaggerSpec } from "next-swagger-doc";
import { Button } from 'kite-react-tailwind'
import React from 'react';
import "swagger-ui-react/swagger-ui.css";

import { ACCESS_TOKEN, HOME_PAGE_URL, REFRESH_TOKEN } from "../config";
import { paths, schemas } from "../documentation";
import { Title } from "../utils"

// const SwaggerUI = dynamic<{
// 	spec: any;
// }>(import('swagger-ui-react'), { ssr: false });

const SwaggerUI = dynamic<any>(import("swagger-ui-react"), { ssr: false });

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<React.Fragment>
			<Title title="KiteHRMS Swagger Documentation" />
			<div className="container mx-auto">
				<div className="flex justify-end px-2 py-4">
					<div>
						<Button 
							bg="bg-[#7eaf04] hover:bg-[#5a7d03]"
							link={HOME_PAGE_URL}
							padding="px-4 py-2 md:px-8 py-4"
							renderLinkAs={({children, link, ...props}) => (
								<Link href={link}>
									<a {...props}>{children}</a>
								</Link>
							)}
							title="Go to Dashboard"
							titleSize="text-base md:text-lg"
						/>
					</div>
				</div>
				<SwaggerUI spec={spec} />
			</div>
		</React.Fragment>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const spec: Record<string, any> = createSwaggerSpec({
		apiFolder: "pages/api",
		definition: {
			openapi: "3.0.0",
			info: {
				description:
					"Kite Human Resource Management System. A human resource management system built using NextJs and Typescript",
				title: "Kite HRMS",
				version: "1.0",
			},
			paths,
			components: {
				schemas,
				// securitySchemes: {
				// 	cookieAuth: {
				// 		type: 'apiKey',
				// 		in: 'cookie',
				// 		name: ACCESS_TOKEN
				// 	}
				// }
			},
			// security: [
			// 	{ cookieAuth: [] }
			// ]
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
