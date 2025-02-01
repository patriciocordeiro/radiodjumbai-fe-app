
import { Program } from '@/models/app-general.model';
import BaseStore from './base.store';

export class ProgramStore extends BaseStore<Program> {
    constructor() {
        super('Program');
    }
}
