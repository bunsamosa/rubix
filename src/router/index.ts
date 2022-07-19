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
        // {
        //   path: "/cube",
        //   name: "cube",
        //   component: () => import("../views/CubeView.vue"),
        // },
        // {
        //   path: "/star",
        //   name: "star",
        //   component: () => import("../views/StarView.vue"),
        // },
        // {
        //   path: "/robot",
        //   name: "robot",
        //   component: () => import("../views/RobotView.vue"),
        // },
    ],
});

export default router;
