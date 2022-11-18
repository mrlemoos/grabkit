import * as React from 'react';

import grabkit, { ClosureOptions, Endpoint } from '../../grabkit/src';

import useGrabkitContext from './useGrabkitContext';

function useGrab<Data = unknown, Error = unknown, Body = unknown>(endpoint: Endpoint, options?: ClosureOptions<Body>) {
  const context = useGrabkitContext();
  const [data, updateData] = React.useState<Data | undefined>();
  const [error, updateError] = React.useState<Error | undefined>();

  const request = React.useMemo(() => grabkit(context.baseURL), [context.baseURL]);

  React.useEffect(() => {
    (async () => {
      const [{ data, error }, status] = await request<Data, Error, Body>(endpoint, options);

      if (status >= 300) {
        updateError(error);
        return;
      }

      updateData(data);
    })();
  }, []);

  return [data, error];
}

export default useGrab;
