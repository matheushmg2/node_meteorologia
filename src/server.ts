import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { ForecastController } from './controllers/ForecastController';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import * as database from '~src/database/database';
import { BeachesController } from './controllers/BeachesController';
import { UsersController } from './controllers/UsersController';
import logger from './logger';

export class SetupServer extends Server {
  constructor(private port = 4000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupController();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    // this.setupController();
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupController(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();

    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info('Server listening on port: ' + this.port);
    });
  }
}
