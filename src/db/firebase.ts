export {};
// import { Bucket } from '@google-cloud/storage';
// import admin, { AppOptions } from 'firebase-admin';
// import { App, getApps, initializeApp } from 'firebase-admin/app';
// // import {getFirestore} from "firebase-admin/firestore"
// import { getStorage } from 'firebase-admin/storage';

// const apps = getApps();
// let firebaseApp: App | undefined;

// if (!apps.length) {
// 	try {
// 		const config: AppOptions = {
// 			credential: admin.credential.cert({
// 				clientEmail: '',
// 				privateKey: '',
// 				projectId: '',
// 			}),
// 		};
// 		firebaseApp = initializeApp(config);
// 	} catch (error) {
// 		console.log('Firebase Admin Initialization Error :>> ', error);
// 	}
// }

// let bucket: Bucket;

// try {
// 	// bucket = getStorage().bucket('default');
// 	bucket = getStorage(firebaseApp).bucket('default');
// 	console.log('Firebase Storage Initialization Success');
// } catch (error) {
// 	console.log('Firebase Storage Initialization Error :>> ', error);
// }

// export { bucket };

// import { Bucket } from '@google-cloud/storage';
// import admin from 'firebase-admin';
// import { getApps, initializeApp } from 'firebase-admin/app';
// // import {getFirestore} from "firebase-admin/firestore"
// import { getStorage } from 'firebase-admin/storage';

// const apps = getApps();

// if (!apps.length) {
// 	try {
// 		if (process.env.NODE_ENV === 'development') {
// 			initializeApp();
// 			console.log('Firebase Admin Initialization Success');
// 		} else {
// 			const config: admin.ServiceAccount = {
// 				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
// 				privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
// 				projectId: process.env.FIREBASE_PROJECT_ID,
// 			};
// 			initializeApp({
// 				credential: admin.credential.cert(config),
// 			});
// 		}
// 	} catch (error) {
// 		if (process.env.NODE_ENV === 'development')
// 			console.log('Firebase Admin Initialization Error :>> ', error);
// 	}
// }

// let bucket: Bucket;
// // let db;

// // try {
// // 	db = getFirestore();
// // 	console.log('Firebase Firestore Initialization Success');
// // } catch(error) {
// // 	if (process.env.NODE_ENV === 'development')
// // 		console.log('Firestore Initialization Error :>> ', error)
// // }

// try {
// 	bucket = getStorage().bucket('kitehrms');
// 	if (process.env.NODE_ENV === 'development')
// 		console.log('Firebase Storage Initialization Success');
// } catch (error) {
// 	if (process.env.NODE_ENV === 'development')
// 		console.log('Firebase Storage Initialization Error :>> ', error);
// }

// export { bucket };
