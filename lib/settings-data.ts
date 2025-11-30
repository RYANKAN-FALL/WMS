export type SettingsData = {
  profile: {
    nama: string;
    email: string;
    username: string;
    role: string;
  };
  security: {
    twoFactor: boolean;
    loginAlert: boolean;
    otpHint?: string;
  };
  preference: {
    language: string;
    currency: string;
    theme: "light" | "dark" | "system";
  };
  notification: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  integration: {
    webhooks: string;
    apiKey?: string;
  };
};

export const defaultSettings: SettingsData = {
  profile: {
    nama: "Admin User",
    email: "admin@example.com",
    username: "admin",
    role: "admin",
  },
  security: {
    twoFactor: false,
    loginAlert: true,
    otpHint: "Gunakan kode 246810 untuk demo",
  },
  preference: {
    language: "id",
    currency: "IDR",
    theme: "dark",
  },
  notification: {
    email: true,
    sms: false,
    push: true,
  },
  integration: {
    webhooks: "",
    apiKey: "wms-demo-api-key",
  },
};
