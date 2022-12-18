import { GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { createSwaggerSpec } from "next-swagger-doc";
import React from 'react';
import "swagger-ui-react/swagger-ui.css";

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
