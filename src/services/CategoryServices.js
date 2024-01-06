import requests from "./httpService";

const CategoryServices = {
  getAllCategory: async () => {
    return requests.get("/product/category");
  },

  getAllCategories: async () => {
    return requests.get("/product/category");
  },

  getCategoryById: async (id) => {
    return requests.get(`/product/category/all/${id}`);
  },

  addCategory: async (body) => {
    return requests.post("/product/category", body);
  },

  addAllCategory: async (body) => {
    return requests.post("/category/add/all", body);
  },

  updateCategory: async (id, body) => {
    return requests.put(`/product/category/${id}`, body);
  },

  updateStatus: async (id, body) => {
    return requests.put(`/category/status/${id}`, body);
  },

  deleteCategory: async (id, body) => {
    return requests.delete(`/product/category/${id}`, body);
  },

  updateManyCategory: async (body) => {
    return requests.patch("/category/update/many", body);
  },

  deleteManyCategory: async (body) => {
    return requests.patch("/category/delete/many", body);
  },
};

export default CategoryServices;
