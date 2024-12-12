import { Request } from 'express';
import { UserI } from '../../schemas/user.schema';

export type RequestFiles = {
  [fieldname: string]: Express.Multer.File[];
};

export interface RequestType extends Request {
  user?: UserI;
}
