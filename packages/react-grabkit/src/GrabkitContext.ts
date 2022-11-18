import * as React from 'react';
import GrabkitContextSchema from './GrabkitContextSchema';

const GrabkitContext = React.createContext<GrabkitContextSchema>({} as GrabkitContextSchema);

export default GrabkitContext;
