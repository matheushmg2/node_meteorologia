import AuthService from '~src/services/auth';
import { authMiddleware } from '../auth';

describe('AuthMiddleware | Middleware de autenticação', () => {
  it('should verify a JWT token and call the next middleware | deve verificar um token JWT e chamar o próximo middleware', () => {
    const jwtToken = AuthService.generateToken({ data: 'fake' });
    const reqFake = {
      headers: {
        'x-access-token': jwtToken,
      },
    };
    const resFake = {};
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if there is a problem on the token verification | deve retornar NÃO AUTORIZADO se houver algum problema na verificação do token', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid token',
      },
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it('should return ANAUTHORIZED middleware if theres no token | deve retornar middleware NÃO AUTORIZADO se não houver token', () => {
    const reqFake = {
      headers: {},
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt must be provided',
    });
  });
});
