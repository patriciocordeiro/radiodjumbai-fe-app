
import { TeamMember } from '@/models/app-general.model';
import BaseStore from './base.store';

export class TeamMemberStore extends BaseStore<TeamMember> {
    constructor() {
        super('TeamMember');
    }
}
