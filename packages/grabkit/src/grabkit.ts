import Call from "./Call";
import Endpoint from "./Endpoint";

function grabkit(baseURL?: string) {
  async function closure<Data = unknown, Error = unknown, Body = unknown>(
    endpoint: Endpoint,
    { body, headers }: { body: Body; headers: Headers | { [key: string]: any } }
  ) {
    const consumer = new Call<Data, Error>(endpoint, baseURL);
    const [response, statusCode] = await consumer.send({ body, headers });

    return [response, statusCode];
  }

  return closure;
}

export default grabkit;
