import admin from "../config/firebase";

export const sendPushNotification = async (fcmToken: string, title: string, body: string) => {
    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: { title, body },
        });
    } catch (err) {
        console.error("Error sending FCM notification:", err);
    }
};
