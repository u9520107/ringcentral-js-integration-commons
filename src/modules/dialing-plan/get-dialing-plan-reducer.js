import { prefixActions } from '../../lib/redux-helper';
import dialingPlanActions from './dialing-plan-actions';
import dialingPlanStatus from './dialing-plan-status';

export default function getDialingPlanReducer(prefix) {
  const actions = prefixActions(dialingPlanActions, prefix);
  return (state, action) => {
    if (!state) {
      return {
        status: dialingPlanStatus.pending,
        error: null,
      };
    }
    if (!action) {
      return state;
    }
    switch (action.type) {
      case actions.ready:
        return {
          status: dialingPlanStatus.ready,
          error: null,
        };
      case actions.fetch:
        return {
          status: dialingPlanStatus.fetching,
          error: null,
        };
      case actions.fetchSuccess:
        return {
          status: dialingPlanStatus.ready,
          error: null,
        };
      case actions.fetchError:
        return {
          status: dialingPlanStatus.ready,
          error: action.error,
        };
      case actions.reset:
        return {
          status: dialingPlanStatus.pending,
          error: null,
        };
      default:
        return state;
    }
  };
}