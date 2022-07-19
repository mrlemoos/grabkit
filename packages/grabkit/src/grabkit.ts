import Call from './Call';
import type AnyRecord from './AnyRecord';
import type Endpoint from './Endpoint';
import type StatusCode from './StatusCode';

function grabkit(baseURL?: string) {
  async function closure<Data = unknown, Error = unknown, Body = unknown>(
    endpoint: Endpoint,
    options?: { body: Body; headers: Headers | AnyRecord },
  ): Promise<[{ data?: Data; error?: Error }, StatusCode]> {
    const consumer = new Call<Data, Error>(endpoint, baseURL);
    const [response, statusCode] = await consumer.send({ body: options?.body, headers: options?.headers });

    return [response, statusCode];
  }

  return closure;
}

export default grabkit;
