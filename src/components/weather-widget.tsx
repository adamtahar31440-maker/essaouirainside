import { getTranslations } from "next-intl/server";
import { getEssaouiraConditions, weatherLabel } from "@/lib/weather";
import { WeatherWidgetToggle } from "@/components/weather-widget-toggle";
import { WeatherForecast } from "@/components/weather-forecast";
import { TideForecast } from "@/components/tide-forecast";

export async function WeatherWidget({ locale }: { locale: string }) {
  const [t, conditions] = await Promise.all([getTranslations("weather"), getEssaouiraConditions()]);
  const label = weatherLabel(conditions.weatherCode, conditions.isDay);

  const nextTide = conditions.tides?.find((tide) => new Date(tide.time).getTime() >= Date.now());
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  const badge = (
    <>
      <span>{label.emoji}</span>
      {conditions.temperature !== null && <span>{Math.round(conditions.temperature)}°C</span>}
    </>
  );

  return (
    <WeatherWidgetToggle badge={badge} closeLabel={t("close")}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{label.emoji}</span>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {conditions.temperature !== null ? `${Math.round(conditions.temperature)}°C` : t("unavailable")}
            </p>
            <p className="text-xs text-foreground/60">{label.fr}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-black/5 pt-3 text-sm">
          <div>
            <p className="text-xs font-semibold text-foreground/50">{t("waves")}</p>
            <p className="font-medium text-foreground">
              {conditions.waveHeight !== null ? `${conditions.waveHeight.toFixed(1)} m` : t("unavailable")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground/50">{t("tide")}</p>
            {nextTide ? (
              <p className="font-medium text-foreground">
                {t(nextTide.type === "high" ? "highTide" : "lowTide")} {timeFormatter.format(new Date(nextTide.time))}
              </p>
            ) : (
              <p className="font-medium text-foreground">{t("unavailable")}</p>
            )}
          </div>
        </div>

        {conditions.tides && conditions.tides.length > 0 && (
          <TideForecast
            tides={conditions.tides}
            locale={locale}
            showLabel={t("upcomingTides")}
            hideLabel={t("hideTides")}
            highTideLabel={t("highTide")}
            lowTideLabel={t("lowTide")}
          />
        )}

        {conditions.daily && conditions.daily.length > 0 && (
          <WeatherForecast
            daily={conditions.daily}
            locale={locale}
            showLabel={t("weeklyForecast")}
            hideLabel={t("hideForecast")}
          />
        )}
      </div>
    </WeatherWidgetToggle>
  );
}
