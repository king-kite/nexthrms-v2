export function isServer(): boolean {
	if (typeof window === undefined) return true;
	return false;
}

export function getByteSize(value: number): string {
	if (value < 1024 ** 1) return `${value}B`; // Byte
	if (value < 1024 ** 2) return `${(value / 1024 ** 1).toFixed(2)}KB`; // KiloByte
	if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(2)}MB`; // Megabyte
	return `${value / 1024 ** 3}GB`; // GigaByte
}

export { default as downloadFile } from './downloadFile';
export { hasModelPermission } from './permission';
export { default as toCapitalize } from './toCapitalize';

export * from './serializers';
export * from './dates';
