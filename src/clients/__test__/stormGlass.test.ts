import { StormGlass } from '../../../src/clients/stormGlass';
import * as HTTPUtil from '../../../src/util/request';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalizedResponse3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('../../../src/util/request');

describe('StormGlass clients', () => {

  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;

  // const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedRequest = new HTTPUtil.Request as jest.Mocked<HTTPUtil.Request>;
  it('should return the normalized forecast from the StormGlass service | deve retornar a previsão normalizada do serviço StormGlass', async () => {
    const lat = -35.635;
    const lng = 35.635;

    mockedRequest.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalizedResponse3HoursFixture);
  });

  it('should exclude incomplete data points | deve excluir pontos de dados incompletos', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };
    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtil.Response );

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service | deve receber um erro genérico do serviço StormGlass quando a solicitação falhar antes de chegar ao serviço', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({ message: "Network Error" });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow('Unexpected error when trying to communicate to StormGlass: "Network Error"');
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    MockedRequestClass.isRequestError.mockReturnValue(true);

    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
