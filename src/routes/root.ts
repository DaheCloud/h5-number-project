export default [
  { path: '/', 
    component: () => import('@/views/main/index.vue'),
    redirect: '/home',
    children: [
      { path: '/home', 
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: '/num-chose',
        component: () => import('@/views/num-chose/index.vue'),
        meta: {
          title: '数字选择'
        }
      }
      ,{
        path: '/filter-center',
        component: () => import('@/views/filter-center/index.vue'),
        meta: {
          title: '筛选中心'
        }
      },
      {
        path: '/zodiac-filter',
        redirect: '/filter-center?tab=zodiac'
      },
      {
        path: '/head-tail-filter',
        redirect: '/filter-center?tab=head-tail'
      },
      {
        path: '/filter-numbers',
        component: () => import('@/views/filter-numbers/index.vue'),
        meta: {
          title: '筛选号码'
        }
      }
    ],
  },
  
  // {
  //   name: 'notFound',
  //   path: '/:path(.*)+',
  //   redirect: {
  //     name: 'goods'
  //   }
  // },
  // {
  //   name: 'user',
  //   path: '/user',
  //   component: () => import('@/view/user/index.vue'),
  //   meta: {
  //     title: '会员中心'
  //   }
  // }
]
