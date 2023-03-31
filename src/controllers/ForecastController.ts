import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Beach } from '~src/models/beach';
import { ForeCast } from '~src/services/forecast';
import { authMiddleware } from '~src/middlewares/auth';
import logger from '~src/logger';
import { BaseController } from './BaseController';

const forecast = new ForeCast();

// Rota: /forecast
@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get('')
  public async getForecastForLoggerUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ userId: req.context?.userId });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
