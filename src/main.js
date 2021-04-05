import Vue from 'vue'
import App from './App.vue' //根组件
import router from './router' //路由
import './plugins/element.js' //Element-UI
import './assets/fonts/iconfont.css' //导入字体图标
import './assets/css/global.css' //引入全局样式表
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

//配置请求的根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
// 通过 axios 请求拦截器添加 token，保证拥有获取数据的权限
axios.interceptors.request.use(config=>{
  //console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须 return config
  return config
})
Vue.prototype.$http=axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
