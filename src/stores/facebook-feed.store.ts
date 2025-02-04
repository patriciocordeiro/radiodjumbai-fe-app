import { FacebookFeed } from '@/models/app-general.model';
import BaseStore from './base.store';

export class FacebookFeedStore extends BaseStore<FacebookFeed> {



    constructor() {
        super('FacebookFeed');
        this.itemList = [];
    }



    listFeedItems(accessToken: string): Promise<any> {
        const cacheKey = 'facebookFeedCache';
        const cacheDuration = 1000 * 60 * 5; // 5 minutes

        return new Promise((resolve, reject) => {
            // Check for cached data
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { timestamp, data } = JSON.parse(cachedData);
                console.log('Cached Facebook feed:', data);
                if (Date.now() - timestamp < cacheDuration) {
                    this.setItemList({
                        itemList: data,
                        storageKey: cacheKey,
                    });
                    resolve(data);
                    return;
                } else {
                    localStorage.removeItem(cacheKey);
                }
            }

            if (!window.FB) {
                reject('Facebook SDK not loaded');
                return;
            }

            window.FB.api(
                `/c4devbr/feed?access_token=${accessToken}&fields=permalink_url,attachments{description,title},message&limit=6`,
                (response: any) => {
                    if (response && !response.error) {
                        this.setItemList({
                            itemList: response.data ?? [],
                            storageKey: cacheKey,
                        });
                        localStorage.setItem(
                            cacheKey,
                            JSON.stringify({
                                timestamp: Date.now(),
                                data: response.data,
                            })
                        );
                        resolve(response.data);

                    } else {
                        reject(response.error);
                    }
                    setTimeout(() => {
                        (window as any).FB.XFBML.parse();
                    }, 1000);
                }
            );
        });
    }
}