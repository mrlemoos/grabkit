import * as React from 'react';

import GrabkitContext from './GrabkitContext';

function useGrabkitContext() {
  const context = React.useContext(GrabkitContext);
  if (context === undefined) {
    throw new Error('useGrabkitContext: must be used within a <GrabkitProvider>');
  }
  return context;
}

export default useGrabkitContext;
