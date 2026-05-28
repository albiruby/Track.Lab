export const round = (value: number, digits = 2) => {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
};

export const assertPositive = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be greater than zero.`);
};

export const secondsToHms = (seconds: number) => {
  const sign = seconds < 0 ? "-" : "";
  const s = Math.round(Math.abs(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${sign}${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${sign}${m}:${String(sec).padStart(2, "0")}`;
};

export const formatPace = (secondsPerKm: number) => `${secondsToHms(secondsPerKm)}/km`;
