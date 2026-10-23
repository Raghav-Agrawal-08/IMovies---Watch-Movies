import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CityContext = createContext(null);

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState(
    () => localStorage.getItem('imovies_city') || 'Mumbai'
  );
  const [cities, setCities] = useState([
    'Mumbai',
    'Delhi-NCR',
    'Bengaluru',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
  ]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await api.cinemas.getCities();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCities(res.data);
        }
      } catch (err) {
        // Fallback to default cities list
      }
    };
    loadCities();
  }, []);

  const selectCity = (city) => {
    setCurrentCity(city);
    localStorage.setItem('imovies_city', city);
    setIsCityModalOpen(false);
  };

  const openCityModal = () => setIsCityModalOpen(true);
  const closeCityModal = () => setIsCityModalOpen(false);

  return (
    <CityContext.Provider
      value={{
        currentCity,
        cities,
        selectCity,
        isCityModalOpen,
        openCityModal,
        closeCityModal,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
