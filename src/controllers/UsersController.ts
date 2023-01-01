import { Controller, Get, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import AuthService from '@src/services/auth';

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
      return res.status(401).send({
        code: 401,
        error: 'User not found!',
      });
    }
    if (
      !(await AuthService.comparePassword(req.body.password, user.password))
    ) {
      return res
        .status(401)
        .send({ code: 401, error: 'Password does not match!' });
    }
    const token = AuthService.generateToken(user.toJSON());

    return res.send({ ...user.toJSON(), ...{ token } });
  }
}
