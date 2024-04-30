import requests from "./httpService";

const PartnersServices = {
  getAllPartners: async ({ page, limit, title }) => {
    const searchTitle = title !== null ? title : "";

    return requests.get(
      `/affiliates?page=${page}&limit=${limit}&title=${searchTitle}`
    );
  },

  getPartnerById: async (id) => {
    return requests.get(`/affiliates/${id}`);
  },
  addAffliate: async (body) => {
    return requests.post("/affiliates/auth/register", body);
  },
  addAllProducts: async (body) => {
    return requests.post("/products/all", body);
  },
  updatePartner: async (id, body) => {
    return requests.put(`/affiliates/${id}`, body);
  },
  updateManyProducts: async (body) => {
    return requests.patch("products/update/many", body);
  },
  updateStatus: async (id, body) => {
    return requests.put(`/products/status/${id}`, body);
  },

  deletePartner: async (id) => {
    return requests.delete(`/affiliates/${id}`);
  },
  deleteManyProducts: async (body) => {
    return requests.patch("/products/delete/many", body);
  },
};

export default PartnersServices;
