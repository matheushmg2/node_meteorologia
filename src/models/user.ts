import logger from '~src/logger';
import AuthService from '~src/services/auth';
import mongoose, { Document, Model } from 'mongoose';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

interface UserModel extends Omit<User, '_id'>, Document {}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Verificando se existe um email dentro do banco de dados no caso do MongoDB
schema.path('email').validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  'already exists in the database.',
  CUSTOM_VALIDATION.DUPLICATED
);


// Estou usando "function" para utilizar o this apenas dentro da função, não pegando o this globalmente como seria no caso da Arrow Functions
schema.pre<UserModel>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }

  try {
    const hashedPassword = await AuthService.hashPassword(this.password, 10);
    this.password = hashedPassword;
  } catch (error) {
    logger.error(`Error hashing the password for the user ${this.name}`, error);
  }
});

export const User: Model<UserModel> = mongoose.model<UserModel>('User', schema);
