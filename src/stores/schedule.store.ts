
import { Schedule } from '@/models/app-general.model';
import BaseStore from './base.store';

export class ScheduleStore extends BaseStore<Schedule> {
    constructor() {
        super('Schedule');
    }
}
