import Vue from 'vue'
import App from './App.vue' //根组件
import router from './router' //路由
import './plugins/element.js' //Element-UI
import './assets/fonts/iconfont.css' //导入字体图标
import './assets/css/global.css' //引入全局样式表
import axios from 'axios'

//配置请求的根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http=axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
