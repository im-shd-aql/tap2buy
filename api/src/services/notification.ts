import { env } from "../config/env";

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  if (!env.fcmServerKey) {
    console.log(`[DEV] Push notification: ${title} - ${body}`);
    return true;
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${env.fcmServerKey}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title, body },
        data,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Push notification failed:", error);
    return false;
  }
}

export function getWhatsAppShareLink(
  storeName: string,
  productName: string,
  productUrl: string,
  price: number
): string {
  const message = encodeURIComponent(
    `Check out ${productName} from ${storeName} - LKR ${price.toLocaleString()}\n${productUrl}`
  );
  return `https://wa.me/?text=${message}`;
}
