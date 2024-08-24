import requests from "./httpService";

const CommunicationService = {
  sendEmail: async (body) => {
    return requests.post(`/communication`,body);
  },

  getEmailTemplates: async () => {
    return requests.get(`/communication`);
  },
  getEmails: async () => {
    return requests.get(`/communication/sent`);
  },

  deleteTemplates: async (id) => {
    return requests.delete(`/communication/${id}`);
  },
};

export default CommunicationService;
