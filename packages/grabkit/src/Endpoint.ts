import type HttpMethod from './HttpMethod';
import type UrlShape from './UrlShape';

// Note that this is the way that Grabkit understands an endpoint is like.
// In real life, of course the endpoint doesn't contain the method that it
// is called through.

type Endpoint = `${HttpMethod} ${UrlShape}`;

export default Endpoint;
