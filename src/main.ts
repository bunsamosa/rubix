import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// create vue app
const app = createApp(App);

// add modules and router
app.use(createPinia());
app.use(router);

// mount app
app.mount("#app");
