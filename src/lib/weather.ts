const ESSAOUIRA_LAT = 31.5085;
const ESSAOUIRA_LNG = -9.7595;

export type DailyForecast = { date: string; weatherCode: number | null; tempMax: number; tempMin: number };

export type WeatherConditions = {
  temperature: number | null;
  weatherCode: number | null;
  isDay: boolean;
  windSpeed: number | null;
  waveHeight: number | null;
  swellPeriod: number | null;
  tides: { time: string; type: "high" | "low"; height: number }[] | null;
  daily: DailyForecast[] | null;
};

const WEATHER_LABELS: Record<number, { day: string; night: string; fr: string }> = {
  0: { day: "☀️", night: "🌙", fr: "Ciel dégagé" },
  1: { day: "🌤️", night: "🌙", fr: "Peu nuageux" },
  2: { day: "⛅", night: "☁️", fr: "Partiellement nuageux" },
  3: { day: "☁️", night: "☁️", fr: "Couvert" },
  45: { day: "🌫️", night: "🌫️", fr: "Brouillard" },
  48: { day: "🌫️", night: "🌫️", fr: "Brouillard givrant" },
  51: { day: "🌦️", night: "🌧️", fr: "Bruine légère" },
  61: { day: "🌧️", night: "🌧️", fr: "Pluie légère" },
  63: { day: "🌧️", night: "🌧️", fr: "Pluie" },
  65: { day: "🌧️", night: "🌧️", fr: "Forte pluie" },
  80: { day: "🌦️", night: "🌧️", fr: "Averses" },
  95: { day: "⛈️", night: "⛈️", fr: "Orage" },
};

export function weatherLabel(code: number | null, isDay: boolean) {
  if (code === null) return { emoji: "🌡️", fr: "Météo" };
  const entry = WEATHER_LABELS[code];
  if (!entry) return { emoji: "🌡️", fr: "Météo" };
  return { emoji: isDay ? entry.day : entry.night, fr: entry.fr };
}

async function fetchWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${ESSAOUIRA_LAT}&longitude=${ESSAOUIRA_LNG}&current=temperature_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&models=ecmwf_ifs025&timezone=auto`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("weather fetch failed");
  const data = await res.json();
  const daily: DailyForecast[] = (data.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    weatherCode: data.daily?.weather_code?.[i] ?? null,
    tempMax: data.daily?.temperature_2m_max?.[i],
    tempMin: data.daily?.temperature_2m_min?.[i],
  }));
  return {
    temperature: data.current?.temperature_2m ?? null,
    weatherCode: data.current?.weather_code ?? null,
    isDay: data.current?.is_day !== 0,
    windSpeed: data.current?.wind_speed_10m ?? null,
    daily,
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
// they come from a separate provider (Stormglass) rather than Open-Meteo. Their
// free tier is a hard 10 requests/day (not the 50/day originally assumed), so
// this fetches a 4-day window in one call — enough for both "next tide" and a
// short forecast — and caches for 5h (up to ~4-5 calls/day under steady traffic,
// fewer when traffic is quiet), comfortably under the 10/day cap.
async function fetchTides() {
  const key = process.env.STORMGLASS_API_KEY;
  if (!key) return null;

  // Morocco is UTC+1 year-round (no DST since 2018) — compute "today" in that
  // offset rather than the server's UTC clock, so the window doesn't drift by
  // an hour and drop the last tide of the day right when it's needed.
  const nowInMorocco = new Date(Date.now() + 60 * 60 * 1000);
  const start = new Date(Date.UTC(nowInMorocco.getUTCFullYear(), nowInMorocco.getUTCMonth(), nowInMorocco.getUTCDate()) - 60 * 60 * 1000);
  const end = new Date(start.getTime() + 96 * 60 * 60 * 1000);

  const url = `https://api.stormglass.io/v2/tide/extremes/point?lat=${ESSAOUIRA_LAT}&lng=${ESSAOUIRA_LNG}&start=${start.toISOString()}&end=${end.toISOString()}`;
  const res = await fetch(url, {
    headers: { Authorization: key },
    next: { revalidate: 18000 },
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
    isDay: weather?.isDay ?? true,
    windSpeed: weather?.windSpeed ?? null,
    waveHeight: marine?.waveHeight ?? null,
    swellPeriod: marine?.swellPeriod ?? null,
    tides: tides ?? null,
    daily: weather?.daily ?? null,
  };
}
