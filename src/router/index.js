import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' }, /* 路由重定向 */
  { path: '/login', component: Login },
  { path: '/home', component: Home },
]

const router = new VueRouter({
  routes
})

// 路由对象router上 挂载 路由导航守卫beforeEach
//   to:将要访问的路径 from:从哪个路径跳转而来
//   next:一个函数 表示放行 next()放行 next('/login')强制跳转
router.beforeEach((to,from,next)=>{
  // 1. 若用户要访问的是login页 则直接放行(无限制 都可访问)
  if(to.path==='/login') return next()
  // 2. 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 3. 若token不存在 则表示未登陆 则强制跳转到login页
  if(!tokenStr) return next('/login')
  // 4. 若token存在 则放行
  next()
})

export default router
