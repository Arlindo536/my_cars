// Production settings. The API is expected behind the same domain (reverse proxy), see step 9.
export const environment = {
  production: true,
  apiUrl: '/api',
  // Rental office: placeholder at Skanderbeg Square until the real address is chosen
  office: {
    name: 'My Cars',
    address: 'Sheshi Skënderbej, Tiranë',
    lat: 41.3275,
    lng: 19.8187,
  },
};
