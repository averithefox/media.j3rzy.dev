export interface IFileObject
{
  name: string;
  type: string;
  uploadedAt: number;
}

/**
 * @template V Whether the file object includes `private` property.
 */
export type FileObject<V extends boolean = false> = IFileObject & (
  V extends true ?
    { private: boolean } :
    Record<string, never>
  );

interface ISuccessResponse<T = unknown>
{
  success: true;
  data: T;
  error?: never;
}

interface IErrorResponse
{
  success: false;
  error: string;
  data?: never;
}

/**
 * @template T The type of the data to be returned.
 * @template V Is the data key present in the response object?
 */
export type EndpointResponse<T = unknown, V extends boolean = true> =
  (ISuccessResponse<T> & (V extends true ? Record<string, never> : { data?: T }))
  | IErrorResponse;

export interface ApiKey
{
  key: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface PopUpData
{
  title: string;
  message: string;
  success: boolean;
}