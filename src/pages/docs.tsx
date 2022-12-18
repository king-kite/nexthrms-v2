import { GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { createSwaggerSpec } from "next-swagger-doc";
import React from 'react';
import { Title } from "../utils"
import "swagger-ui-react/swagger-ui.css";

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
			paths: {
				"/api/auth/login/": {
					post: {
						// description: 'Sign In User',
						requestBody: {
							required: true,
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											email: {
												type: "string",
												format: "email",
											},
											password: {
												writeOnly: true,
												type: "string",
												format: "password",
											},
										},
										example: {
											email: "jandoe@gmail.com",
											password: "Password?1234",
										},
									},
								},
							},
						},
						responses: {
							"200": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/AuthUserDataModel",
										},
									}
								},
								description: "User Authentication Data",
							},
							"307": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/BaseErrorRedirectModel"
										}
									}
								},
								description: "Redirect the user to another page"
							},
							"400": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/LoginErrorModel"
										}
									}
								},
								description: "Bad Request"
							},
							"500": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/BaseErrorModel"
										}
									}
								},
								description: "Internal Server Error"
							}
						},
						summary: "Sign In User",
						tags: ["Authentication"],
					},
				},
				"/api/auth/user/": {
					get: {
						responses: {
							"200": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/AuthUserDataModel",
										},
									}	
								},
								description: "User Authentication Data",
							},
							"307": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/BaseErrorRedirectModel"
										}
									}
								},
								description: "Redirect the user to another page"
							},
							"401": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/BaseErrorModel",
										}
									}
								},
								description: "Authentication Failed"
							},
							"500": {
								content: {
									"application/json": {
										schema: {
											$ref: "#/components/schemas/BaseErrorModel"
										}
									}
								},
								description: "Internal Server Error"
							}
						},
						summary: "Get User Data",
						tags: ["Authentication"],
					},
				},
			},
			components: {
				schemas: {
					AuthUserDataModel: {
						type: "object",
						required: ["email", "firstName", "lastName", "fullName"],
						properties: {
							email: {
								type: "string",
								format: "email",
								example: "johndoe@gmail.com",
								description: "The user's email",
							},
							firstName: {
								type: "string",
								example: "John",
								description: "The user's first name",
							},
							fullName: {
								type: "string",
								example: "John Doe",
								description: "The user's first name + The user's last name",
							},
							lastName: {
								type: "string",
								example: "Doe",
								description: "The user's last name",
							},
							profile: {
								type: "object",
								nullable: true,
								required: ["image"],
								description:
									"An object containing the user's profile information",
								properties: {
									image: {
										type: "string",
										description: "The user's profile image",
										example: "/images/default.png",
									},
								},
								example: {
									image: "/images/default.png",
								},
							},
							employee: {
								type: "object",
								nullable: true,
								required: ["id"],
								description: "Information if the user is an employee.",
								properties: {
									id: {
										type: "string",
										format: 'uuid',
										description: "The user's employee ID",
									},
									job: {
										type: "object",
										nullable: true,
										required: ["name"],
										description: "Information about the employee job.",
										properties: {
											name: {
												type: "string",
												descrpition: "The name of the employee job",
											},
										},
									},
								},
							},
						},
						example: {
							email: "johndoe@gmail.com",
							firstName: "John",
							fullName: "John Doe",
							lastName: "Doe",
							profile: {
								image: "/images/default.png",
							},
							employee: {
								id: "0c5535d3-9c05-4704-9269-c7229115f6e3",
								job: {
									name: "CEO",
								},
							},
						},
					},
					BaseErrorModel: {
						type: 'object',
						properties: {
							status: {
								type: 'string',
								description: "returns 'error' or 'success' or 'redirect' ",
							},
							message: {
								type: 'string'
							}
						},
						// additionalProperties: true
					},
					BaseErrorRedirectModel: {
						allOf: [
							{
								$ref: "#/components/schemas/BaseErrorModel",
							},
							{
								type: "object",
								nullable: true,
								properties: {
									redirect: {
										type: 'object',
										properties: {
											url: {
												type: 'string',
												format: 'uri'
											}
										}
									}
								}
							}
						]
					},
					LoginErrorModel: {
						allOf: [
							{
								$ref: "#/components/schemas/BaseErrorModel",
							},
							{
								type: 'object',
								nullable: true,
								properties: {
									error: {
										type: 'object',
										nullable: true,
										properties: {
											email: {
												type: 'string',
												nullable: true,
											},
											password: {
												type: 'string',
												nullable: true,
											}
										}
									}
								}
							}
						]
					}
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
