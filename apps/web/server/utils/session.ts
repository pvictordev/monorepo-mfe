import type { Session } from "@repo/shared";

export const createDemoSession = (email: string): Session => ({
  accessToken: "demo-access-token",
  user: {
    email,
    name: email.split("@")[0] ?? "teammate",
    role: "admin",
  },
});
