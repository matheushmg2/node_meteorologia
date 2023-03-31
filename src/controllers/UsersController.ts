import { Controller, Get, Middleware, Post } from '@overnightjs/core';

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import AuthService from '~src/services/auth';
import { User } from '~src/models/user';
import { authMiddleware } from '~src/middlewares/auth';

// Rota: /forecast
@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (error: any) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found!',
      });
    }
    if (
      !(await AuthService.comparePassword(req.body.password, user.password))
    ) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password does not match!',
      });
    }
    const token = AuthService.generateToken(user.id);

    return res.send({ ...user.toJSON(), ...{ token } });
  }

  @Get('me')
  @Middleware(authMiddleware) // Utilizando o Middleware, nesse Método, apenas esse Método irá utilizar a autenticação
  public async me(req: Request, res: Response): Promise<Response> {

    const userId = req.context?.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found!',
      });
    }
    return res.send({ user });
  }
}
