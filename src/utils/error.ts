import { AinftJsError } from '../types/ainftFactory';

export const isAinftJsError = (obj: any): obj is AinftJsError => {
  return obj?.error !== undefined;
}