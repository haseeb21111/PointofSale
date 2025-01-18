// context/CategoryContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CategoryContext = createContext();

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data.map((category) => category.name));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Add a new category to the API and update local state
  const addCategory = async (name) => {
    try {
      const { data } = await axios.post('/api/categories', { name });
      setCategories((prevCategories) => [...prevCategories, data.name]);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
