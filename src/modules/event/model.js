import { Immutable } from 'nuclear-js';
import callApi from '../../call-api';

const ENTITY = 'event';

let ImmutableEvent = new Immutable.Record({
  event: null,
  listenerCount: 0,
}, 'Event');

export default class Event extends ImmutableEvent {
  static entity = ENTITY

  constructor(event, listenerCount = 0) {
    super({event, listenerCount});
  }

  get id() {
    return this.event;
  }

  static fetchAll() {
    return callApi('GET', 'events');
  }

  static fromJSON({event, listener_count}) {
    return new Event(event, listener_count);
  }

}
