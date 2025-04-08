import requests from "./httpService";

const UserServices = {
  getAllUsers: async ({ name = "",page = 1 }) => {
    let d = requests.get(`/admin?page=${page}&limit=20&name=${name}`);
    console.log(d);
    return d;
  },

  addAllUsers: async (body) => {
    return requests.post("/customer/add/all", body);
  },
  // user create
  createCustomer: async (body) => {
    return requests.post(`/customer/create`, body);
  },

  filterCustomer: async (email) => {
    return requests.post(`/customer/filter/${email}`);
  },
  searchAdmin: async (text) => {
    return requests.get(`/admin/search?text=${text}`);
  },

  getCustomerById: async (id) => {
    return requests.get(`/customer/${id}`);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  deleteCustomer: async (id) => {
    return requests.delete(`/customer/${id}`);
  },
};

export default UserServices;
