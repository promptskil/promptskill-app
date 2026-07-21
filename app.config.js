// app.config.js — environment-aware config
// Reads APP_VARIANT at EAS build time to inject correct apiBaseUrl.
// Takes precedence over app.json when present.
//
// APP_VARIANT=staging  → Vaine Staging, staging API
// default              → Vaine, production API

const IS_STAGING = process.env.APP_VARIANT === "staging";

module.exports = {
  expo: {
    name: IS_STAGING ? "Vaine Staging" : "Vaine",
    slug: "promptskill-app",
    scheme: "promptskill",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: IS_STAGING
        ? "com.airpromptskill.app.staging"
        : "com.airpromptskill.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    web: {
      favicon: "./assets/web-favicon.png",
      bundler: "metro",
      output: "static",
      name: "Vaine",
      shortName: "Vaine",
      description: "Type what you mean. Vaine structures it.",
    },
    plugins: ["expo-router", "expo-secure-store"],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      apiBaseUrl: IS_STAGING
        ? "https://web-production-5627b7.up.railway.app"
        : "https://api.vaineai.com",
      router: {},
      eas: {
        projectId: "b82e1985-eab5-4c51-ba8f-621d5f505d33",
      },
    },
    owner: "jeremedyely99",
  },
};
