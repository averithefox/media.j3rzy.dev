interface IFileObject
{
  name: string;
  type: string;
  rawUrl: string;
  url: string;
  uploadedAt: number;
}

/**
 * @template T Whether the file object includes `private` property.
 */
export type FileObject<T extends boolean = false> = IFileObject & (
  T extends true ?
    { private: boolean } :
    {}
  );

interface ISuccessResponse<T = any>
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
 * @template V Whether to include the data in the response.
 */
export type EndpointResponse<T = any, V extends boolean = true> =
  (ISuccessResponse<T> & (V extends true ? {} : { data?: T }))
  | IErrorResponse;

export interface ApiKey
{
  key: string;
  expiresAt: Date | null;
  createdAt: Date;
}