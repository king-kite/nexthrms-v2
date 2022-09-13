export function isServer(): boolean {
	if (typeof window === undefined) return true;
	return false;
}

export { default as downloadFile } from './downloadFile';
export { default as omitKey } from './omitKey';
export { default as toCapitalize } from './toCapitalize';
export { default as validateForm } from './validateForm';

export * from './axios';
export * from './components';
export * from './getDate';
