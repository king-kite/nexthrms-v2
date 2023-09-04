const message400 = 'Invalid data. Please try again!';
const message401 = 'Authentication credentials were not provided. Please try again!';
const message404 = 'A requested resource was not foudn!';
const message500 = 'A server error occurred! Please try again later.';

export class NextErrorMessage<T = any> extends Error {
	message: string;
	status: number = 500;
	data?: T;

	constructor(status: number = 500, message?: string, data?: T) {
		super(message);
		Object.setPrototypeOf(this, NextErrorMessage.prototype);

		this.name = 'NextErrorMessage';
		this.message = message
			? message
			: status === 400
			? message400
			: status === 401
			? message401
			: status === 404
			? message404
			: message500;
		this.status = status;
		this.data = data;
	}
}
