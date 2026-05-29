export const convertKmToMile = (km: number) => km * 0.621371;
export const convertMileToKm = (mile: number) => mile / 0.621371;

export const convertMinKmToMinMile = (minKmSecs: number) => minKmSecs / 0.621371;
export const convertMinMileToMinKm = (minMileSecs: number) => minMileSecs * 0.621371;

export const convertKmHToMph = (kmh: number) => kmh * 0.621371;
export const convertMphToKmH = (mph: number) => mph / 0.621371;

export const convertKgToLb = (kg: number) => kg * 2.20462;
export const convertLbToKg = (lb: number) => lb / 2.20462;

export const convertCelciusToFahrenheit = (c: number) => (c * 9/5) + 32;
export const convertFahrenheitToCelcius = (f: number) => (f - 32) * 5/9;
