// Albanian labels for the backend's choice values (moved to translation files in step 6)
export const FUEL_LABELS: Record<string, string> = {
  petrol: 'Benzinë',
  diesel: 'Naftë',
  electric: 'Elektrike',
  hybrid: 'Hibride',
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  manual: 'Manuale',
  automatic: 'Automatike',
};

export const TYPE_LABELS: Record<string, string> = {
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  suv: 'SUV',
  truck: 'Pickup',
  coupe: 'Kupe',
  van: 'Furgon',
};

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
