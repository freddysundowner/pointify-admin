import requests from "./httpService";

const DashboardService = {
  getAllLoans: async ({
    body,
    headers,
    customerName,
    status,
    page = 1,
    limit = 8,
    day,
    method,
    startDate,
    endDate,
  }) => {
    const searchName = customerName !== null ? customerName : "";
    const searchStatus = status !== null ? status : "";
    const searchDay = day !== null ? day : "";
    const searchMethod = method !== null ? method : "";
    const startD = startDate !== null ? startDate : "";
    const endD = endDate !== null ? endDate : "";

    return requests.get(
      `/loan?memberSearchQuery=${searchName}&status=${searchStatus}&day=${searchDay}&page=${page}&limit=${limit}&createdAtStart=${startD}&createdAtEnd=${endD}&method=${searchMethod}`,
      body,
      headers
    );
  },

  getAllLoansTwo: async ({ invoice, body, headers }) => {
    const searchInvoice = invoice !== null ? invoice : "";
    return requests.get(`/Loans/all?invoice=${searchInvoice}`, body, headers);
  },

  getRecentLoans: async ({
    page = 1,
    limit = 8,
    startDate = "1:00",
    endDate = "23:59",
  }) => {
    return requests.get(
      `/Loans/recent?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`
    );
  },

  approveLoan: async (id, body) => {
    return requests.put(`/loan/${id}/approve`, body);
  },
  rejectLoan: async (id, body) => {
    return requests.put(`/loan/${id}/reject`, body);
  },
  fixLoan: async (id, body) => {
    return requests.post(`/loan/fix/loan/installments/${id}`, body);
  },
  getLoanCustomer: async (id, body) => {
    return requests.get(`/Loans/customer/${id}`, body);
  },

  getLoanById: async (id, body) => {
    return requests.get(`/loan/${id}`, body);
  },

  updateLoan: async (id, body, headers) => {
    return requests.put(`/loan/${id}`, body, headers);
  },

  deleteLoan: async (id) => {
    return requests.delete(`/Loans/${id}`);
  },

  getDashboardLoansData: async ({ page = 1, limit = 8, endDate = "23:59" }) => {
    return requests.get(
      `/Loans/dashboard?page=${page}&limit=${limit}&endDate=${endDate}`
    );
  },

  getDashboardAmount: async () => {
    return requests.get("/subscriptions/summary/stats");
  },

  getDashboardCount: async () => {
    return requests.get("/subscriptions/summary/stats");
  },

  getDashboardRecentPayments: async ({
    page = 1,
    limit = 8,
    customerName = "",
  }) => {
    return requests.get(
      `/payments?page=${page}&limit=${limit}&user=${customerName}`
    );
  },

  getDashboardRecentTransactions: async ({
    page = 1,
    limit = 8,
    customerName = "",
  }) => {
    return requests.get(
      `/transactions?page=${page}&limit=${limit}&user=${customerName}`
    );
  },
  addLoan: async (data) => {
    return requests.post("/loan", data);
  },
};

export default DashboardService;
