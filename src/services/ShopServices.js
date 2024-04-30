import requests from "./httpService";

const ShopServices = {
  getAllShops: async ({ page, limit, category, title, price, locationText,userid,affliate }) => {
    const searchCategory = category !== null ? category : "";
    const searchTitle = title !== null ? title : "";
    const searchPrice = price !== null ? price : "";
    const address = locationText !== null ? locationText : "";
    const ownerid = userid !== null && userid != undefined ? userid : "";
    const affliateid = affliate !== null && affliate  !=undefined ? affliate : "";
    console.log("userid ",ownerid);
    
    return requests.get(
      `/shop?page=${page}&affliate=${affliateid}&ownerid=${ownerid??""}&address=${address}&limit=${limit}&category=${searchCategory}&title=${searchTitle}&price=${searchPrice}`
    );
  },

  getProductById: async (id) => {
    return requests.get(`/shop/${id}`);
  },
  addProduct: async (body) => {
    return requests.post("/products/add", body);
  },
  addAllProducts: async (body) => {
    return requests.post("/products/all", body);
  },
  updateProduct: async (id, body) => {
    return requests.patch(`/products/${id}`, body);
  },
  updateManyProducts: async (body) => {
    return requests.patch("products/update/many", body);
  },
  updateStatus: async (id, body) => {
    return requests.put(`/products/status/${id}`, body);
  },

  deleteProduct: async (id) => {
    return requests.delete(`/products/${id}`);
  },
  deleteManyProducts: async (body) => {
    return requests.patch("/products/delete/many", body);
  },
};

export default ShopServices;
