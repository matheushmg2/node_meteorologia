import { CUSTOM_VALIDATION } from '../../src/models/user';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ) {
    /**
     * Estamos estanciando um tipo de Error -> nesse exeplo,
     * estamos estanciando um tipo do (error instanceof mongoose.Error.ValidationError)
     * estamos estanciando o mongoose.Error.ValidationError para dentro de uma variavel error
     */
    if (error instanceof mongoose.Error.ValidationError) {
      const clientError = this.handleClientErrors(error);

        res.status(clientError.code).send({ code: clientError.code, error: clientError.error});

    } else {
      res.status(500).send({ code: 500, error: 'Something went wrong!' }); // Algo deu errado!
    }
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): { code: number; error: string } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) => err.name === 'ValidatorError' && err.kind === CUSTOM_VALIDATION.DUPLICATED
    );
    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }
}
