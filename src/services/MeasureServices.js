import requests from "./httpService";

const MeasureServices = {
  getAllMeasure: async ({ type, option, option1,page }) => {
    return requests.get(
      `/measures?type=${type}&option=${option}&option1=${option1}&page=${page}&limit=20`
    );
  },

  addMeasure: async (body) => {
    return requests.post("/measures", body);
  },

  getMeasureById: async (id) => {
    return requests.get(`/measures/${id}`);
  },


  updateMeasure: async (id, body) => {
    return requests.put(`/measures/${id}`, body);
  },


  updateStatus: async (id, body) => {
    return requests.put(`/measures/status/${id}`, body);
  },


  deleteMeasure: async (id, body) => {
    return requests.delete(`/measures/${id}`, body);
  },

};

export default MeasureServices;
