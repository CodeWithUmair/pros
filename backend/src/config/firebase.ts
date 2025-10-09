import admin from "firebase-admin";
import serviceAccountJson from "./pros-2d0ad-firebase-servicekey.json";

const serviceAccount = serviceAccountJson as admin.ServiceAccount;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;
