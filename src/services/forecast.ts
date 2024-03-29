import { ForecastPoint, StormGlass } from '~src/clients/stormGlass';
import logger from '~src/logger';
import { Beach } from '~src/models/beach';
import { InternalError } from '~src/util/errors/internal-error';
import { Rating } from './rating';

export interface TimeForeCast {
  time: string;
  forecast: BeachForecast[];
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class ForeCast {
  constructor(
    protected stormGlass = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForeCast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    logger.info(
      `Preparing the forecast for ${beaches.length} beaches | Preparando a previsão para ${beaches.length} praias`
    );
    try {
      for (const beach of beaches) {
        const rating = new this.RatingService(beach);
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        const enrichedBeachData = this.enrichedBeachData(points, beach, rating);

        pointsWithCorrectSources.push(...enrichedBeachData);
      }
      return this.mapForecastByTime(pointsWithCorrectSources);
    } catch (error: any) {
      logger.error(error);
      throw new ForecastProcessingInternalError(error.message);
    }
  }

  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach,
    rating: Rating
  ): BeachForecast[] {
    const enrichedBeachData = points.map((point) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: rating.getRateForPoint(point),
      },
      ...point,
    }));
    return enrichedBeachData;
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForeCast[] {
    const forecastByTime: TimeForeCast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }
    return forecastByTime;
  }
}
