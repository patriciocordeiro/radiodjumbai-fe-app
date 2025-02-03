
import { action, makeObservable, observable } from 'mobx';
import BaseStore from './base.store';
import { User } from '@/models/app-general.model';

export class UserStore extends BaseStore<User> {

  couplePartner = {} as User;
  isFacebookLoaded = false;
  constructor() {
    super('User');

    makeObservable(this, {
      couplePartner: observable,
      isFacebookLoaded: observable,
      getCouplePartner: action
    }
    );
  }

  getCouplePartner = async ({ id }: {
    id: string;
  }) => {
    if (this.couplePartner.id) {
      return this.couplePartner;
    }
    const partner = await localStorage.getItem('couplePartner');
    if (partner && JSON.parse(partner).id === id) {
      this.couplePartner = JSON.parse(partner);
      return this.couplePartner;
    }
    const result = await this.modelApi.getItem(id);
    this.setCouplePartner({ partner: result.data! });

    return result;

  };

  setCouplePartner({ partner }: { partner: User; }) {
    this.couplePartner = partner;
    localStorage.setItem('couplePartner', JSON.stringify(partner));
  }


  logout = () => {
    this.selectedItem = {} as User;
    this.clearStore();
  };


  clearStore = () => {
    this.selectedItem = {} as User;
    this.itemList = [];
  };

  get coupleNames() {
    return `${this.selectedItem?.name} & ${this.couplePartner?.name}`;
  }

  setFacebookLoaded = () => {
    this.isFacebookLoaded = true;
  };
}
