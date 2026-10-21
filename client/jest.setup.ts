import "@testing-library/jest-dom";

// Tell React's act() machinery that we are in a test environment.
// This suppresses "not wrapped in act(...)" warnings for state updates
// that originate from resolved promises inside useEffect/useCallback.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
