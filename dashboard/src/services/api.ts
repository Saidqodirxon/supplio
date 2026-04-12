import axios from "axios";
import { toast as sonnerToast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Interceptor to add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isDemoMode = localStorage.getItem("supplio_demo_mode") === "1";
  const isDemoFullAccess =
    localStorage.getItem("supplio_demo_full_access") === "1";
  const method = (config.method || "get").toLowerCase();
  const isMutatingMethod =
    method === "post" ||
    method === "put" ||
    method === "patch" ||
    method === "delete";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isDemoMode) {
    config.headers["X-Supplio-Demo"] = "true";
    config.headers["X-Supplio-Demo-Access"] = isDemoFullAccess
      ? "full"
      : "view";
  }

  // Block write operations in demo read-only mode before request is sent.
  // Auth endpoints are always allowed (login must work in demo mode).
  const isAuthEndpoint = (config.url || '').includes('/auth/');
  if (isDemoMode && !isDemoFullAccess && isMutatingMethod && !isAuthEndpoint) {
    sonnerToast.warning(
      "Demo rejim — faqat ko'rish uchun. Tahrirlash uchun to'liq demo so'rov yuboring.",
      {
        duration: 3500,
        style: {
          borderRadius: "1rem",
          fontFamily: "Outfit, sans-serif",
          fontWeight: 700,
        },
      }
    );

    return Promise.reject({
      response: {
        status: 403,
        data: { message: "DEMO_READ_ONLY" },
      },
      config,
    });
  }

  return config;
});

// Interceptor to handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message;

    if (status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthRequest = requestUrl.includes("/auth/login");
      if (!isAuthRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      if (msg?.includes("TRIAL_EXPIRED")) {
        window.location.href = "/expired";
      } else if (msg?.includes("ACCOUNT_LOCKED")) {
        window.location.href = "/locked";
      } else if (msg?.includes("DEMO_READ_ONLY")) {
        sonnerToast.warning(
          "Demo rejim — faqat ko'rish uchun. Tahrirlash uchun to'liq demo so'rov yuboring.",
          {
            duration: 4000,
            style: {
              borderRadius: "1rem",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
            },
          }
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
