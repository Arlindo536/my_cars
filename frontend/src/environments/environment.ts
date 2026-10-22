// Development settings. `ng build` (production) swaps this file for environment.prod.ts.
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
  // Rental office: placeholder at Skanderbeg Square until the real address is chosen
  office: {
    name: 'My Cars',
    address: 'Sheshi Skënderbej, Tiranë',
    lat: 41.3275,
    lng: 19.8187,
  },
};
