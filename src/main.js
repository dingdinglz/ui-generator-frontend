import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import {createRouter, createWebHashHistory} from "vue-router";
import {routes} from "./router/routes.js";

const app = createApp(App)

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

app.use(router)
app.use(ElementPlus)
app.mount('#app')
