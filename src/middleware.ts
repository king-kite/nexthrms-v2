// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
	models,
	OBJECT_PERMISSIONS_PAGE_URL,
	USE_LOCAL_MEDIA_STORAGE,
} from './config';
import { PermissionModelNameType } from './types';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export function middleware(request: NextRequest) {
	// Check to see if the url endswith object-permissions
	// And rewrite the page to the users permissions objects [model] [objectId] page
	if (
		!request.url.includes('/api') && // check the request doesnt include the /api routes
		(request.url.endsWith('object-permissions') ||
			request.url.endsWith('object-permissions/'))
	) {
		const requestUrl = request.url.endsWith('/')
			? request.url.slice(0, request.url.length - 1)
			: request.url;

		const splitKeys = requestUrl.split('/');

		let modelName: PermissionModelNameType | undefined = splitKeys[
			splitKeys.length - 2
		] as PermissionModelNameType | undefined;
		modelName = modelName
			? (modelName.toLowerCase() as PermissionModelNameType)
			: undefined;
		const objectId = splitKeys[splitKeys.length - 3];

		if (modelName && objectId && models.includes(modelName)) {
			const url = request.nextUrl.clone();
			const newPath = OBJECT_PERMISSIONS_PAGE_URL(
				modelName.toLowerCase(),
				objectId.toLowerCase()
			);
			url.pathname = newPath;
			return NextResponse.rewrite(url);
		} else {
			const url = request.nextUrl.clone();
			url.pathname = '/404';
			return NextResponse.redirect(url);
		}
	}

	// Check if the url is to the /media/* folder and rewrite to /api/media/*
	if (USE_LOCAL_MEDIA_STORAGE && request.url.includes(`${BASE_URL}/media/`)) {
		const oldUrl = new URL(request.url);
		const url = new URL(
			'/api' + oldUrl.pathname,
			oldUrl.protocol + oldUrl.host
		);
		return NextResponse.rewrite(url);
	}

	// If any of the above is does not return then go ahead
	return NextResponse.next();
}

// Supports both a single string value or an array of matchers
export const config = {
	matcher: [
		'/media/:path*', // For the media files
		'/:path*/object-permissions', // For the object permissions
		// '/*/object-permissions/', // For the object permissions
	],
};
// export const config = {
// 	matcher: ['/'],
// 	// matcher: ['/media/:path*'],
// };
