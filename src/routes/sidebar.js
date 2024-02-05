import {
  FiGrid,
  FiUsers,
  FiUser,
  FiCompass,
  FiSettings,
  FiSlack,
  FiGlobe,
  FiTarget,
} from "react-icons/fi";

/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const sidebar = [
  {
    path: "/dashboard", // the url
    icon: FiGrid, // icon
    name: "Dashboard", // name that appear in Sidebar
  },

  {
    icon: FiSlack,
    name: "Inventory",
    routes: [
      {
        path: "/products",
        name: "Products",
      },
      {
        path: "/categories",
        name: "Categories",
      },
      {
        path: "/attributes",
        name: "Measure Units",
      },
    ],
  },

  {
    path: "/coupons", // the url
    icon: FiGrid, // icon
    name: "Subscriptions", // name that appear in Sidebar
  },
  {
    path: "/packages", // the url
    icon: FiGrid, // icon
    name: "Packages", // name that appear in Sidebar
  },
  {
    path: "/orders", // the url
    icon: FiGrid, // icon
    name: "Sales", // name that appear in Sidebar
  },
  {
    path: "/support", // the url
    icon: FiGrid, // icon
    name: "Support", // name that appear in Sidebar
  },
  {
    icon: FiSlack,
    name: "Shops",
    routes: [
      {
        path: "/shops",
        name: "Shops",
      },
      {
        path: "/shops/categories",
        name: "Shop Categories",
      },
    ],
  },

  {
    path: "/users",
    icon: FiUsers,
    name: "Users",
  },

  {
    path: "/settings?settingTab=common-settings",
    icon: FiSettings,
    name: "Settings",
  },
  {
    icon: FiTarget,
    name: "OnlineStore",
    routes: [
      {
        name: "ViewStore",
        path: "http://localhost:3000",
        outside: "store",
      },

      {
        path: "/store/customization",
        name: "StoreCustomization",
      },
      {
        path: "/store/store-settings",
        name: "Store Settings",
      },
    ],
  },
];

export default sidebar;
