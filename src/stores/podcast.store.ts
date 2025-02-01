
import { Podcast } from '@/models/app-general.model';
import BaseStore from './base.store';

export class PodcastStore extends BaseStore<Podcast> {
    constructor() {
        super('Podcast');
    }
}
