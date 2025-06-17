// import './assets/main.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import VueKonva from 'vue-konva';

import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus, { size: 'large' })
app.use(VueKonva);
app.use(createPinia())
app.use(router)

app.mount('#app')
