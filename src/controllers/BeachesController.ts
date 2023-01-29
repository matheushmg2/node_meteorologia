import { Controller, Post, ClassMiddleware } from '@overnightjs/core';
import { Beach } from '../../src/models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../../src/middlewares/auth';

// Rota: /forecast
@Controller('beaches')
@ClassMiddleware(authMiddleware) // Utilizando o Middleware, nessa classe, todos os metodos irão utilizar o Middleware
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({ ...req.body, ...{ user: req.decoded?.id } });

      const result = await beach.save();

      res.status(201).send(result);
    } catch (error: any) {
      if(error instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: error.message });
      } else {
        res.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
