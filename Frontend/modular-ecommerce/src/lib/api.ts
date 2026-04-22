const API_URL = 'http://localhost:3000';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  // CSAK ha a token érvénytelen, akkor küldjük a loginra
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  // Ha 204 (No Content) vagy üres a válasz, ne próbálja JSON-ná alakítani
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {};
  }

  const data = await response.json();

  if (!response.ok) {
    throw data; // Itt dobunk hibát, de NEM irányítunk át
  }
  
  return data;
};


