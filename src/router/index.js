import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/stock',
    component: Layout,
    redirect: '/stock/basic',
    name: 'Stock',
    meta: { title: 'stock', icon: 'example' },
    children: [
      {
        path: 'basic',
        name: 'StockBasic',
        component: () => import('@/views/stock/basic'),
        meta: { title: 'basic', icon: 'table' }
      },
      {
        path: 'daily',
        name: 'StockDaily',
        component: () => import('@/views/stock/daily'),
        meta: { title: 'daily', icon: 'table' }
      },
      {
        path: 'daily_basic',
        name: 'StockDailyBasic',
        component: () => import('@/views/stock/daily_basic'),
        meta: { title: 'daily_basic', icon: 'table' }
      }
    ]
  },
  {
    path: '/fund',
    component: Layout,
    redirect: '/fund/basic',
    name: 'Fund',
    meta: { title: 'fund', icon: 'example' },
    children: [
      {
        path: 'basic',
        name: 'FundBasic',
        component: () => import('@/views/fund/basic'),
        meta: { title: 'basic', icon: 'table' }
      },
      {
        path: 'daily',
        name: 'FundDaily',
        component: () => import('@/views/fund/daily'),
        meta: { title: 'daily', icon: 'table' }
      },
      {
        path: 'nav',
        name: 'FundNav',
        component: () => import('@/views/fund/nav'),
        meta: { title: 'nav', icon: 'table' }
      },
      {
        path: 'portfolio',
        name: 'FundPortfolio',
        component: () => import('@/views/fund/basic_simple'),
        meta: { title: 'portfolio', icon: 'table' }
      }
    ]
  },
  {
    path: '/charts',
    component: Layout,
    redirect: '/charts/line',
    name: 'Charts',
    meta: {
      title: 'charts',
      icon: 'charts'
    },
    children: [
      {
        path: 'line',
        component: () => import('@/views/charts/line/index'),
        name: 'LineChart',
        meta: { title: 'line' }
      },
      {
        path: 'close',
        component: () => import('@/views/charts/close/index'),
        name: 'CloseChart',
        meta: { title: 'close' }
      }
    ]
  },
  {
    path: '/strategy',
    component: Layout,
    redirect: '/strategy/list',
    name: 'Strategy',
    meta: {
      title: 'strategy',
      icon: 'nested'
    },

    children: [
      {
        path: 'dataset_list',
        component: () => import('@/views/dataset/Dataset'),
        name: 'DatasetList',
        meta: { title: 'dataset_list', icon: 'list' }
      },
      {
        path: 'strategy_list',
        component: () => import('@/views/strategy/list'),
        name: 'StrategyList',
        meta: { title: 'strategy_list', icon: 'list' }
      },
      {
        path: 'create',
        component: () => import('@/views/strategy/create'),
        name: 'CreateStrategy',
        meta: { title: 'create_strategy', icon: 'edit' }
      },
      {
        path: 'filter_option_list',
        component: () => import('@/views/strategy/FilterOptionList'),
        name: 'FilterOptionList',
        meta: { title: 'filter_option_list', icon: 'list' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/strategy/edit'),
        name: 'EditStrategy',
        meta: { title: 'edit_strategy', noCache: true },
        hidden: true
      },
      {
        path: 'stock_picking_list',
        component: () => import('@/views/strategy/StockPickingList'),
        name: 'StockPickingList',
        meta: { title: 'stock_picking_list', icon: 'list' }
      },
      {
        path: 'create_stock_picking',
        component: () => import('@/views/strategy/CreateStockPicking'),
        name: 'CreateStockPicking',
        meta: { title: 'create_stock_picking', icon: 'edit' }
      },
      {
        path: 'edit_stock_picking/:id(\\d+)',
        component: () => import('@/views/strategy/EditStockPicking'),
        name: 'EditStockPicking',
        meta: { title: 'edit_stock_picking', noCache: true },
        hidden: true
      },
      {
        path: 'stock_list',
        component: () => import('@/views/strategy/stock_list/stock'),
        name: 'StockList',
        meta: { title: 'stock_list', icon: 'list' },
        hidden: true
      },
      {
        path: 'select_list',
        component: () => import('@/views/strategy/select_list/stock'),
        name: 'SelectList',
        meta: { title: 'select_list', icon: 'list' }
      }
    ]
  },
  {
    path: '/composition',
    component: Layout,
    redirect: '/composition/list',
    name: 'Composition',
    meta: {
      title: 'composition',
      icon: 'nested'
    },

    children: [
      {
        path: 'list',
        component: () => import('@/views/composition/list'),
        name: 'CompositionList',
        meta: { title: 'composition_list', icon: 'list' }
      },
      {
        path: 'create',
        component: () => import('@/views/composition/create'),
        name: 'CreateComposition',
        meta: { title: 'create_composition', icon: 'edit' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/composition/edit'),
        name: 'EditComposition',
        meta: { title: 'edit_composition', activeMenu: '/composition/list' },
        hidden: true
      }
    ]
  },
  {
    path: '/jupyter',
    component: Layout,
    children: [
      {
        name: 'Jupyter',
        path: 'http://localhost:8020/',
        // path: 'jupyter',
        // component: () => import('@/views/jupyter/index'),
        meta: { title: 'jupyter', icon: 'link', roles: ['admin'] }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'User',
        component: () => import('@/views/user/index'),
        meta: { title: 'user', icon: 'user', roles: ['admin'] }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
