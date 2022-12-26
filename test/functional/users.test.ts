import { User } from "@src/models/user";

describe('Users Functional tests | Testes funcionais de usuários', () => {

  // Para deletar todos os usuários
  beforeEach(async() => {
    await User.deleteMany({});
  })
  describe('When creating a new user | Ao criar um novo usuário', () => {
    it('deve criar com sucesso um novo usuário', async() => {
      const newUser = {
        name: 'new user',
        email: 'email@example.com',
        password: 'password'
      };

      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newUser));
    });
  });
});