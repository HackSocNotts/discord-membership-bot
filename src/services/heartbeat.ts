import fetch, { Response } from 'node-fetch';

export const beat = (): Promise<Response> => fetch(process.env.heartbeatUrl as string);
