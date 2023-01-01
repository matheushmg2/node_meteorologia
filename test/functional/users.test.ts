import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

const mackSut = (email: string) => ({
  name: 'new user',
  email,
  password: 'password',
});

describe('Users Functional tests | Testes funcionais de usuários', () => {
  // Para deletar todos os usuários
  beforeEach(async () => {
    await User.deleteMany({});
    const user = new User(mackSut('email@example.com'));
    await user.save();
  });

  describe('When creating a new user | Ao criar um novo usuário', () => {
    it('should successfully create a new user with encrypted password | deve criar com sucesso um novo usuário com senha criptografada', async () => {
      const user = mackSut('email@example2.com');

      const response = await global.testRequest.post('/users').send(user);

      expect(response.status).toBe(201);
      await expect(
        AuthService.comparePassword(user.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...user,
          ...{ password: expect.any(String) },
        })
      );
    });

    it('Should return 422  when there is a validation error | Deve retornar 400 quando houver um erro de validação', async () => {
      const { name, ...userNotName } = mackSut('email@example3.com');

      const response = await global.testRequest
        .post('/users')
        .send(userNotName);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('Should return 409 when the email already exists | Deve retornar 409 quando o e-mail já existe', async () => {
      const user = mackSut('email@example.com');
      const response = await global.testRequest.post('/users').send(user);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in the database.',
      });
    });
  });

  describe('When authenticating a user | Ao autenticar um usuário', () => {
    it('Should generate a token for a valid user | Deve gerar um token para um usuário válido', async () => {
      const user = mackSut('email@example2.com');

      await new User(user).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: user.email, password: user.password });

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('Should return UNAUTHORIZED if the user with the given email is not found | Deve retornar NÃO AUTORIZADO se o usuário com o e-mail informado não for encontrado', async () => {
      const user = mackSut('some-email@mail.com');
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: user.email, password: user.password });

      expect(response.status).toBe(401);
    });

    it('Should return UNAUTHORIZED if the user is found but the password does not match | Deve retornar NÃO AUTORIZADO se o usuário for encontrado, mas a senha não corresponder', async () => {
      const newUser = mackSut('email@example2.com');
      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: 'different password' });

        console.log(response.body);

      expect(response.status).toBe(401);
    });
  });
});
