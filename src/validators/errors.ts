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

export function handlePrismaErrors<T = any>(
	error: unknown,
	options?: any
): {
	code?: number;
	status: 'error' | 'success';
	message: string;
	error: T;
} {
	if (process.env.NODE_ENV === 'development') {
		return {
			message:
				(error as any).message ||
				'A server error occurred. Please try again later.',
			status: 'error',
			error,
			...options,
		};
	}
	return {
		message: 'A server error occurred. Please try again later.',
		status: 'error',
		...options,
	};
}

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
