import { Server } from "@overnightjs/core";
import bodyParser from "body-parser";
import { Application } from "express";
import { ForecastController } from "./controllers/ForecastController";
import "./util/module-alias";
import * as database from '@src/database/database';
import { BeachesController } from "./controllers/BeachesController";

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
  }

  private setupController(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    this.addControllers([forecastController, beachesController]);
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

}