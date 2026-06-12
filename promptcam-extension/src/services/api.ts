const API_BASE = 'http://localhost:8080/api/scripts';

export const api = {
  getScripts: async () => {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch scripts');
    return res.json();
  },
  
  createScript: async (data: { title: string, content: string }) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create script');
    return res.json();
  },

  updateScript: async (id: string, data: { title: string, content: string }) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update script');
    return res.json();
  },

  deleteScript: async (id: string) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete script');
  }
};
