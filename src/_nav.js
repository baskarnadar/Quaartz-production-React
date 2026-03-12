// _nav.js
import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilBasket,
  cilExcerpt,
  cilAccountLogout,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Show / Hide Home Icon',
    to: '/settings/homeicon',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'AdminDashboard',
    to: '/admin/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Orders',
    to: '/orders/orderlist',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Products',
    to: '/forms/product/productlist',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Category',
    to: '/forms/category',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Store',
    to: '/store/list',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Painter',
    to: '/painter/painterinfo',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Offers',
    to: '/offers/offerlist',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Banner',
    to: '/banner/list',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'User List',
    to: '/user/list',
    icon: <CIcon icon={cilExcerpt} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'LookUp Data',
  },

  {
    component: CNavItem,
    name: 'City',
    to: '/city/list',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Main Product Color',
    to: '/productcolor/main/list',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Sub Product Color',
    to: '/productcolor/sub/list',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },

  // 🔴 LOGOUT (RED & CLEAR)
  {
    component: CNavItem,
    name: 'Logout',
    to: '/logout',
    className: 'text-danger fw-bold',
    icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon text-danger" />,
  },
]

export default _nav