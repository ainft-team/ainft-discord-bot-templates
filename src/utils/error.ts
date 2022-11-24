import { AinftJsError } from '../types/ainft-factory';

export const isAinftJsError = (obj: any): obj is AinftJsError => {
  return obj?.error !== undefined;
}