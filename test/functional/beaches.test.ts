import { Beach } from '../../src/models/beach';

describe('Beach functional tests | Testes funcionais de praia', () => {
  beforeAll(async () => await Beach.deleteMany({}));
  describe('When creating a beach | Ao criar uma praia', () => {
    it('should create a beach with success | deve criar uma praia com sucesso', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest.post('/beaches').send(newBeach);
      expect(response.status).toBe(201);
      /* Essa parte esta lhe dizendo:
      espero apenas o conteúdo que quero, 
      os demais conteúdo ignora.
      */
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return 422 when is a validation error | deve retornar 422 quando for um erro de validação', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest.post('/beaches').send(newBeach);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });
    });
  });
});
