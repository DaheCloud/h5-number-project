import { createApp } from "vue";
import "./styles/style.css";
import "vant/es/dialog/style";
import "vant/es/toast/style";
import App from "./App.vue";
import pinia from "./stores";
import router from "./routes";

createApp(App)
.use(pinia)
.use(router)
.mount("#app");
