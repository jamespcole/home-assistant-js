import { Store, toImmutable } from 'nuclear-js';
import actionTypes from '../action-types';

class ServerConfigStore extends Store {
  getInitialState() {
    return toImmutable({
      latitude: null,
      longitude: null,
      location_name: 'Home',
      temperature_unit: '°C',
      time_zone: 'UTC',
    });
  }

  initialize() {
    this.on(actionTypes.SERVER_CONFIG_LOADED, serverConfigLoaded);
    this.on(actionTypes.LOG_OUT, logOut);
  }
}

const INSTANCE = new ServerConfigStore();

export default INSTANCE;

function serverConfigLoaded(state, {latitude, longitude, location_name,
                                    temperature_unit, time_zone}) {
  return toImmutable({
    latitude,
    longitude,
    location_name,
    temperature_unit,
    time_zone,
  });
}

function logOut(state) {
  return INSTANCE.getInitialState();
}
