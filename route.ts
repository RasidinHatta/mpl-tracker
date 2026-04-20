export const authRoutes = [
  "/sign-in",
  "/sign-in/*",
  "/sign-up",
  "/sign-up/*",
  "/forgot-password",
  "/forgot-password/*",
  "/reset-password",
  "/verify",
  "/verify/*",
];

export const protectedRoutes = [
  "/dashboard",
  "/dashboard/*",
  "/prediction",
  "/prediction/*",
  "/history",
  "/history/*",
  "/settings",
];

export const publicRoutes = [
  "/",
  "/standing",
  "/standing/*",
  "/schedule",
  "/schedule/*",
  "/about",
];
