const ESSAOUIRA_LAT = 31.5085;
const ESSAOUIRA_LNG = -9.7595;

export type WeatherConditions = {
  temperature: number | null;
  weatherCode: number | null;
  windSpeed: number | null;
  waveHeight: number | null;
  swellPeriod: number | null;
  tides: { time: string; type: "high" | "low"; height: number }[] | null;
};

const WEATHER_LABELS: Record<number, { emoji: string; fr: string }> = {
  0: { emoji: "☀️", fr: "Ciel dégagé" },
  1: { emoji: "🌤️", fr: "Peu nuageux" },
  2: { emoji: "⛅", fr: "Partiellement nuageux" },
  3: { emoji: "☁️", fr: "Couvert" },
  45: { emoji: "🌫️", fr: "Brouillard" },
  48: { emoji: "🌫️", fr: "Brouillard givrant" },
  51: { emoji: "🌦️", fr: "Bruine légère" },
  61: { emoji: "🌧️", fr: "Pluie légère" },
  63: { emoji: "🌧️", fr: "Pluie" },
  65: { emoji: "🌧️", fr: "Forte pluie" },
  80: { emoji: "🌦️", fr: "Averses" },
  95: { emoji: "⛈️", fr: "Orage" },
};

export function weatherLabel(code: number | null) {
  if (code === null) return { emoji: "🌡️", fr: "Météo" };
  return WEATHER_LABELS[code] ?? { emoji: "🌡️", fr: "Météo" };
}

async function fetchWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${ESSAOUIRA_LAT}&longitude=${ESSAOUIRA_LNG}&current=temperature_2m,weather_code,wind_speed_10m&models=ecmwf_ifs025&timezone=auto`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("weather fetch failed");
  const data = await res.json();
  return {
    temperature: data.current?.temperature_2m ?? null,
    weatherCode: data.current?.weather_code ?? null,
    windSpeed: data.current?.wind_speed_10m ?? null,
  };
}

async function fetchMarine() {
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${ESSAOUIRA_LAT}&longitude=${ESSAOUIRA_LNG}&current=wave_height,swell_wave_period&timezone=auto`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("marine fetch failed");
  const data = await res.json();
  return {
    waveHeight: data.current?.wave_height ?? null,
    swellPeriod: data.current?.swell_wave_period ?? null,
  };
}

// Tide predictions are astronomical (moon/sun position), not a weather model, so
// they come from a separate provider (Stormglass) rather than Open-Meteo. Cached
// for hours at a time to stay well within the free 50-requests/day quota.
async function fetchTides() {
  const key = process.env.STORMGLASS_API_KEY;
  if (!key) return null;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const url = `https://api.stormglass.io/v2/tide/extremes/point?lat=${ESSAOUIRA_LAT}&lng=${ESSAOUIRA_LNG}&start=${start.toISOString()}&end=${end.toISOString()}`;
  const res = await fetch(url, {
    headers: { Authorization: key },
    next: { revalidate: 21600 },
  });
  if (!res.ok) throw new Error("tide fetch failed");
  const data = await res.json();
  return (data.data ?? []).map((t: { time: string; type: string; height: number }) => ({
    time: t.time,
    type: t.type === "high" ? "high" : "low",
    height: t.height,
  }));
}

export async function getEssaouiraConditions(): Promise<WeatherConditions> {
  const [weather, marine, tides] = await Promise.all([
    fetchWeather().catch(() => null),
    fetchMarine().catch(() => null),
    fetchTides().catch(() => null),
  ]);

  return {
    temperature: weather?.temperature ?? null,
    weatherCode: weather?.weatherCode ?? null,
    windSpeed: weather?.windSpeed ?? null,
    waveHeight: marine?.waveHeight ?? null,
    swellPeriod: marine?.swellPeriod ?? null,
    tides: tides ?? null,
  };
}
