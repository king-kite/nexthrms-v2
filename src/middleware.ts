// import { NextResponse } from 'next/server';

// export function middleware(req) {
//    // Rewrite /images/... to /api/images/...
//    return NextResponse.rewrite('/api' + req.nextUrl.pathname);
// }

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	// Check if the url is to the /media/* folder and rewrite to /api/media/*
	if (process.env.NODE_ENV === 'development') {
		const oldUrl = new URL(request.url);
		const url = new URL(
			'/api' + oldUrl.pathname,
			oldUrl.protocol + oldUrl.host
		);
		return NextResponse.rewrite(url);
	}
	return NextResponse.next();
}

// Supports both a single string value or an array of matchers
export const config = {
	matcher: ['/media/:path*'],
};
