import { getTranslations } from "next-intl/server";
import { getConditionsFor, weatherLabel } from "@/lib/weather";
import { WeatherWidgetToggle } from "@/components/weather-widget-toggle";
import { WeatherContent } from "@/components/weather-content";

export async function WeatherWidget({ locale }: { locale: string }) {
  const [t, conditions] = await Promise.all([getTranslations("weather"), getConditionsFor("essaouira")]);
  const label = weatherLabel(conditions.weatherCode, conditions.isDay);

  const badge = (
    <>
      <span>{label.emoji}</span>
      {conditions.temperature !== null && <span>{Math.round(conditions.temperature)}°C</span>}
    </>
  );

  return (
    <WeatherWidgetToggle badge={badge} closeLabel={t("close")}>
      <WeatherContent
        initialLocationId="essaouira"
        initialConditions={conditions}
        locale={locale}
        strings={{
          unavailable: t("unavailable"),
          waves: t("waves"),
          tide: t("tide"),
          highTide: t("highTide"),
          lowTide: t("lowTide"),
          weeklyForecast: t("weeklyForecast"),
          hideForecast: t("hideForecast"),
          upcomingTides: t("upcomingTides"),
          hideTides: t("hideTides"),
        }}
      />
    </WeatherWidgetToggle>
  );
}
