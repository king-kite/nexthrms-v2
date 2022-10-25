export function isServer(): boolean {
	if (typeof window === undefined) return true;
	return false;
}

export { default as downloadFile } from './downloadFile';
export { default as toCapitalize } from './toCapitalize';

export * from './axios';
export * from './components';
export * from './getDate';
