import api from "./api";

/* ── Auth ─────────────────────────────────────────────── */
export const authApi = {
  login: (data) => api.post("/auth/login", data),

  register: (data) => api.post("/auth/register", data),

  me: () => api.get("/auth/me"),

  updateProfile: (data) => api.put("/auth/profile", data),
};

/* ── Leads ────────────────────────────────────────────── */
export const leadsApi = {
  list: () => api.get("/leads"),

  get: (id) => api.get(`/leads/${id}`),

  create: (data) => api.post("/leads", data),

  update: (id, data) => api.put(`/leads/${id}`, data),

  remove: (id) => api.delete(`/leads/${id}`),

reorder: (id, data) => api.patch(`/leads/${id}/reorder`, data),
};

/* ── Contacts ─────────────────────────────────────────── */
export const contactsApi = {
  list: () => api.get("/contacts"),

  get: (id) => api.get(`/contacts/${id}`),

  create: (data) => api.post("/contacts", data),

  update: (id, data) => api.put(`/contacts/${id}`, data),

  remove: (id) => api.delete(`/contacts/${id}`),
};

/* ── Notes ────────────────────────────────────────────── */
export const notesApi = {
  list: () => api.get("/notes"),

  create: (data) => api.post("/notes", data),

  update: (id, data) => api.put(`/notes/${id}`, data),

  remove: (id) => api.delete(`/notes/${id}`),
};

/* ── Tasks ────────────────────────────────────────────── */
export const tasksApi = {
  list: () => api.get("/tasks"),

  create: (data) => api.post("/tasks", data),

  update: (id, data) => api.put(`/tasks/${id}`, data),

  remove: (id) => api.delete(`/tasks/${id}`),
};

/* ── AI ───────────────────────────────────────────────── */
export const aiApi = {
  status: () => api.get("/ai/status"),

  leadSummary: (data) => api.post("/ai/lead-summary", data),

  generateEmail: (data) => api.post("/ai/generate-email", data),

  salesInsights: (data) => api.post("/ai/sales-insights", data),
};

/* ── Analytics ────────────────────────────────────────── */
export const analyticsApi = {
  overview: async () => {
    const response = await api.get("/analytics/overview");

    return {
      ...response,
      pipeline: Object.entries(response.pipeline).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
      })),
    };
  },
};
