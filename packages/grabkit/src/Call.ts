import type Endpoint from './Endpoint';
import type HttpMethod from './HttpMethod';
import type UrlShape from './UrlShape';
import type AnyRecord from './AnyRecord';
import type StatusCode from './StatusCode';

import methods from './methods';

class Call<Data, Error> {
  private method: HttpMethod;
  private url: UrlShape;

  constructor(endpoint: Endpoint, private baseURL?: string) {
    if (!endpoint) {
      throw new Error('grabkit: Where you call? I think you forgot to pass an endpoint \\_(-_-)_/.');
    }

    const [sensitiveCaseMethod, sensitiveCaseURI] = String(endpoint).trim().split(' ');

    if (typeof sensitiveCaseMethod !== 'string') {
      throw new Error(
        'grabkit: I think you forgot the method in your endpoint. It should be like `GET /users/` for instance.',
      );
    }

    const method = sensitiveCaseMethod.trim().toUpperCase();
    let uri = sensitiveCaseURI.trim().toLowerCase();

    if (!uri.startsWith('https://') && !uri.startsWith('http://')) {
      uri = `${baseURL}${uri}`;
    }

    this.validateMethod(method);
    this.validateURI(uri);

    this.url = uri as UrlShape;
    this.method = method as HttpMethod;

    this.debugIfTest();
  }

  async send<Body>({
    body,
    headers,
  }: {
    body?: Body;
    // todo: add headers type to autocomplete work like a charm
    headers?: Headers | AnyRecord;
    // When we see Error type notation here, we are referring to the type of the
    // error that can be thrown by the fetch API, which is a generic type.
    // Forget native Error class.
  }): Promise<[{ data?: Data; error?: Error }, StatusCode]> {
    const response = await fetch(this.url, {
      method: this.method,
      body: typeof body === 'object' ? JSON.stringify(body) : undefined,
      headers,
    });
    const json = await response.json();

    if (response.ok) {
      return [{ data: json }, response.status];
    }

    return [{ data: undefined, error: json }, response.status];
  }

  private debugIfTest(): void {
    if (process.env.NODE_ENV === 'test') {
      console.log(`grabkit: the method was set to be '${this.method}' at '${this.url}'`);
    }
  }

  private validateURI(uri: string): void {
    if (typeof uri !== 'string') {
      throw new Error(
        'grabkit: Where you call? I think you forgot to pass a URI. \n' +
          `You should give us a URI like this: call()('GET /users') so we can get your data : ) (if it helps, we've got ${uri})`,
      );
    }

    if (!(uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('/'))) {
      throw new Error(
        'grabkit: I can be wrong, but I think you forgot to add "http://" or "https://" at the beginning of your URI. \\_(-_-)_/ We don\'t have it automatically because we\'re not sure which of them you wanna use as prefix. \n',
      );
    }

    if (uri.startsWith('/') && typeof this.baseURL !== 'string') {
      throw new Error(
        'grabkit: You have to give us a baseURL if you want to use a relative URI. Or you meant to use octokit, not sure yet :/\n',
      );
    }
  }

  private validateMethod(method: string): void {
    if (typeof method !== 'string') {
      throw new Error(
        'grabkit: Where you call? I think you forgot to pass a method. \n' +
          `You should give us a method like this: call()('GET /users') so we can get your data :P (if it helps, we've got ${method})`,
      );
    }

    if (!methods.includes(method)) {
      throw new Error(`grabkit: I can be wrong, but I think there's no HTTP method called '${method}'`);
    }
  }
}

export default Call;
