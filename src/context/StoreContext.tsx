'use client';
import { UserStore } from '@/stores/user.store';
import { injectStores } from '@mobx-devtools/tools';
import { createContext } from 'react';
import '../services/firebase/firebase.config';
import { CompanyStore } from '@/stores/company.store';
import { TeamMemberStore } from '@/stores/team-member.store';
import { PodcastStore } from '@/stores/podcast.store';
import { EpisodeStore } from '@/stores/episode.store';

export interface Store {
  user: UserStore;
  teamMember: TeamMemberStore;
  company: CompanyStore;
  podcast: PodcastStore;
  episode: EpisodeStore;
}

export const initialStoreValue = {
  user: new UserStore(),
  teamMember: new TeamMemberStore(),
  company: new CompanyStore(),
  podcast: new PodcastStore(),
  episode: new EpisodeStore(),
};

// function to clear all stores
export const clearStores = () => {
  initialStoreValue.user.clearStore();
};

if (typeof window !== 'undefined') {
  injectStores({
    user: initialStoreValue.user,
    teamMember: initialStoreValue.teamMember,
    company: initialStoreValue.company,
    podcast: initialStoreValue.podcast,
    episode: initialStoreValue.episode,
  });
}

const StoreContext = createContext<Store>(initialStoreValue);

export const StoreProvider = ({ children }: any) => {
  return (
    <StoreContext.Provider value={initialStoreValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext;
