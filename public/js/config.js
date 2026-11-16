/* Public & Local Cloud Host Configuration: Allows any user, device, or offline file to access live data & images */
    const PUBLIC_TUNNEL_HOST = "https://bridge-backend-2kdm.onrender.com";
    const isLocalDevHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    window.I2T_CONFIG = {
      API_BASE: isLocalDevHost ? "" : PUBLIC_TUNNEL_HOST,
      IMAGE_CDN: PUBLIC_TUNNEL_HOST,
      CUSTOM_DOMAIN: "https://bridgetothebtech.com",
      REQUIRE_OTP: false,
      ADMIN_EMAIL: "athotasridharchakravarthy@gmail.com"
    };