import { StormGlass } from '~src/clients/stormGlass';
import stormGlassNormalizedResponse3HoursFixture from '~test/fixtures/stormglass_normalized_response_3_hours.json';
import { ForeCast, ForecastProcessingInternalError } from '../forecast';
import { Beach, GeoPosition } from '~src/models/beach';

jest.mock('~src/clients/stormGlass');

describe('Forecast Service', () => {
  const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>;
  it('should return the forecast for a list of beaches | deve retornar a previsão para uma lista de praias', async () => {
    mockedStormGlassService.fetchPoints.mockResolvedValue(
      stormGlassNormalizedResponse3HoursFixture
    );

    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        user: 'fake-id',
      },
    ];

    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 3.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 0.47,
            windDirection: 299.45,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T01:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T01:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T02:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 182.56,
            swellHeight: 0.28,
            swellPeriod: 3.44,
            time: '2020-04-26T02:00:00+00:00',
            waveDirection: 232.86,
            waveHeight: 0.46,
            windDirection: 321.5,
            windSpeed: 100,
          },
        ],
      },
    ];

    const forecast = new ForeCast(mockedStormGlassService);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);

    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return an empty list when the beaches array is empty | deve retornar uma lista vazia quando o array de praias estiver vazio', async() => {
    const forecast = new ForeCast();
    const response = await forecast.processForecastForBeaches([]);

    expect(response).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process | deve lançar um erro de processamento interno quando algo der errado durante o processo de classificação', async() => {
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        user: 'fake-id',
      },
    ];
    mockedStormGlassService.fetchPoints.mockRejectedValue('Error fetching data');

    const forecast = new ForeCast(mockedStormGlassService);
    await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(ForecastProcessingInternalError);
  });
});
