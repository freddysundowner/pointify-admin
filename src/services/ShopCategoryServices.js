import requests from "./httpService";

const ShopCategoryServices = {
  getAllCategory: async () => {
    return requests.get("/shop/category");
  },

  getAllCategories: async () => {
    return requests.get("/shop/category");
  },

  getCategoryById: async (id) => {
    return requests.get(`/shop/category/${id}`);
  },

  addCategory: async (body) => {
    return requests.post("/shop/category", body);
  },

  addAllCategory: async (body) => {
    return requests.post("/shop/category/add/all", body);
  },

  updateCategory: async (id, body) => {
    return requests.put(`/shop/category/${id}`, body);
  },

  updateStatus: async (id, body) => {
    return requests.put(`/shop/category/status/${id}`, body);
  },

  deleteCategory: async (id, body) => {
    return requests.delete(`/shop/category/${id}`, body);
  },

  updateManyCategory: async (body) => {
    return requests.patch("/category/update/many", body);
  },

  deleteManyCategory: async (body) => {
    return requests.patch("/category/delete/many", body);
  },
};

export default ShopCategoryServices;
