import type * as React from 'react';

type WithChildren = React.PropsWithChildren<object>;

interface GrabkitProviderProps extends WithChildren {
  baseURL?: string;
}

export default GrabkitProviderProps;
