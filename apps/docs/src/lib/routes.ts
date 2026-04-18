import Home from "../routes/Home.svelte";
import Login from "../routes/Login.svelte";
import Dashboard from "../routes/Dashboard.svelte";

export const routes = {
  "/": Home,
  "/login": Login,
  "/dashboard": Dashboard,
};
