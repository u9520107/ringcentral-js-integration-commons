import SDK from 'ringcentral';
import RingCentralClient from 'ringcentral-client';
import { combineReducers, createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import JSONTree from 'react-json-tree';

import RcModule from '../src/lib/RcModule';

import AccountExtension from '../src/modules/AccountExtension';
import AccountInfo from '../src/modules/AccountInfo';
import ActiveCalls from '../src/modules/ActiveCalls';
import Alert from '../src/modules/Alert';
import Auth from '../src/modules/Auth';
import BlockedNumber from '../src/modules/BlockedNumber';
import Brand from '../src/modules/Brand';
import Call from '../src/modules/Call';
import CallHistory from '../src/modules/CallHistory';
import CallingSettings from '../src/modules/CallingSettings';
import CallMonitor from '../src/modules/CallMonitor';
import CallLog from '../src/modules/CallLog';
import ConnectivityMonitor from '../src/modules/ConnectivityMonitor';
import DetailedPresence from '../src/modules/DetailedPresence';
import DialingPlan from '../src/modules/DialingPlan';
import Environment from '../src/modules/Environment';
import ExtensionInfo from '../src/modules/ExtensionInfo';
import ExtensionPhoneNumber from '../src/modules/ExtensionPhoneNumber';
import ExtensionDevice from '../src/modules/ExtensionDevice';
import ForwardingNumber from '../src/modules/ForwardingNumber';
import GlobalStorage from '../src/modules/GlobalStorage';
import Locale from '../src/modules/Locale';
import Presence from '../src/modules/Presence';
import RateLimiter from '../src/modules/RateLimiter';
import RegionSettings from '../src/modules/RegionSettings';
import Ringout from '../src/modules/Ringout';
import RolesAndPermissions from '../src/modules/RolesAndPermissions';
import Softphone from '../src/modules/Softphone';
import Webphone from '../src/modules/Webphone';
import Storage from '../src/modules/Storage';
import Subscription from '../src/modules/Subscription';
import TabManager from '../src/modules/TabManager';
import NumberValidate from '../src/modules/NumberValidate';
import MessageSender from '../src/modules/MessageSender';
import ComposeText from '../src/modules/ComposeText';
import ContactSearch from '../src/modules/ContactSearch';
import MessageStore from '../src/modules/MessageStore';
import Conversation from '../src/modules/Conversation';
import Messages from '../src/modules/Messages';

import ContactMatcher from '../src/modules/ContactMatcher';
import ActivityMatcher from '../src/modules/ActivityMatcher';
import Conference from '../src/modules/Conference';

import DateTimeFormat from '../src/modules/DateTimeFormat';

import CallLogger from '../src/modules/CallLogger';

import AccountPhoneNumber from '../src/modules/AccountPhoneNumber';
import AddressBook from '../src/modules/AddressBook';
import Contacts from '../src/modules/Contacts';
import ConversationMatcher from '../src/modules/ConversationMatcher';
import ConversationLogger from '../src/modules/ConversationLogger';

import config from './config';

const DemoView = connect(state => ({
  data: state,
  invertTheme: false,
}), () => ({
  shouldExpandNode: (keyName, data, level) => level < 2,
}))(JSONTree);

class DemoPhone extends RcModule {
  constructor() {
    super();
    this.addModule('client', new RingCentralClient(new SDK({
      ...config.api,
      clearCacheOnRefreshError: false,
    })));
    this.addModule('alert', new Alert({
      getState: () => this.state.alert,
    }));
    this.addModule('brand', new Brand({
      id: '1210',
      name: 'RingCentral',
      fullName: 'RingCentral',
      getState: () => this.state.brand,
    }));
    this.addModule('locale', new Locale({
      getState: () => this.state.locale,
    }));
    this.addModule('tabManager', new TabManager({
      getState: () => this.state.tabManager,
    }));
    this.addModule('globalStorage', new GlobalStorage({
      getState: () => this.state.globalStorage,
    }));
    this.addModule('environment', new Environment({
      client: this.client,
      globalStorage: this.globalStorage,
      sdkConfig: {
        ...config.api,
      },
      getState: () => this.state.environment,
    }));
    this.addModule('connectivityMonitor', new ConnectivityMonitor({
      alert: this.alert,
      client: this.client,
      environment: this.environment,
      getState: () => this.state.connectivityMonitor,
    }));
    this.addModule('auth', new Auth({
      alert: this.alert,
      brand: this.brand,
      client: this.client,
      environment: this.environment,
      locale: this.locale,
      tabManager: this.tabManager,
      getState: () => this.state.auth,
    }));
    this.addModule('storage', new Storage({
      auth: this.auth,
      getState: () => this.state.storage,
    }));
    this.addModule('rateLimiter', new RateLimiter({
      alert: this.alert,
      client: this.client,
      environment: this.environment,
      globalStorage: this.globalStorage,
      getState: () => this.state.rateLimiter,
    }));
    this.addModule('softphone', new Softphone({
      brand: this.brand,
    }));
    this.addModule('ringout', new Ringout({
      auth: this.auth,
      client: this.client,
      getState: () => this.state.ringout,
    }));
    this.addModule('accountInfo', new AccountInfo({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.accountInfo,
    }));
    this.addModule('extensionInfo', new ExtensionInfo({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.extensionInfo,
    }));
    this.addModule('rolesAndPermissions', new RolesAndPermissions({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      extensionInfo: this.extensionInfo,
      tabManager: this.tabManager,
      getState: () => this.state.rolesAndPermissions,
    }));
    this.addModule('dialingPlan', new DialingPlan({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.dialingPlan,
    }));
    this.addModule('extensionPhoneNumber', new ExtensionPhoneNumber({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.extensionPhoneNumber,
    }));
    this.addModule('extensionDevice', new ExtensionDevice({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.extensionDevice,
    }));
    this.addModule('forwardingNumber', new ForwardingNumber({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.forwardingNumber,
    }));
    this.addModule('blockedNumber', new BlockedNumber({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.blockedNumber,
    }));
    this.addModule('regionSettings', new RegionSettings({
      storage: this.storage,
      extensionInfo: this.extensionInfo,
      dialingPlan: this.dialingPlan,
      alert: this.alert,
      tabManager: this.tabManager,
      getState: () => this.state.regionSettings,
    }));
    this.addModule('callingSettings', new CallingSettings({
      alert: this.alert,
      brand: this.brand,
      extensionInfo: this.extensionInfo,
      extensionPhoneNumber: this.extensionPhoneNumber,
      forwardingNumber: this.forwardingNumber,
      storage: this.storage,
      rolesAndPermissions: this.rolesAndPermissions,
      tabManager: this._tabManager,
      addWebphone: true,
      getState: () => this.state.callingSettings,
    }));
    this.addModule('webphone', new Webphone({
      appKey: config.api.appKey,
      appName: 'RingCentral Integration',
      appVersion: '0.1.0',
      auth: this.auth,
      alert: this.alert,
      client: this.client,
      storage: this.storage,
      rolesAndPermissions: this.rolesAndPermissions,
      getState: () => this.state.webphone,
    }));
    this.addModule('subscription', new Subscription({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.subscription,
    }));
    this.addModule('detailedPresence', new DetailedPresence({
      auth: this.auth,
      client: this.client,
      subscription: this.subscription,
      getState: () => this.state.detailedPresence,
    }));
    this.addModule('activeCalls', new ActiveCalls({
      auth: this.auth,
      client: this.client,
      subscription: this.subscription,
      getState: () => this.state.activeCalls,
    }));
    this.addModule('callLog', new CallLog({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      subscription: this.subscription,
      rolesAndPermissions: this.rolesAndPermissions,
      getState: () => this.state.callLog,
    }));
    this.addModule('accountExtension', new AccountExtension({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      subscription: this.subscription,
      getState: () => this.state.accountExtension,
    }));
    this.addModule('numberValidate', new NumberValidate({
      client: this.client,
      accountExtension: this.accountExtension,
      regionSettings: this.regionSettings,
      accountInfo: this.accountInfo,
      getState: () => this.state.numberValidate,
    }));
    this.addModule('call', new Call({
      alert: this.alert,
      client: this.client,
      storage: this.storage,
      callingSettings: this.callingSettings,
      regionSettings: this.regionSettings,
      softphone: this.softphone,
      ringout: this.ringout,
      webphone: this.webphone,
      numberValidate: this.numberValidate,
      extensionPhoneNumber: this.extensionPhoneNumber,
      getState: () => this.state.call,
    }));
    this.addModule('presence', new Presence({
      auth: this.auth,
      client: this.client,
      subscription: this.subscription,
      getState: () => this.state.presence,
    }));
    this.addModule('messageSender', new MessageSender({
      alert: this.alert,
      client: this.client,
      getState: () => this.state.messageSender,
      extensionPhoneNumber: this.extensionPhoneNumber,
      extensionInfo: this.extensionInfo,
      numberValidate: this.numberValidate,
    }));
    this.addModule('composeText', new ComposeText({
      alert: this.alert,
      auth: this.auth,
      storage: this.storage,
      getState: () => this.state.composeText,
      messageSender: this.messageSender,
      numberValidate: this.numberValidate,
    }));
    this.addModule('callMonitor', new CallMonitor({
      accountInfo: this.accountInfo,
      detailedPresence: this.detailedPresence,
      activeCalls: this.activeCalls,
      webphone: this.webphone,
      getState: () => this.state.callMonitor,
    }));
    this.addModule('callHistory', new CallHistory({
      accountInfo: this.accountInfo,
      callLog: this.callLog,
      callMonitor: this.callMonitor,
      getState: () => this.state.callHistory,
    }));
    this.addModule('contactMatcher', new ContactMatcher({
      storage: this.storage,
      getState: () => this.state.contactMatcher,
    }));
    this.addModule('activityMatcher', new ActivityMatcher({
      storage: this.storage,
      getState: () => this.state.activityMatcher,
    }));
    this.addModule('conversationMatcher', new ConversationMatcher({
      storage: this.storage,
      getState: () => this.state.conversationMatcher,
    }));
    this.addModule('contactSearch', new ContactSearch({
      auth: this.auth,
      storage: this.storage,
      getState: () => this.state.contactSearch,
    }));
    this.contactSearch.addSearchSource({
      sourceName: 'test',
      searchFn: ({ searchString }) => [{
        entityType: 'account',
        name: ({ searchString }),
        phoneNumber: '+1234567890',
        phoneType: 'phone',
      }],
      formatFn: entities => entities,
      readyCheckFn: () => true,
    });
    this.addModule('messageStore', new MessageStore({
      alert: this.alert,
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      subscription: this.subscription,
      getState: () => this.state.messageStore,
    }));
    this.addModule('conversation', new Conversation({
      auth: this.auth,
      messageSender: this.messageSender,
      extensionInfo: this.extensionInfo,
      messageStore: this.messageStore,
      getState: () => this.state.conversation,
    }));
    this.addModule('dateTimeFormat', new DateTimeFormat({
      locale: this.locale,
      storage: this.storage,
      getState: () => this.state.dateTimeFormat,
    }));
    this.addModule('conference', new Conference({
      auth: this.auth,
      client: this.client,
      regionSettings: this.regionSettings,
      getState: () => this.state.conference,
    }));

    this.addModule('callLogger', new CallLogger({
      storage: this.storage,
      callMonitor: this.callMonitor,
      activityMatcher: this.activityMatcher,
      contactMatcher: this.contactMatcher,
      logFunction: async () => { },
      readyCheckFunction: () => true,
      getState: () => this.state.callLogger,
    }));
    this.addModule('accountPhoneNumber', new AccountPhoneNumber({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.accountPhoneNumber,
    }));
    this.addModule('addressBook', new AddressBook({
      client: this.client,
      auth: this.auth,
      storage: this.storage,
      getState: () => this.state.addressBook,
    }));
    this.addModule('contacts', new Contacts({
      addressBook: this.addressBook,
      accountPhoneNumber: this.accountPhoneNumber,
      accountExtension: this.accountExtension,
      getState: () => this.state.contacts,
    }));
    this.addModule('conversationLogger', new ConversationLogger({
      auth: this.auth,
      contactMatcher: this.contactMatcher,
      conversationMatcher: this.conversationMatcher,
      dateTimeFormat: this.dateTimeFormat,
      extensionInfo: this.extensionInfo,
      messageStore: this.messageStore,
      rolesAndPermissions: this.rolesAndPermissions,
      storage: this.storage,
      tabManager: this.tabManager,
      logFunction: async () => { },
      readyCheckFunction: () => true,
      getState: () => this.state.conversationLogger,
    }));

    this.addModule('messages', new Messages({
      messageStore: this.messageStore,
      extensionInfo: this.extensionInfo,
      conversationLogger: this.conversationLogger,
      getState: () => this.state.messages,
    }));
    this._reducer = combineReducers({
      accountInfo: this.accountInfo.reducer,
      accountExtension: this.accountExtension.reducer,
      activeCalls: this.activeCalls.reducer,
      alert: this.alert.reducer,
      auth: this.auth.reducer,
      blockedNumber: this.blockedNumber.reducer,
      call: this.call.reducer,
      callHistory: this.callHistory.reducer,
      callingSettings: this.callingSettings.reducer,
      callMonitor: this.callMonitor.reducer,
      callLog: this.callLog.reducer,
      connectivityMonitor: this.connectivityMonitor.reducer,
      environment: this.environment.reducer,
      extensionInfo: this.extensionInfo.reducer,
      extensionPhoneNumber: this.extensionPhoneNumber.reducer,
      extensionDevice: this.extensionDevice.reducer,
      forwardingNumber: this.forwardingNumber.reducer,
      brand: this.brand.reducer,
      detailedPresence: this.detailedPresence.reducer,
      dialingPlan: this.dialingPlan.reducer,
      locale: this.locale.reducer,
      storage: this.storage.reducer,
      globalStorage: this.globalStorage.reducer,
      presence: this.presence.reducer,
      rateLimiter: this.rateLimiter.reducer,
      ringout: this.ringout.reducer,
      rolesAndPermissions: this.rolesAndPermissions.reducer,
      regionSettings: this.regionSettings.reducer,
      subscription: this.subscription.reducer,
      tabManager: this.tabManager.reducer,
      numberValidate: this.numberValidate.reducer,
      contactMatcher: this.contactMatcher.reducer,
      activityMatcher: this.activityMatcher.reducer,
      conversationMatcher: this.conversationMatcher.reducer,
      messageSender: this.messageSender.reducer,
      contactSearch: this.contactSearch.reducer,
      composeText: this.composeText.reducer,
      messageStore: this.messageStore.reducer,
      conversation: this.conversation.reducer,
      messages: this.messages.reducer,
      dateTimeFormat: this.dateTimeFormat.reducer,
      conference: this.conference.reducer,
      webphone: this.webphone.reducer,
      callLogger: this.callLogger.reducer,
      accountPhoneNumber: this.accountPhoneNumber.reducer,
      addressBook: this.addressBook.reducer,
      contacts: this.contacts.reducer,
      conversationLogger: this.conversationLogger.reducer,
      lastAction: (state = null, action) => {
        console.log(action);
        return action;
      },
    });
  }
  initialize() {
    ReactDOM.render((
      <Provider store={this.store}>
        <DemoView />
      </Provider>
    ), document.querySelector('#viewport'));
    // let subscribed = false;
    // this.store.subscribe(() => {
    //   if (!subscribed && this.subscription.ready) {
    //     subscribed = true;
    //     this.subscription.subscribe('/account/~/extension/~/presence');
    //   }
    // });
  }
}

const phone = new DemoPhone();
const store = createStore(phone.reducer);
phone.setStore(store);

if (typeof window !== 'undefined') {
  window.phone = phone;
}
