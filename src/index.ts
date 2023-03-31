import logger from './logger';
import { SetupServer } from './server';
import config from 'config';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

process.on('unhandledRejection', (reason: any, promise: any) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason ${reason} | Saída do aplicativo devido a uma promessa não tratada: ${promise} e motivo ${reason}`
  );
  // lets throw the error and let the uncaughtException handle below handle it || vamos lançar o erro e deixar o tratamento uncaughtException abaixo tratá-lo
  throw reason;
});

process.on('uncaughtException', (error: any) => {
  logger.error(`App exiting due to an uncaught exception: ${error} | Aplicativo saindo devido a uma exceção não capturada: ${error}`);
  process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.map((signal) => {
      process.on(signal, async () => {
        try {
          await server.close();
          logger.info(
            'App exited with success | Aplicativo encerrado com sucesso'
          );
          process.exit(ExitStatus.Success);
        } catch (error) {
          logger.error(`App exited with error: ${error}`);
          process.exit(ExitStatus.Failure);
        }
      });
    });
  } catch (error) {
    logger.error(`App exited with total error: ${error}`);
    process.exit(ExitStatus.Failure);
  }
})();
