import { prefixActions } from '../ActionMap';
import proxyActions from './proxyActions';

export default function getProxyClientReducer(prefix, moduleReducer) {
  const actions = prefixActions({ actions: proxyActions, prefix });
  return (state, action) => {
    if (!state) {
      return {
        lastAction: null,
        actionNumber: -1,
        module: moduleReducer(),
      };
    }
    if (!action) {
      return state;
    }
    switch (action.type) {
      case actions.action:
        if (action.actionNumber === state.actionNumber + 1) {
          return Object.assign(
            {},
            state,
            {
              lastAction: action.action,
              actionNumber: action.actionNumber,
              module: moduleReducer(state.module, action.action),
            },
          );
        }
        return state;
      case actions.sync:
        return {
          module: action.module,
          lastAction: action.lastAction,
          actionNumber: action.actionNumber,
        };
      default:
        return state;
    }
  };
}