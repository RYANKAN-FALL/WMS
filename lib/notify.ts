import logger from "./logger";
import { getSettings } from "./services";

type LoginPayload = {
  userId: string | undefined;
  username: string | undefined;
  nama: string | undefined;
  email: string | undefined;
  ip?: string | null;
  userAgent?: string | null;
};

export async function deliverWebhook(url: string, body: unknown) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    logger.info("Webhook delivered", { url });
  } catch (error) {
    logger.error("Webhook delivery failed", { url, error: (error as Error).message });
  }
}

async function simulateChannel(kind: "email" | "sms" | "push", payload: LoginPayload) {
  const target =
    kind === "email"
      ? payload.email || "email-not-set"
      : kind === "sms"
      ? "sms-recipient-not-set"
      : payload.username || "push-user";

  logger.info(`Simulated ${kind} notification sent`, { kind, target, payload });
}

export async function notifyLogin(payload: LoginPayload) {
  try {
    const settings = await getSettings();
    const security = settings?.security;
    const notification = settings?.notification;
    const integration = settings?.integration;

    if (!security?.loginAlert) return;

    const channels: Array<Promise<void>> = [];

    if (notification?.email) channels.push(simulateChannel("email", payload));
    if (notification?.sms) channels.push(simulateChannel("sms", payload));
    if (notification?.push) channels.push(simulateChannel("push", payload));

    if (integration?.webhooks) {
      channels.push(
        deliverWebhook(integration.webhooks, {
          event: "login",
          user: {
            id: payload.userId,
            username: payload.username,
            name: payload.nama,
            email: payload.email,
          },
          meta: {
            ip: payload.ip || "unknown",
            userAgent: payload.userAgent || "unknown",
          },
          timestamp: new Date().toISOString(),
          apiKey: integration.apiKey || "demo",
        })
      );
    }

    await Promise.allSettled(channels);
  } catch (error) {
    logger.error("Login notification failed", { error: (error as Error).message, payload });
  }
}
