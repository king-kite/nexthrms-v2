import admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';
// import {getFirestore} from "firebase-admin/firestore"
import { getStorage } from 'firebase-admin/storage';

const apps = getApps();

if (!apps.length) {
	try {
		if (process.env.NODE_ENV === 'development') {
			initializeApp();
			console.log('Firebase Admin Initialization Success');
		} else {
			const config: admin.ServiceAccount = {
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
				projectId: process.env.FIREBASE_PROJECT_ID,
			};
			initializeApp({
				credential: admin.credential.cert(config),
			});
		}
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('Firebase Admin Initialization Error :>> ', error);
	}
}

let bucket;
// let db;

// try {
// 	db = getFirestore();
// 	console.log('Firebase Firestore Initialization Success');
// } catch(error) {
// 	if (process.env.NODE_ENV === 'development')
// 		console.log('Firestore Initialization Error :>> ', error)
// }

try {
	bucket = getStorage().bucket('axhub-wit');
	console.log('Firebase Storage Initialization Success');
} catch (error) {
	if (process.env.NODE_ENV === 'development')
		console.log('Firebase Storage Initialization Error :>> ', error);
}

export { bucket };
