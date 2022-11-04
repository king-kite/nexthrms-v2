import { Prisma, Token } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { CONFIRM_EMAIL_PAGE_URL } from "../../../config";
import { prisma } from "../../../db";
import { createToken } from "../../../db/utils";
import { RegisterResponseType } from "../../../types";
import { hashPassword } from "../../../utils/bcrypt";
import { sendMail } from '../../../utils/emails';
import {
	handleJoiErrors,
	handlePrismaErrors,
	registerSchema,
} from "../../../validators";

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<RegisterResponseType>
) {
	if (req.method !== "POST") {
		res.setHeader("Allow", ["POST"]);
		return res.status(405).json({
			message: `'${req.method}' Method is not allowed'`,
			status: "error",
		});
	}
	try {
		const valid: {
			email: string;
			password: string;
			firstName?: string;
			lastName?: string;
		} = await registerSchema.validateAsync(
			{ ...req.body },
			{
				abortEarly: false,
			}
		);

		const hash = await hashPassword(valid.password);

		// TODO: Create Job called CEO
		const data: Prisma.UserCreateInput = {
			...valid,
			email: valid.email.toLowerCase().trim(),
			password: hash,
			profile: {
				create: {},
			},
			employee: {
				create: {
					dateEmployed: new Date(),
					job: {
						connectOrCreate: {
							where: {
								name: "CEO",
							},
							create: {
								name: "CEO",
							},
						},
					},
				},
			},
		};

		const user = await prisma.user.create({
			data,
			select: {
				id: true,
				email: true,
				profile: {
					select: {
						id: true,
					},
				},
			},
		});

		// Run the util function to create and send a new token
		createToken({
			uid: user.id,
			type: "EMAIL_VERIFICATION",
		})
			.then((token: Token) => {
				if (process.env.NODE_ENV === "development")
					console.log("TOKEN :>> ", token);
				let url = CONFIRM_EMAIL_PAGE_URL(user.id, token.token);
				if (req.headers.host || process.env.BASE_URL)
					url = (req.headers.host || process.env.BASE_URL) + url;
				sendMail({
					from: process.env.DEFAULT_FROM_EMAIL,
					to: user.email,
					subject: "Email Verification",
					html: `<a href="${url}">Click here to verify email</a>`,
				});
			})
			.catch((error) => {
				throw error;
			});

		return res.status(201).json({
			message:
				"Created user successfully. A verification email will be sent to your email address.",
			status: "success",
		});
	} catch (err) {
		const joiError = handleJoiErrors(err);
		if (joiError)
			return res.status(400).json({
				message: "Invalid Data",
				status: "error",
				error: joiError,
			});
		const prismaError = handlePrismaErrors(err);
		return res.status(prismaError?.code || 500).json(prismaError);
	}
}

export default handler;
