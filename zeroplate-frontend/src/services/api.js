const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Donations API
export const donationsAPI = {
  getAll: (includeExpired = false) => 
    request(`/donations?includeExpired=${includeExpired}`),
  
  getById: (id) => 
    request(`/donations/${id}`),
  
  create: (data) => 
    request("/donations", { method: "POST", body: data }),
  
  update: (id, data) => 
    request(`/donations/${id}`, { method: "PUT", body: data }),
  
  delete: (id) => 
    request(`/donations/${id}`, { method: "DELETE" }),
};

// Food Requests API
export const foodRequestsAPI = {
  getAll: (foodId = null) => {
    const query = foodId ? `?foodId=${foodId}` : "";
    return request(`/food-requests${query}`);
  },
  
  getById: (id) => 
    request(`/food-requests/${id}`),
  
  create: (data) => 
    request("/food-requests", { method: "POST", body: data }),
  
  update: (id, data) => 
    request(`/food-requests/${id}`, { method: "PUT", body: data }),
  
  delete: (id) => 
    request(`/food-requests/${id}`, { method: "DELETE" }),
};

// Trusted NGOs API
export const trustedNgosAPI = {
  getAll: () => 
    request("/trusted-ngos"),
  
  getById: (id) => 
    request(`/trusted-ngos/${id}`),
  
  create: (data) => 
    request("/trusted-ngos", { method: "POST", body: data }),
  
  update: (id, data) => 
    request(`/trusted-ngos/${id}`, { method: "PUT", body: data }),
  
  delete: (id) => 
    request(`/trusted-ngos/${id}`, { method: "DELETE" }),
};
