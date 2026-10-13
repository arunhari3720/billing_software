import http from "./http";
export const gstSettingService = {
  get: async () => {
    const response = await http.get("/gst-settings/get-gst");
    return response.data;
  },

  update: async (data) => {
    const response = await http.patch("/gst-settings/update-gst", data);
    return response.data;
  },
};