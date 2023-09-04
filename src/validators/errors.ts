import { AxiosError } from 'axios';
import { ValidationError } from 'yup';
import { ResponseType, SuccessResponseType } from '../types';

function getYupError(path: string, value: string) {
	const keys = path.split('.');
	const result: { [key: string]: any } = {};

	let currentObj = result;
	keys.forEach((key, index) => {
		currentObj[key] = {};

		if (index === keys.length - 1) {
			currentObj[key] = value;
		}

		currentObj = currentObj[key];
	});
	return result;
}

export function handleYupErrors<T = { [key: string]: string }>(err: any): T | undefined {
	if (err instanceof ValidationError) {
		let errors: T | {} = {};
		if (err.inner.length > 0) {
			err.inner.forEach((error: ValidationError) => {
				const { path, message } = error;
				const parsedError = getYupError(path || 'message', message);

				if (path)
					errors = {
						...errors,
						...parsedError,
					};
			});
			return errors as T;
		} else {
			const parsedError = getYupError(err.path || 'message', err.errors[0] || err.message);
			errors = {
				...errors,
				...parsedError,
			};
			return errors as T;
		}
	}
	return undefined;
}

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
			if (isResponseWithData<T>(error.response.data)) {
				return {
					status: error.response.status,
					data: error.response.data.data,
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

export function isResponseWithMessage(response: unknown): response is ResponseType {
	return response !== null && response !== undefined && (response as any)?.message !== undefined;
}

export function isResponseWithData<DataType = unknown>(
	response: unknown
): response is SuccessResponseType<DataType> {
	return response !== null && response !== undefined && (response as any)?.data !== undefined;
}
