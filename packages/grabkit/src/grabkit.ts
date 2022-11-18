import Call from './Call';
import type ClosureOptions from './ClosureOptions';
import type Endpoint from './Endpoint';
import type StatusCode from './StatusCode';

function grabkit(baseURL?: string) {
  async function closure<Data = unknown, Error = unknown, Body = unknown>(
    endpoint: Endpoint,
    options?: ClosureOptions<Body>,
  ): Promise<[{ data?: Data; error?: Error }, StatusCode]> {
    const consumer = new Call<Data, Error>(endpoint, baseURL);
    const [response, statusCode] = await consumer.send({ body: options?.body, headers: options?.headers });

    if (typeof response.error !== 'undefined') {
      const errorMessage = `Grabkit: the response has retrieved an error from the server with the following structure: ${response.error}`;

      if (typeof options?.log === 'function') {
        options.log(errorMessage);
      } else if (options?.log) {
        console.error(errorMessage);
      }
    }

    return [response, statusCode];
  }

  return closure;
}

export default grabkit;
