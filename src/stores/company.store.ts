
import { Company } from '@/models/app-general.model';
import BaseStore from './base.store';

export class CompanyStore extends BaseStore<Company> {
    constructor() {
        super('Company');
    }
}
