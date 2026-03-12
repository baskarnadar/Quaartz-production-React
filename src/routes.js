// route.js
import React from 'react'

const AdminDashboard = React.lazy(() => import('./views/admin/dashboard/Dashboard'))

const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))
const Orders = React.lazy(() => import('./views/orders/orderlist/list'))
const OrderInfo = React.lazy(() => import('./views/orders/orderlist/info'))
const Painter = React.lazy(() => import('./views/painter/painterinfo/list'))
const AddPainter = React.lazy(() => import('./views/painter/painterinfo/new'))
const ViewPainter = React.lazy(() => import('./views/painter/painterinfo/view'))

// ✅ Home Icon Settings
const HomeIconSettings = React.lazy(() => import('./views/settings/icon/homeicon'))

// Base
const OfferList = React.lazy(() => import('./views/offers/offerlist'))
const OfferNew = React.lazy(() => import('./views/offers/new'))
const OfferModify = React.lazy(() => import('./views/offers/modify'))

const BannerList = React.lazy(() => import('./views/banner/list'))
const BannerNew = React.lazy(() => import('./views/banner/new'))
const BannerModify = React.lazy(() => import('./views/banner/modify'))

const MainMenuList = React.lazy(() => import('./views/admin/mainmenu/list'))
const MainMenuNew = React.lazy(() => import('./views/admin/mainmenu/new'))
const MainMenuModify = React.lazy(() => import('./views/admin/mainmenu/modify'))

const RightsList = React.lazy(() => import('./views/admin/rights/list'))

const SubMenuList = React.lazy(() => import('./views/admin/submenu/list'))
const SubMenuNew = React.lazy(() => import('./views/admin/submenu/new'))
const SubMenuModify = React.lazy(() => import('./views/admin/submenu/modify'))

const CityList = React.lazy(() => import('./views/lookupdata/city/list'))
const CityNew = React.lazy(() => import('./views/lookupdata/city/new'))
const CityModify = React.lazy(() => import('./views/lookupdata/city/modify'))

const UserList = React.lazy(() => import('./views/user/list'))
const UserNew = React.lazy(() => import('./views/user/new'))
const UserModify = React.lazy(() => import('./views/user/modify'))

const OrderStatusList = React.lazy(() => import('./views/lookupdata/orderstatus/list'))
const OrderStatusNew = React.lazy(() => import('./views/lookupdata/orderstatus/new'))
const OrderStatusModify = React.lazy(() => import('./views/lookupdata/orderstatus/modify'))

// Category / Product
const category = React.lazy(() => import('./views/forms/category/list'))
const newcategory = React.lazy(() => import('./views/forms/category/new'))
const subcategory = React.lazy(() => import('./views/forms/category/prdsubcategory'))

const productlist = React.lazy(() => import('./views/forms/product/productlist'))
const addproduct = React.lazy(() => import('./views/forms/product/addproduct'))
const EditProduct = React.lazy(() => import('./views/forms/product/modify'))

const prdsizelist = React.lazy(() => import('./views/forms/prdsize/prdsizelist'))
const prdnewsize = React.lazy(() => import('./views/forms/prdsize/prdnewsize'))

// ✅ EXISTING Product Color
const prdcolorlist = React.lazy(() => import('./views/forms/prdcolor/prdcolorlist'))

// ✅ Lookup → Product Colors
const MainProductColorList = React.lazy(() => import('./views/lookupdata/productcolor/main/list'))
const MainProductColorNew = React.lazy(() => import('./views/lookupdata/productcolor/main/new'))
const MainProductColorModify = React.lazy(() => import('./views/lookupdata/productcolor/main/modify'))

const SubProductColorList = React.lazy(() => import('./views/lookupdata/productcolor/sub/list'))
const SubProductColorNew = React.lazy(() => import('./views/lookupdata/productcolor/sub/new'))
const SubProductColorModify = React.lazy(() => import('./views/lookupdata/productcolor/sub/modify'))

// Store
const StoreList = React.lazy(() => import('./views/store/list'))
const StoreNew = React.lazy(() => import('./views/store/new'))

// ✅ LOGOUT PAGE (NEW)
const Logout = React.lazy(() => import('./views/pages/login/Logout'))

const routes = [
  { path: '/', exact: true, name: 'Home' },

  { path: '/admin/dashboard', name: 'Dashboard', element: AdminDashboard },

  { path: '/settings/homeicon', name: 'Home Icon Settings', element: HomeIconSettings },

  { path: '/orders/orderlist', name: 'Order List', element: Orders },
  { path: '/orders/orderinfo', name: 'Order Info', element: OrderInfo },

  { path: '/painter/painterinfo', name: 'Painter', element: Painter },
  { path: '/painter/addpainter', name: 'Add Painter', element: AddPainter },
  { path: '/painter/view', name: 'View Painter', element: ViewPainter },

  { path: '/user/list', name: 'User List', element: UserList },
  { path: '/user/new', name: 'New User', element: UserNew },
  { path: '/user/modify', name: 'Modify User', element: UserModify },

  { path: '/city/list', name: 'City List', element: CityList },
  { path: '/city/new', name: 'New City', element: CityNew },
  { path: '/city/modify', name: 'Modify City', element: CityModify },

  { path: '/orderstatus/list', name: 'Order Status', element: OrderStatusList },
  { path: '/orderstatus/new', name: 'New Order Status', element: OrderStatusNew },
  { path: '/orderstatus/modify', name: 'Modify Order Status', element: OrderStatusModify },

  { path: '/offers/offerlist', name: 'Offer List', element: OfferList },
  { path: '/offers/new', name: 'New Offer', element: OfferNew },
  { path: '/offers/modify', name: 'Modify Offer', element: OfferModify },

  { path: '/banner/list', name: 'Banner List', element: BannerList },
  { path: '/banner/new', name: 'New Banner', element: BannerNew },
  { path: '/banner/modify', name: 'Modify Banner', element: BannerModify },

  { path: '/mainmenu/list', name: 'Main Menu', element: MainMenuList },
  { path: '/mainmenu/new', name: 'New Main Menu', element: MainMenuNew },
  { path: '/mainmenu/modify', name: 'Modify Main Menu', element: MainMenuModify },

  { path: '/submenu/list', name: 'Sub Menu', element: SubMenuList },
  { path: '/submenu/new', name: 'New Sub Menu', element: SubMenuNew },
  { path: '/submenu/modify', name: 'Modify Sub Menu', element: SubMenuModify },

  { path: '/rights/list', name: 'Rights', element: RightsList },

  { path: '/store/list', name: 'Store List', element: StoreList },
  { path: '/store/new', name: 'New Store', element: StoreNew },

  // Category / Product
  { path: '/forms/category', name: 'Category', element: category },
  { path: '/forms/category/new', name: 'New Category', element: newcategory },
  { path: '/forms/category/prdsubcategory', name: 'Product SubCategory', element: subcategory },

  { path: '/forms/product/productlist', name: 'Product List', element: productlist },
  { path: '/forms/product/addproduct', name: 'Add Product', element: addproduct },
  { path: '/forms/product/modify', name: 'Modify Product', element: EditProduct },

  { path: '/forms/prdsize/prdsizelist', name: 'Product Size', element: prdsizelist },
  { path: '/forms/prdsize/prdnewsize', name: 'New Product Size', element: prdnewsize },

  { path: '/forms/prdcolor/prdcolorlist', name: 'Product Color', element: prdcolorlist },

  // ✅ Main Product Color
  { path: '/productcolor/main/list', name: 'Main Product Color', element: MainProductColorList },
  { path: '/productcolor/main/new', name: 'New Main Product Color', element: MainProductColorNew },
  { path: '/productcolor/main/modify', name: 'Modify Main Product Color', element: MainProductColorModify },

  // ✅ Sub Product Color (ADD / MODIFY / LIST)
  { path: '/productcolor/sub/list', name: 'Sub Product Color', element: SubProductColorList },
  { path: '/productcolor/sub/new', name: 'New Sub Product Color', element: SubProductColorNew },
  { path: '/productcolor/sub/modify', name: 'Modify Sub Product Color', element: SubProductColorModify },

  // ✅ Logout route (NEW)
  { path: '/logout', name: 'Logout', element: Logout },
]

export default routes