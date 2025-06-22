import requests from "./httpService";

const PackagesServices = {
  addCoupon: async (body) => {
    return requests.post("/packages", body);
  },
  addAllCoupon: async (body) => {
    return requests.post("/packages/add/all", body);
  },
  getAllCoupons: async (currentPage) => {
    return requests.get(
      "/packages?page=" +
        (currentPage == undefined ? 1 : currentPage) +
        "&limit=20&admin=true"
    );
  },
  getCouponById: async (id) => {
    return requests.get(`/subscriptions/${id}`);
  },
  getPackageId: async (id) => {
    return requests.get(`/packages/${id}`);
  },
  updateCoupon: async (id, body) => {
    return requests.put(`/packages/${id}`, body);
  },
  updateManyCoupons: async (body) => {
    return requests.patch("/packages/update/many", body);
  },
  updateStatus: async (id, body) => {
    return requests.put(`/packages/status/${id}`, body);
  },
  deleteCoupon: async (id) => {
    return requests.delete(`/packages/${id}`);
  },
  deleteManyCoupons: async (body) => {
    return requests.patch(`/packages/delete/many`, body);
  },
};

export default PackagesServices;
