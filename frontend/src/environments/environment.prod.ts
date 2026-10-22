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
  // Public demo logins for portfolio visitors. They are meant to be public: the backend
  // (DEMO_ACCOUNTS) stops them from changing passwords, profiles or other users.
  demoAccounts: [
    { role: 'customer', username: 'demo_klient', password: 'DemoKlient!2026' },
    { role: 'admin', username: 'demo_admin', password: 'DemoAdmin!2026' },
  ] as { role: 'customer' | 'admin'; username: string; password: string }[],
};
