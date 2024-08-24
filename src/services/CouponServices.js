import requests from "./httpService";

const CouponServices = {
  addCoupon: async (body) => {
    return requests.post("/coupon/add", body);
  },
  addAllCoupon: async (body) => {
    return requests.post("/coupon/add/all", body);
  },
  getAllCoupons: async (
    status = "",
    type = "",
    page = 1,
    limit = 20,
    shop = "",
    createAt = "",
    expiryperiodTo = '',
    expiryperiodFrom = ''
  ) => {
    console.log("getAllCoupons");

    return requests.get(
      "/subscriptions?status=" +
        status +
        "&type=" +
        type +
        "&limit=" +
        limit +
        "&page=" +
        page +
        "&shop=" +
        shop +
        "&createAt=" +
        createAt +
        "&expiryperiodTo=" +
        expiryperiodTo +
        "&expiryperiodFrom=" +
        expiryperiodFrom
    );
  },
  getEarnings: async (id, page = 1) => {
    return requests.get(`/payments/awards?user=${id}&page=${page}`);
  },
  getTransactions: async (id) => {
    return requests.get(`/payments/transactions?id=${id}`);
  },
  updateCoupon: async (id, body) => {
    return requests.put(`/subscriptions/extend/${id}`, body);
  },
  updateManyCoupons: async (body) => {
    return requests.patch("/coupon/update/many", body);
  },
  updateStatus: async (id, body) => {
    return requests.put(`/coupon/status/${id}`, body);
  },
  deleteCoupon: async (id) => {
    return requests.delete(`/coupon/${id}`);
  },
  deleteManyCoupons: async (body) => {
    return requests.patch(`/coupon/delete/many`, body);
  },
};

export default CouponServices;
