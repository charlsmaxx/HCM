// API base URL
const API_BASE = '/api';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add auth token if exists
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        // Provide more specific error messages
        let errorMessage = data.error || data.message || 'API request failed';
        
        // Handle database connection errors
        if (response.status === 503) {
          errorMessage = data.message || 'Service temporarily unavailable. Database connection is not ready. Please try again in a moment.';
        }
        
        // Handle authentication errors
        if (response.status === 401) {
          errorMessage = data.error || 'Authentication required. Please login.';
        }
        
        // Handle authorization errors
        if (response.status === 403) {
          errorMessage = data.error || 'Access denied. You do not have permission.';
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }
      
      return data;
    } else {
      // For non-JSON responses, return the response object
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          const error = new Error(errorData.error || errorData.message || 'API request failed');
          error.status = response.status;
          throw error;
        } catch {
          const error = new Error(errorText || 'API request failed');
          error.status = response.status;
          throw error;
        }
      }
      return response;
    }
  } catch (error) {
    console.error('API Error:', error);
    // Re-throw with status code if available
    if (error.status) {
      throw error;
    }
    throw error;
  }
}

// API methods
const api = {
  // Sermons
  getSermons: () => apiCall('/sermons'),
  getSermon: (id) => apiCall(`/sermons/${id}`),
  createSermon: (data) => apiCall('/sermons', { method: 'POST', body: JSON.stringify(data) }),
  updateSermon: (id, data) => apiCall(`/sermons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSermon: (id) => apiCall(`/sermons/${id}`, { method: 'DELETE' }),
  downloadSermon: (id) => apiCall(`/sermons/${id}/download`, { method: 'POST' }),

  // Events
  getEvents: () => apiCall('/events'),
  getEvent: (id) => apiCall(`/events/${id}`),
  createEvent: (data) => apiCall('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => apiCall(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => apiCall(`/events/${id}`, { method: 'DELETE' }),

  // Blog
  getBlogPosts: () => apiCall('/blog'),
  getBlogPost: (id) => apiCall(`/blog/${id}`),
  createBlogPost: (data) => apiCall('/blog', { method: 'POST', body: JSON.stringify(data) }),
  updateBlogPost: (id, data) => apiCall(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlogPost: (id) => apiCall(`/blog/${id}`, { method: 'DELETE' }),

  // Team
  getTeam: () => apiCall('/team'),
  createTeamMember: (data) => apiCall('/team', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamMember: (id, data) => apiCall(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeamMember: (id) => apiCall(`/team/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => apiCall('/settings'),
  updateSettings: (data) => apiCall('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Donations
  createDonation: (data) => apiCall('/donations', { method: 'POST', body: JSON.stringify(data) }),
  getDonations: () => apiCall('/donations'),

  // Prayer Requests
  createPrayerRequest: (data) => apiCall('/prayers', { method: 'POST', body: JSON.stringify(data) }),
  getPrayerRequests: () => apiCall('/prayers'),
  updatePrayerRequest: (id, data) => apiCall(`/prayers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Testimonials
  getTestimonials: () => apiCall('/testimonials'),
  getTestimonial: (id) => apiCall(`/testimonials/${id}`),
  createTestimonial: (data) => apiCall('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  updateTestimonial: (id, data) => apiCall(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTestimonial: (id) => apiCall(`/testimonials/${id}`, { method: 'DELETE' }),
};

// Make it globally available
window.api = api;







