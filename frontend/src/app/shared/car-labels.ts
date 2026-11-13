// Backend choice values; their labels live in public/i18n/*.json under fuel.*, transmission.*, type.*
export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
export const TRANSMISSION_TYPES = ['manual', 'automatic'];
export const CAR_TYPES = ['sedan', 'hatchback', 'suv', 'truck', 'coupe', 'van'];

// Material icon per fuel type (cards, spec grid)
export function fuelIcon(fuel: string): string {
  return ({ electric: 'ev_station', hybrid: 'eco' } as Record<string, string>)[fuel] ?? 'local_gas_station';
}

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
