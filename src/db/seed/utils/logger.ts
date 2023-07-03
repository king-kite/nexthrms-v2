const LCERROR = '\x1b[31m%s\x1b[0m'; //red
const LCWARN = '\x1b[33m%s\x1b[0m'; //yellow
const LCINFO = '\x1b[36m%s\x1b[0m'; //cyan
const LCSUCCESS = '\x1b[32m%s\x1b[0m'; //green

const logger = class {
	static error(message: string, ...optionalParams: string[]) {
		console.error(LCERROR, message, ...optionalParams);
	}
	static warn(message: string, ...optionalParams: string[]) {
		console.warn(LCWARN, message, ...optionalParams);
	}
	static info(message: string, ...optionalParams: string[]) {
		console.info(LCINFO, message, ...optionalParams);
	}
	static success(message: string, ...optionalParams: string[]) {
		console.info(LCSUCCESS, message, ...optionalParams);
	}
};

export default logger;
