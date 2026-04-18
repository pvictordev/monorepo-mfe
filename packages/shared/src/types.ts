export type Session = {
  accessToken: string;
  user: {
    email: string;
    name: string;
    role: "admin" | "member";
  };
};

export type ApiStatus = {
  status: "ok";
  app: string;
  timestamp: string;
  routes: string[];
};

export type AppEnv = {
  apiBase: string;
  appName: string;
  authCookieName: string;
};
