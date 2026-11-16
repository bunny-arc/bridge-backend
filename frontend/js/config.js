/* Public & Local Cloud Host Configuration: Allows any user, device, or offline file to access live data & images */
    const PUBLIC_TUNNEL_HOST = "https://bridge-backend-2kdm.onrender.com";
    const isLocalDevHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const API_BASE = isLocalDevHost ? "" : PUBLIC_TUNNEL_HOST;
    window.I2T_CONFIG = {
      API_BASE: API_BASE,
      IMAGE_CDN: PUBLIC_TUNNEL_HOST,
      CUSTOM_DOMAIN: "https://bridgetothebtech.com",
      REQUIRE_OTP: false,
      ADMIN_EMAIL: "athotasridharchakravarthy@gmail.com",
      GOOGLE_CLIENT_ID: "347879525174-f5fkbf1qho1epabfifj1d6g03g4bl0fo.apps.googleusercontent.com"
    };
    window.X_CFG = window.I2T_CONFIG;