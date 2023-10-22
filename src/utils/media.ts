import { MEDIA_LOCATION_URL } from '../config/app';

export function getMediaUrl({ location, url }: { location: string; url?: string }) {
	if (url) return url;

	const mediaLocation = location.startsWith('/')
		? MEDIA_LOCATION_URL + location
		: MEDIA_LOCATION_URL + '/' + location;
	return mediaLocation;
}
