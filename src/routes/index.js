import ShopDetails from "@/pages/ShopDetails";
import { lazy } from "react";

// use lazy for better code splitting
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Attributes = lazy(() => import("@/pages/Attributes"));
const ChildAttributes = lazy(() => import("@/pages/ChildAttributes"));
const Products = lazy(() => import("@/pages/Products"));
const Partners = lazy(() => import("@/pages/Partners")); 
const Shops = lazy(() => import("@/pages/Shops"));
const Category = lazy(() => import("@/pages/Category"));
const ShopCategory = lazy(() => import("@/pages/ShopCategory"));
const ChildCategory = lazy(() => import("@/pages/ChildCategory"));
const Staff = lazy(() => import("@/pages/Staff"));
const Users = lazy(() => import("@/pages/Users"));
const CustomerOrder = lazy(() => import("@/pages/CustomerOrder"));
const SupportComp = lazy(() => import("@/pages/Support"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderInvoice = lazy(() => import("@/pages/OrderInvoice"));
const Partner = lazy(() => import("@/pages/PartnerDetails"));
const Coupons = lazy(() => import("@/pages/Coupons"));
const Packages = lazy(() => import("@/pages/Packages"));
// const Setting = lazy(() => import("@/pages/Setting"));
const Page404 = lazy(() => import("@/pages/404"));
const ComingSoon = lazy(() => import("@/pages/ComingSoon"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const Languages = lazy(() => import("@/pages/Languages"));
const Currencies = lazy(() => import("@/pages/Currencies"));
const Setting = lazy(() => import("@/pages/Setting"));
const StoreHome = lazy(() => import("@/pages/StoreHome"));
const StoreSetting = lazy(() => import("@/pages/StoreSetting"));
/*
//  * ⚠ These are internal routes!
//  * They will be rendered inside the app, using the default `containers/Layout`.
//  * If you want to add a route to, let's say, a landing page, you should add
//  * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
//  * are routed.
//  *
//  * If you're looking for the links rendered in the SidebarContent, go to
//  * `routes/sidebar.js`
 */

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/partners",
    component: Partners,
  },
  {
    path: "/products",
    component: Products,
  },
  {
    path: "/products/:shopid",
    component: Products,
  },
  {
    path: "/attributes",
    component: Attributes,
  },
  {
    path: "/attributes/:id",
    component: ChildAttributes,
  },
  {
    path: "/shop/:id",
    component: ShopDetails,
  },
  {
    path: "/shops/categories",
    component: ShopCategory,
  }, 
  {
    path: "/support",
    component: SupportComp,
  },
  {
    path: "/shops",
    component: Shops,
  },

  {
    path: "/categories",
    component: Category,
  },
  {
    path: "/languages",
    component: Languages,
  },
  {
    path: "/currencies",
    component: Currencies,
  },
  {
    path: "/shops/partner/:affliate",
    component: Shops,
  },
  {
    path: "/users/partners/:affliated",
    component: Users,
  },
  {
    path: "/partner/:id",
    component: Partner,
  },
  
  {
    path: "/categories/:id",
    component: ChildCategory,
  },
  {
    path: "/users",
    component: Users,
  },
  {
    path: "/customer-order/:id",
    component: CustomerOrder,
  },
  {
    path: "/shops/:userid",
    component: Shops,
  },
  {
    path: "/our-staff",
    component: Staff,
  },
  {
    path: "/orders",
    component: Orders,
  },
  {
    path: "/order/:id",
    component: OrderInvoice,
  },
  {
    path: "/coupons",
    component: Coupons,
  },
  {
    path: "/packages",
    component: Packages,
  },
  { path: "/settings", component: Setting },
  {
    path: "/store/customization",
    component: StoreHome,
  },
  {
    path: "/store/store-settings",
    component: StoreSetting,
  },
  {
    path: "/404",
    component: Page404,
  },
  {
    path: "/coming-soon",
    component: ComingSoon,
  },
  {
    path: "/edit-profile",
    component: EditProfile,
  },
];

export default routes;
