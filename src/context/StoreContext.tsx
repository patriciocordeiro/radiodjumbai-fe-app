'use client';
import { UserStore } from '@/stores/user.store';
import { injectStores } from '@mobx-devtools/tools';
import { createContext } from 'react';
import '../services/firebase/firebase.config';
import { CompanyStore } from '@/stores/company.store';
import { TeamMemberStore } from '@/stores/team-member.store';
import { PodcastStore } from '@/stores/podcast.store';
import { EpisodeStore } from '@/stores/episode.store';
import { ProgramStore } from '@/stores/program.store';
import { ScheduleStore } from '@/stores/schedule.store';
import { FacebookFeedStore } from '@/stores/facebook-feed.store';

export interface Store {
  user: UserStore;
  teamMember: TeamMemberStore;
  company: CompanyStore;
  podcast: PodcastStore;
  episode: EpisodeStore;
  schedule: ScheduleStore;
  program: ProgramStore;
  facebookFeed: FacebookFeedStore;
}

export const initialStoreValue = {
  user: new UserStore(),
  teamMember: new TeamMemberStore(),
  company: new CompanyStore(),
  podcast: new PodcastStore(),
  episode: new EpisodeStore(),
  schedule: new ScheduleStore(),
  program: new ProgramStore(),
  facebookFeed: new FacebookFeedStore(),
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
    schedule: initialStoreValue.schedule,
    program: initialStoreValue.program,
    facebookFeed: initialStoreValue.facebookFeed,
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
