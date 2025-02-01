
import { Episode } from '@/models/app-general.model';
import BaseStore from './base.store';

export class EpisodeStore extends BaseStore<Episode> {
    constructor() {
        super('Episode');
    }
}
