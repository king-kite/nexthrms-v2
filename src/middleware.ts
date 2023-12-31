import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { models } from './config/app';
import { OBJECT_PERMISSIONS_PAGE_URL } from './config/routes';

export function middleware(request: NextRequest) {
	// Check to see if the url endswith object-permissions
	// And rewrite the page to the users permissions objects [model] [objectId] page
	if (
		!request.url.includes('/api') && // check the request doesnt include the /api routes
		(request.url.endsWith('object-permissions') || request.url.endsWith('object-permissions/'))
	) {
		const requestUrl = request.url.endsWith('/')
			? request.url.slice(0, request.url.length - 1)
			: request.url;

		const splitKeys = requestUrl.split('/');

		let modelName: string | undefined = splitKeys[splitKeys.length - 2];
		modelName = modelName ? modelName.toLowerCase() : undefined;
		const objectId = splitKeys[splitKeys.length - 3];

		if (modelName && objectId && models.includes(modelName)) {
			const url = request.nextUrl.clone();
			const newPath = OBJECT_PERMISSIONS_PAGE_URL(modelName.toLowerCase(), objectId.toLowerCase());
			url.pathname = newPath;
			return NextResponse.rewrite(url);
		} else {
			const url = request.nextUrl.clone();
			url.pathname = '/404';
			return NextResponse.redirect(url);
		}
	}

	// If any of the above is does not return then go ahead
	return NextResponse.next();
}

// Supports both a single string value or an array of matchers
export const config = {
	matcher: ['/:path*/object-permissions'],
};
