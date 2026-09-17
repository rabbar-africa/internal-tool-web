export const QUERY_PATH = {
  auth: {
    login: "auth/login",
    otpLogin: "auth/login/otp",
    getOtp: "auth/login/otp",
    passwordResetRequest: "auth/password-reset/request",
    passwordResetConfirm: "auth/password-reset/confirm",
    // OTP-based reset: request emails a 6-digit code, reset confirms it.
    forgotPassword: "auth/forgot-password",
    resetPassword: "auth/reset-password",
    refreshToken: "auth/refresh-token",
    getCurrentUser: "auth/me",
    getUserOrganization: "/organizations",
    register: "organizations/register",
    verifyEmail: "auth/verify-email",
    resendVerification: "auth/resend-verification",
    validateInvite: "auth/invites",
    acceptInvite: "auth/accept-invite",
    getCurrentSubscription: "/subscriptions/me",
  },
  billing: {
    overview: "/subscriptions/me",
    plans: "/subscriptions/plans",
    checkoutPreview: "/subscriptions/me/checkout/preview",
    checkout: "/subscriptions/me/checkout",
    card: "/subscriptions/me/card",
    autoRenew: "/subscriptions/me/auto-renew",
    changePlan: "/subscriptions/me/change-plan",
    cancel: "/subscriptions/me/cancel",
    resume: "/subscriptions/me/resume",
    // Public — reachable without a login.
    payLink: "/billing/pay",
    checkoutStatus: "/billing/checkout",
  },
  users: {
    getAccountUsers: "accounts/users",
    getAdminUsers: "admin/users",
  },
  analytics: {
    dashboard: "analytics/dashboard",
  },
};
