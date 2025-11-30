import { getSettings } from "@/lib/services";
import { defaultSettings } from "@/lib/settings-data";

export async function GET() {
  const settings = await getSettings();
  const merged = {
    ...defaultSettings,
    ...settings,
    security: { ...defaultSettings.security, ...(settings.security || {}) },
    preference: { ...defaultSettings.preference, ...(settings.preference || {}) },
  };

  return Response.json({
    preference: merged.preference,
    security: {
      twoFactor: merged.security.twoFactor,
      otpHint: merged.security.otpHint,
      loginAlert: merged.security.loginAlert,
    },
  });
}
