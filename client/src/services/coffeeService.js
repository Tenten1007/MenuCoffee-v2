const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/coffees`;

export const getAllCoffees = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch coffees');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching coffees:', error);
    throw error;
  }
};

export const getCoffeeById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch coffee');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching coffee:', error);
    throw error;
  }
};

export const createCoffee = async (coffeeData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coffeeData),
    });
    if (!response.ok) {
      throw new Error('Failed to create coffee');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating coffee:', error);
    throw error;
  }
};

export const updateCoffee = async (id, coffeeData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coffeeData),
    });
    if (!response.ok) {
      throw new Error('Failed to update coffee');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating coffee:', error);
    throw error;
  }
};

export const deleteCoffee = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete coffee');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting coffee:', error);
    throw error;
  }
}; 