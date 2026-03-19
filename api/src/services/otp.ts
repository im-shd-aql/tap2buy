import { prisma } from "../config/database";
import { env } from "../config/env";

const OTP_EXPIRY_MINUTES = 5;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<{ success: boolean }> {
  const code = env.otpMode === "mock" ? "123456" : generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate previous OTPs for this phone
  await prisma.otpCode.updateMany({
    where: { phone, verified: false },
    data: { verified: true },
  });

  await prisma.otpCode.create({
    data: { phone, code, expiresAt },
  });

  if (env.otpMode === "mock") {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
    return { success: true };
  }

  // Production: send via notify.lk
  try {
    const response = await fetch("https://app.notify.lk/api/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: env.notifyLkApiKey,
        api_key: env.notifyLkApiKey,
        sender_id: env.notifyLkSenderId,
        to: phone,
        message: `Your Tap2Buy verification code is: ${code}`,
      }),
    });

    return { success: response.ok };
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return { success: false };
  }
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  return true;
}
