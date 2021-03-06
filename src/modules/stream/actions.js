import debounce from 'lodash/function/debounce';
import Flux from '../../flux';
import {getters as authGetters} from '../auth';
import {actions as syncActions} from '../sync';
import actionTypes from './action-types';
import handleRemoteEvent from './handle-remote-event';

// maximum time we can go without receiving anything from the server
const MAX_INACTIVITY_TIME = 60000;

let source = null;

// Called on each interaction with the server
// So when debounce is done we exceeded MAX_INACTIVITY_TIME.
// Why? Because the error event listener on EventSource cannot be trusted.
const scheduleHealthCheck = debounce(function() {
  start();
}, MAX_INACTIVITY_TIME);

const stopStream = function stopStream() {
  source.close();
  source = null;
  scheduleHealthCheck.cancel();
};

export function start({syncOnInitialConnect=true} = {}) {
  if (source !== null) {
    stopStream();
  }

  const authToken = Flux.evaluate(authGetters.authToken);
  const url = `/api/stream?api_password=${authToken}`;

  source = new EventSource(url);

  source.addEventListener('open', function() {
    scheduleHealthCheck();

    Flux.dispatch(actionTypes.STREAM_START);

    // We are streaming, fetch latest info but stop syncing
    syncActions.stop();

    if (syncOnInitialConnect) {
      syncActions.fetchAll();
    } else {
      syncOnInitialConnect = true;
    }
  }, false);

  source.addEventListener('message', function(ev) {
    scheduleHealthCheck();

    if (ev.data === 'ping') {
      return;
    }

    handleRemoteEvent(JSON.parse(ev.data));
  }, false);

  source.addEventListener('error', function() {
    if (source.readyState !== EventSource.CLOSED) {
      Flux.dispatch(actionTypes.STREAM_ERROR);
    }
  }, false);

}

export function stop() {
  stopStream();

  Flux.dispatch(actionTypes.STREAM_STOP);

  syncActions.start();
}
