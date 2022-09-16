# Grabkit

Grabkit is the TypeScript kit for easily grab data from server, its intention is to help you grab data and toss them to the server next chair.

## Installation

| Yarn                   | PNPM                   | NPM                   |
| :--------------------- | :--------------------- | :-------------------- |
| `yarn install grabkit` | `pnpm install grabkit` | `npm install grabkit` |

## Code examples

Take a look how to use it:

```typescript
import grabkit from 'grabkit';

const request = grabkit('https://api.github.com');

async function myAsyncFunction() {
  const [response, statusCode] = await request('GET /users/mrlemoos/repos');

  console.log('The data retrieved by the server is available in', response.data);
  console.log('If grabkit finds an error from the server, it will be available in', response.error);
}
```

We recommend you to deconstruct the response to get the data and the error like this:

```typescript
const [{ data, error }, statusCode] = await request('GET /users/mrlemoos/repos');
```

### Conclusion

1. We add the HTTP method at first and in uppercase, giving the explicitness so in a real-world project, developers know shortly which method is being used over which endpoint of their application.

2. It is a multiple instance possibility. That means that grabkit can be created in as many files as you like, adding single responsibility to specific pieces of your code.

3. If you want to use a `baseURL` to determine the URL where the service is running, it's way easier to get the data from with just passing the endpoint after the method, so we don't need to rewrite the protocol, the hostname and so on if we need to just call a request.

4. Happy hacking :smile:
