export interface FileObject
{
  name: string,
  type: string,
  rawUrl: string,
  url: string
}

export interface ApiKey
{
  key: string;
  expiresAt: Date | null;
  createdAt: Date;
}