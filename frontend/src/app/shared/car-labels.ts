// Backend choice values; their labels live in public/i18n/*.json under fuel.*, transmission.*, type.*
export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
export const TRANSMISSION_TYPES = ['manual', 'automatic'];
export const CAR_TYPES = ['sedan', 'hatchback', 'suv', 'truck', 'coupe', 'van'];

export interface CatalogCar {
  id: number;
  model: string;
  year: number;
  km: number;
  fuel_type: string;
  transmission_type: string;
  type: string;
  price_per_day: string;
  description: string;
  image: string | null;
}
