import { Controller, Post, ClassMiddleware } from '@overnightjs/core';
import { Beach } from '~src/models/beach';
import { Request, Response } from 'express';
import { authMiddleware } from '~src/middlewares/auth';
import { BaseController } from './BaseController';

// Rota: /forecast
@Controller('beaches')
@ClassMiddleware(authMiddleware) // Utilizando o ClassMiddleware, nessa classe, todos os metodos irão utilizar o Middleware
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({
        ...req.body,
        ...{ userId: req.context?.userId },
      });

      const result = await beach.save();

      res.status(201).send(result);
    } catch (error: any) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }
}
