import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: Home,
        },
        {
            path: "/city",
            name: "city",
            component: () => import("../views/CityView.vue"),
        },
        {
            path: "/stream",
            name: "stream",
            component: () => import("../views/StreamerView.vue"),
        }
    ],
});

export default router;
