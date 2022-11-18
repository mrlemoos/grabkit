import * as React from 'react';

import GrabkitContext from './GrabkitContext';
import GrabkitProviderProps from './GrabkitProviderProps';

const GrabkitProvider = ({ children, baseURL }: GrabkitProviderProps) => (
  <GrabkitContext.Provider value={{ baseURL }}>{children}</GrabkitContext.Provider>
);

export default GrabkitProvider;
