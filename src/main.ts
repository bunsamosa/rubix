import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import VueWriter from "vue-writer";

// load fonts
loadFonts();

// create vue app
const app = createApp(App);

// add modules and router
app.use(createPinia());
app.use(vuetify);
app.use(VueWriter);
app.use(router);

// mount app
app.mount("#app");
