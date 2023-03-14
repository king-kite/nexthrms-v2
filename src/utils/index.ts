export function isServer(): boolean {
	if (typeof window === undefined) return true;
	return false;
}

export { default as downloadFile } from './downloadFile';
export { hasModelPermission } from './permission';
export { default as toCapitalize } from './toCapitalize';

export * from './axios';
export * from './client';
export * from './components';
export * from './getDate';
