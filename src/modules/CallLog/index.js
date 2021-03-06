import Pollable from '../../lib/Pollable';
import fetchList from '../../lib/fetchList';
import moduleStatuses from '../../enums/moduleStatuses';
import getDateFrom from '../../lib/getDateFrom';
import actionTypes from './actionTypes';
import getCallLogReducer, {
  getDataReducer,
  getTimestampReducer,
  getTokenReducer,
} from './getCallLogReducer';

import sleep from '../../lib/sleep';
import subscriptionFilters from '../../enums/subscriptionFilters';
import syncTypes from '../../enums/syncTypes';
import {
  hasEndedCalls,
  removeDuplicateIntermediateCalls,
  removeInboundRingOutLegs,
} from '../../lib/callLogHelpers';
import callResults from '../../enums/callResults';

const DEFAULT_TTL = 5 * 60 * 1000;
const DEFAULT_TOKEN_EXPIRES_IN = 60 * 60 * 1000;
const DEFAULT_DAY_SPAN = 7;
const RECORD_COUNT = 250;
const DEFAULT_TIME_TO_RETRY = 62 * 1000;
const SYNC_DELAY = 30 * 1000;

export function processData(data) {
  return {
    records: data.records,
    timestamp: (new Date(data.syncInfo.syncTime)).getTime(),
    syncToken: data.syncInfo.syncToken,
  };
}

export function getISODateFrom(daySpan) {
  const d = getDateFrom(daySpan);
  return d.toISOString();
}

export function getISODateTo(records) {
  let dateTo;
  records.forEach((call) => {
    if (!dateTo || call.startTime < dateTo) dateTo = call.startTime;
  });
  return dateTo && (new Date(dateTo)).toISOString();
}

const presenceRegExp = /\/presence\?detailedTelephonyState=true$/;

export default class CallLog extends Pollable {
  constructor({
    auth,
    client,
    storage,
    subscription,
    rolesAndPermissions,
    ttl = DEFAULT_TTL,
    tokenExpiresIn = DEFAULT_TOKEN_EXPIRES_IN,
    timeToRetry = DEFAULT_TIME_TO_RETRY,
    daySpan = DEFAULT_DAY_SPAN,
    polling = true,
    ...options
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._auth = auth;
    this._client = client;
    this._storage = storage;
    this._subscription = subscription;
    this._rolesAndPermissions = rolesAndPermissions;
    this._dataStorageKey = 'callLogData';
    this._tokenStorageKey = 'callLogToken';
    this._timestampStorageKey = 'callLogTimestamp';
    this._ttl = ttl;
    this._tokenExpiresIn = tokenExpiresIn;
    this._timeToRetry = timeToRetry;
    this._daySpan = daySpan;
    this._polling = polling;

    this._storage.registerReducer({
      key: this._dataStorageKey,
      reducer: getDataReducer(this.actionTypes),
    });
    this._storage.registerReducer({
      key: this._tokenStorageKey,
      reducer: getTokenReducer(this.actionTypes),
    });
    this._storage.registerReducer({
      key: this._timestampStorageKey,
      reducer: getTimestampReducer(this.actionTypes),
    });

    this._reducer = getCallLogReducer(this.actionTypes);

    this.addSelector('calls',
      () => this.data,
      data => (
        // TODO make sure removeDuplicateIntermediateCalls is necessary here
        removeInboundRingOutLegs(removeDuplicateIntermediateCalls(data.filter(call => (
          // [RCINT-3472] calls with result === 'stopped' seems to be useless
          call.result !== callResults.stopped
        ))))
      ),
    );

    this._promise = null;
    this._lastMessage = null;
  }
  _subscriptionHandler = async (message) => {
    if (
      presenceRegExp.test(message.event) &&
      message.body &&
      message.body.activeCalls &&
      hasEndedCalls(message.body.activeCalls)
    ) {
      const ownerId = this._auth.ownerId;
      await sleep(SYNC_DELAY);
      if (ownerId === this._auth.ownerId) {
        this.sync();
      }
    }
  }
  _onStateChange = async () => {
    if (
      this._auth.loggedIn &&
      this._storage.ready &&
      (!this._subscription || this._subscription.ready) &&
      this._rolesAndPermissions.ready &&
      this.status === moduleStatuses.pending
    ) {
      this.store.dispatch({
        type: this.actionTypes.init,
        daySpan: this._daySpan,
      });
      if (
        this.token &&
        (
          !this.timestamp ||
          Date.now() - this.timestamp > this._tokenExpiresIn
        )
      ) {
        this.store.dispatch({
          type: this.actionTypes.clearToken,
        });
      }
      await this.sync();
      if (this._subscription) {
        this._subscription.subscribe(subscriptionFilters.detailedPresence);
      }
      this.store.dispatch({
        type: this.actionTypes.initSuccess,
      });
    } else if (
      (
        !this._auth.loggedIn ||
        !this._storage.ready ||
        (this._subscription && !this._subscription.ready) ||
        !this._rolesAndPermissions.ready
      ) &&
      this.ready
    ) {
      this.store.dispatch({
        type: this.actionTypes.reset,
      });
      this._clearTimeout();
      this._promise = null;
      this.store.dispatch({
        type: this.actionTypes.resetSuccess,
      });
    } else if (
      this.ready &&
      this._subscription &&
      this._subscription.ready &&
      this._subscription.message &&
      this._subscription.message !== this._lastMessage
    ) {
      this._lastMessage = this._subscription.message;
      this._subscriptionHandler(this._lastMessage);
    }
  }

  initialize() {
    this.store.subscribe(this._onStateChange);
  }

  get status() {
    return this.state.status;
  }

  get ready() {
    return this.state.status === moduleStatuses.ready;
  }

  get data() {
    return this._storage.getItem(this._dataStorageKey);
  }

  get calls() {
    return this._selectors.calls();
  }

  get token() {
    return this._storage.getItem(this._tokenStorageKey);
  }

  get timestamp() {
    return this._storage.getItem(this._timestampStorageKey);
  }

  get ttl() {
    return this._ttl;
  }

  get timeToRetry() {
    return this._timeToRetry;
  }

  get canReadCallLog() {
    return !!this._rolesAndPermissions.permissions.ReadCallLog;
  }

  get canReadPresence() {
    return !!this._rolesAndPermissions.permissions.ReadPresenceStatus;
  }

  async _fetch({ dateFrom, dateTo }) {
    return fetchList(params => (
      this._client.account().extension().callLog().list({
        ...params,
        dateFrom,
        dateTo,
      })
    ));
  }

  async _iSync() {
    const ownerId = this._auth.ownerId;
    try {
      this.store.dispatch({
        type: this.actionTypes.iSync,
      });
      const data = await this._client.account().extension().callLogSync().list({
        syncType: syncTypes.iSync,
        syncToken: this.token,
      });
      if (ownerId !== this._auth.ownerId) throw Error('request aborted');
      this.store.dispatch({
        type: this.actionTypes.iSyncSuccess,
        ...processData(data),
        daySpan: this._daySpan,
      });
    } catch (error) {
      if (ownerId === this._auth.ownerId) {
        this.store.dispatch({
          type: this.actionTypes.iSyncError,
          error,
        });
        throw error;
      }
    }
  }
  async _fSync() {
    const ownerId = this._auth.ownerId;
    try {
      this.store.dispatch({
        type: this.actionTypes.fSync,
      });

      const dateFrom = getISODateFrom(this._daySpan);
      const data = await this._client.account().extension().callLogSync().list({
        recordCount: RECORD_COUNT,
        syncType: syncTypes.fSync,
        dateFrom,
      });
      if (ownerId !== this._auth.ownerId) throw Error('request aborted');
      let supplementRecords;
      const {
        records,
        timestamp,
        syncToken,
      } = processData(data);
      if (records.length >= RECORD_COUNT) {
        // reach the max record count
        supplementRecords = (await this._fetch({
          dateFrom,
          dateTo: getISODateTo(records),
        }));
      }
      if (ownerId !== this._auth.ownerId) throw Error('request aborted');
      this.store.dispatch({
        type: this.actionTypes.fSyncSuccess,
        records,
        supplementRecords,
        timestamp,
        syncToken,
        daySpan: this._daySpan,
      });
    } catch (error) {
      if (ownerId === this._auth.ownerId) {
        this.store.dispatch({
          type: this.actionTypes.fSyncError,
          error,
        });
        throw error;
      }
    }
  }
  async _sync(syncType) {
    const ownerId = this._auth.ownerId;
    try {
      let shouldFSync = syncType === syncTypes.fSync;
      if (!shouldFSync) {
        try {
          await this._iSync();
        } catch (error) {
          shouldFSync = true;
        }
      }
      if (shouldFSync && ownerId === this._auth.ownerId) {
        await this._fSync();
      }
      if (this._polling) {
        this._startPolling();
      }
    } catch (error) {
      if (ownerId === this._auth.ownerId) {
        if (this._polling) {
          this._startPolling(this.timeToRetry);
        } else {
          this._retry();
        }
      }
    }
    this._promise = null;
  }
  sync(syncType = this.token ? syncTypes.iSync : syncTypes.fSync) {
    if (!this._promise) {
      this._promise = this._sync(syncType);
      return this._promise;
    } else if (!this._queueSync) {
      this._queueSync = (async () => {
        await this._promise;
        this._promise = (async () => {
          await sleep(300);
          return this._sync(syncType);
        })();
        this._queueSync = null;
        return this._promise;
      })();
      return this._queueSync;
    }
    return this._queueSync;
  }
  fetchData() {
    this.sync();
  }
}
