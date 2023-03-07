import { Prisma } from '@prisma/client';
import { AxiosError } from 'axios';
import Joi from 'joi';
import {
	BaseResponseType,
	ErrorResponseType,
	RedirectResponseType,
	SuccessResponseType,
} from '../types';

export function handleAxiosErrors<T = any>(
	error: unknown
):
	| {
			status: number;
			data?: T;
			message: string;
	  }
	| undefined {
	if (error instanceof AxiosError) {
		if (error.response?.data) {
			if (isResponseWithError<T>(error.response.data)) {
				return {
					status: error.response.status,
					data: error.response.data.error,
					message: error.response.data.message,
				};
			}
			if (isResponseWithMessage(error.response.data)) {
				return {
					status: error.response.status,
					message: error.response.data.message,
				};
			}
		}
	}
	return undefined;
}

export function handleJoiErrors<T = any>(err: any): T | undefined {
	if (err instanceof Joi.ValidationError) {
		const data: any = new Object();
		err.details.forEach((item) => {
			if (item.context) {
				const label = item.context.label
					? item.context.label.toLowerCase().replace(' ', '_')
					: 'detail';
				Object.assign(data, {
					[item.context.key || label]: item.context.message || item.message,
				});
			}
		});
		return data;
	}
	return undefined;
}

type ErrorResponse = {
	code: number;
	message: string;
	status: 'error';
};

function getFieldText(error?: Prisma.PrismaClientKnownRequestError): string {
	// e.g. { target: [ 'email' ] }
	if (!error) return 'a field';
	const field =
		error.meta?.target && Array.isArray(error.meta.target)
			? error.meta.target.length <= 1
				? error.meta.target[0]
				: // Join the keys if more that one
				  error.meta.target.join('.')
			: undefined;
	return field ? `the ${field} field` : 'a field';
}

function getError(error: string, message: string) {
	if (process.env.NODE_ENV === 'development') return error + ':>> ' + message;
	return error;
}

export function handlePrismaErrors(
	error: unknown,
	options?: any
): ErrorResponse {
	const errors: ErrorResponse = {
		code: 500,
		message: 'An unknown error occured. Please try again.',
		status: 'error',
		...options,
	};

	if (error instanceof Prisma.PrismaClientValidationError) {
		errors.code = 400;
		errors.message = error.message;
	} else if (error instanceof Prisma.PrismaClientKnownRequestError) {
		let field = getFieldText();
		switch (error.code) {
			// Database Connection Errors
			case 'P1000':
			// errors.message =
			// 	process.env.NODE_ENV === 'development'
			// 		? 'Incorrect database authentication credentials. Unable to connect to the database server.'
			// 		: 'A database server error occurred.';
			// break;
			case 'P1001':
			case 'P1002':
			case 'P1003':
			case 'P1010':
			case 'P1013':
			case 'P1017':
				errors.message =
					process.env.NODE_ENV === 'development'
						? getError("Can't react the database server: ", error.message)
						: 'A database server error occurred.';
				break;
			case 'P1014':
			case 'P2021':
				errors.message = getError(
					'The specified table does not exist.',
					error.message
				);
				errors.code = 404;
				break;
			// Query Engine Errors
			case 'P2000':
				field = getFieldText(error);
				errors.message = getError(
					`The provided value for ${field} is too long.`,
					error.message
				);
				errors.code = 400;
				break;
			case 'P2001':
				field = getFieldText(error);
				errors.message = getError(
					`The record searched for ${field} does not exist.`,
					error.message
				);
				errors.code = 404;
				break;
			case 'P2002':
				field = getFieldText(error);
				errors.message = getError(
					`A record with ${field} already exist.`,
					error.message
				);
				errors.code = 400;
				break;
			case 'P2005':
			case 'P2006':
			case 'P2007':
				field = getFieldText(error);
				errors.message = getError(
					`The type of data entered for ${field} is invalid.`,
					error.message
				);
				errors.code = 400;
				break;
			case 'P2011':
			case 'P2012':
			case 'P2013':
				field = getFieldText(error);
				errors.message = getError(
					`The value for ${field} can not be empty.`,
					error.message
				);
				errors.code = 400;
				break;
			case 'P2015':
			case 'P2018':
				field = getFieldText(error);
				errors.message = getError(
					`A related record for ${field} was not found.`,
					error.message
				);
				errors.code = 404;
				break;
			case 'P2019':
			case 'P2020':
				field = getFieldText(error);
				errors.message = getError(
					`Invalid data entered for ${field}.`,
					error.message
				);
				errors.code = 400;
			case 'P2025':
				field = getFieldText(error);
				errors.message = getError(
					`This operation failed as a result of one or more dependency records associated with ${field}.`,
					error.message
				);
				errors.code = 404;
			default:
				if (process.env.NODE_ENV === 'development') {
					errors.message = 'Default Error: ' + error.message;
				}
				break;
		}
	} else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
		errors.code = 500;
		errors.message = error.message;
	} else if ((error as any).message && process.env.NODE_ENV === 'development')
		errors.message = (error as any).message;

	return errors;
}

// export function handlePrismaErrors<T = any>(
// 	error: unknown,
// 	options?: any
// ): {
// 	code?: number;
// 	status: 'error' | 'success';
// 	message: string;
// 	error: T;
// } {
// 	if (process.env.NODE_ENV === 'development') {
// 		return {
// 			message:
// 				(error as any).message ||
// 				'A server error occurred. Please try again later.',
// 			status: 'error',
// 			error,
// 			...options,
// 		};
// 	}
// 	return {
// 		message: 'A server error occurred. Please try again later.',
// 		status: 'error',
// 		...options,
// 	};
// }

export function isResponseWithMessage(
	response: unknown
): response is BaseResponseType {
	return (
		response !== null &&
		response !== undefined &&
		(response as any)?.message !== undefined
	);
}

export function isResponseWithData<DataType = unknown>(
	response: unknown
): response is SuccessResponseType<DataType> {
	return (
		response !== null &&
		response !== undefined &&
		(response as any)?.data !== undefined
	);
}

export function isResponseWithError<ErrorType = unknown>(
	response: unknown
): response is ErrorResponseType<ErrorType> {
	return (
		response !== null &&
		response !== undefined &&
		(response as any)?.error !== undefined
	);
}

export function isResponseWithRedirect(
	response: unknown
): response is RedirectResponseType {
	return (
		response !== null &&
		response !== undefined &&
		(response as any)?.redirect !== undefined &&
		(response as any)?.redirect.url !== undefined
	);
}
