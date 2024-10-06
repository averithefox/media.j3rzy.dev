interface IFileObject
{
  name: string,
  type: string,
  rawUrl: string,
  url: string
}

export type FileObject<Authorized extends boolean = false> = IFileObject & (
  Authorized extends true ?
    { private: boolean } :
    {}
  );

interface ISuccessResponse<T = any>
{
  success: true;
  data?: T;
  error?: never;
}

interface IErrorResponse
{
  success: false;
  error: string;
  data?: never;
}

export type EndpointResponse<T = any> = ISuccessResponse<T> | IErrorResponse;

export interface ApiKey
{
  key: string;
  expiresAt: Date | null;
  createdAt: Date;
}