import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    'Accept-Language': 'en',
    'User-Agent': 'TravelPlanner/1.0 (React Native educational project)',
  },
});

export const routingClient = axios.create({
  baseURL: 'https://router.project-osrm.org',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'User-Agent': 'TravelPlanner/1.0 (React Native educational project)',
  },
});
