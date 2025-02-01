import { ProcessStatus } from '@/enums/process-status';
import FirestoreService, {
  Filter,
} from '@/services/firebase/firebase-firestore.service';
import { action, makeObservable, observable } from 'mobx';
import { Observable } from 'rxjs';

interface BaseStoreState {
  status: ProcessStatus;
  error: string;
}

const initialState: BaseStoreState = {
  status: ProcessStatus.IDLE,
  error: '',
};

export enum StoreKeys {
  ListItems = 'listItems',
  FilterItems = 'filterItems',
  GetItem = 'getItem',
  GetByEmail = 'getByEmail',
  GetById = 'getById',
  CreateItem = 'createItem',
  CreateWithCustomId = 'createWithCustomId',
  UpdateItem = 'updateItem',
  DeleteItem = 'deleteItem',
  DeleteItems = 'deleteItems',
  OnItemsChange = 'onItemsChange',
  OnUpdateItem = 'onUpdateItem',
  listSubCollectionItems = 'listSubCollectionItems',
  getSubCollectionItems = 'getSubCollectionItems',
  deleteSubCollectionItem = 'deleteSubcollectionItem',
  updateSubCollectionItem = 'updateSubcollectionItem',
  getSubCollectionItem = 'getSubCollectionItem',
}

const CACHE_EXPIRATION_TIME_MS = 60 * 1000 * 60 * 24; // 1 day  (adjust as needed)

class BaseStore<T extends { id?: string }> {
  modelApi: FirestoreService<T>;
  collectionName: string = '';
  readonly status = {
    [StoreKeys.ListItems]: ProcessStatus.IDLE,
    [StoreKeys.FilterItems]: ProcessStatus.IDLE,
    [StoreKeys.GetItem]: ProcessStatus.IDLE,
    [StoreKeys.GetByEmail]: ProcessStatus.IDLE,
    [StoreKeys.GetById]: ProcessStatus.IDLE,
    [StoreKeys.CreateItem]: ProcessStatus.IDLE,
    [StoreKeys.CreateWithCustomId]: ProcessStatus.IDLE,
    [StoreKeys.UpdateItem]: ProcessStatus.IDLE,
    [StoreKeys.DeleteItem]: ProcessStatus.IDLE,
    [StoreKeys.DeleteItems]: ProcessStatus.IDLE,
    [StoreKeys.OnItemsChange]: ProcessStatus.IDLE,
    [StoreKeys.OnUpdateItem]: ProcessStatus.IDLE,
    [StoreKeys.listSubCollectionItems]: ProcessStatus.IDLE,
    [StoreKeys.getSubCollectionItems]: ProcessStatus.IDLE,
    [StoreKeys.deleteSubCollectionItem]: ProcessStatus.IDLE,
    [StoreKeys.updateSubCollectionItem]: ProcessStatus.IDLE,
    [StoreKeys.getSubCollectionItem]: ProcessStatus.IDLE,
  };
  error = initialState.error;
  changeItemData: {
    type: string;
    data: T;
  } = {
    type: '',
    data: {} as T,
  };

  itemList: T[] = [] as T[];
  searchResult: T[] = [];
  filterResult: T[] = [];
  selectedItem: T | null = {} as T;
  newItem: T | null = {} as T;
  cacheKeys: { list: string; item: string };

  private ongoingRequests = new Map<string, Promise<T | null | undefined>>();

  // Loading states map

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.cacheKeys = {
      list: this.collectionName + 'list',
      item: this.collectionName + 'item',
    };

    this.modelApi = new FirestoreService<T>(this.collectionName);

    makeObservable(this, {
      itemList: observable,
      searchResult: observable,
      filterResult: observable,
      selectedItem: observable,
      status: observable,
      error: observable,
      newItem: observable,
      changeItemData: observable,
      setError: action,
      setStatus: action,
      setItemList: action,
      listItems: action,
      createItem: action,
      updateItem: action,
      deleteItem: action,
      setFilterResult: action,
      setSearchResult: action,
      setSelectedItem: action,
      clearSearchResult: action,
      clearFilterResult: action,
      setNewItem: action,
      setChangeItemData: action,
    });
  }

  private generateListCacheKey({
    filters,
    pageSize,
    sortField,
    sortOrder,
  }: {
    filters?: Filter[];
    pageSize?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): string {
    const keyParts = [
      this.collectionName,
      filters ? JSON.stringify(filters) : '',
      pageSize ? pageSize.toString() : '',
      sortField ? sortField : '',
      sortOrder ? sortOrder : '',
    ];
    return keyParts.join('_');
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_EXPIRATION_TIME_MS;
  }

  private getCachedData(
    cacheKey: string,
    disableCache?: boolean,
    skipAddToStore?: boolean
  ): T | null | undefined {
    if (!disableCache) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (this.isCacheValid(timestamp)) {
          if (!skipAddToStore) {
            this.setSelectedItem({ item: data, cacheKey });
          }
          return data;
        }
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
    return undefined;
  }

  private async fetchDataFromApi(
    id?: string,
    filters?: Filter[]
  ): Promise<T | null | undefined> {
    if (!filters) {
      return (await this.modelApi.getItem(id as string)).data;
    } else {
      return (await this.modelApi.list<T>({ filters }))?.data?.[0];
    }
  }

  async listItems({
    filters,
    pageSize,
    sortField,
    sortOrder,
    disableCache,
  }: {
    filters?: Filter[];
    disableCache?: boolean;
    pageSize?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<T[]> {
    if (this.status[StoreKeys.ListItems] === ProcessStatus.LOADING) {
      return this.itemList;
    }

    this.setStatus({ key: StoreKeys.ListItems, status: ProcessStatus.LOADING });

    try {
      const cacheKey = this.cacheKeys.list;

      // this.generateListCacheKey({
      //   filters,
      //   pageSize,
      //   sortField,
      //   sortOrder,
      // });

      if (!disableCache) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);

          if (data.length === 0) {
            localStorage.removeItem(cacheKey);
            console.log('Empty cache, fetching from server');
            this.listItems({
              filters,
              pageSize,
              sortField,
              sortOrder,
              disableCache: false,
            });
          }

          if (this.isCacheValid(timestamp)) {
            this.setItemList({ itemList: data as T[], storageKey: cacheKey });
            return data;
          } else {
            localStorage.removeItem(cacheKey);
          }
        } else {
          localStorage.removeItem(cacheKey);
        }
      }

      console.warn('Reading docs from server', 'LIST ITEMS', this.modelApi);
      const result = await this.modelApi.list<T>({
        filters,
        pageSize,
        sortField,
        sortOrder,
      });

      console.log('result', filters);

      if (result.error) {
        // clear cache
        localStorage.removeItem(cacheKey);
        throw result.error;
      }

      this.setItemList({
        itemList: result.data as T[],
        storageKey: cacheKey,
        disableCache,
      });

      if (!disableCache) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: result.data,
          })
        );
      }

      return result.data || ([] as T[]);
    } catch (error) {
      console.error('Error getting document:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.ListItems,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async filterItems({
    filter,
    disableCache,
  }: {
    filter: Filter;
    disableCache?: boolean;
  }) {
    if (this.status[StoreKeys.FilterItems] === ProcessStatus.LOADING) {
      return this.filterResult;
    }

    try {
      if (!disableCache) {
        const cacheKey = JSON.stringify(
          this.collectionName + JSON.stringify(filter)
        );
        const cacheData = localStorage.getItem(cacheKey);
        if (cacheData) {
          this.setFilterResult({ filterResult: JSON.parse(cacheData) as T[] });
          return;
        }
      }

      console.warn('Reading docs from server', 'FILTER ITEMS', this.modelApi);
      const result = await this.modelApi.list<T>({});
      this.setFilterResult({ filterResult: result.data as T[], disableCache });
      return result;
    } catch (error) {
      console.error('Error getting document:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.FilterItems,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async getItem({
    id,
    filters,
    disableCache,
    skipAddToStore = false,
  }: {
    id?: string;
    filters?: Filter[];
    disableCache?: boolean;
    skipAddToStore?: boolean;
  }): Promise<T | null | undefined> {
    if (!id && !filters) return;

    const cacheKey = this.cacheKeys.item + JSON.stringify(id ?? filters);

    if (this.ongoingRequests.has(cacheKey)) {
      return (await this.ongoingRequests.get(cacheKey)) ?? null;
    }

    this.setStatus({ key: StoreKeys.GetItem, status: ProcessStatus.LOADING });

    const requestPromise = (async () => {
      try {
        const cachedData = this.getCachedData(
          cacheKey,
          disableCache,
          skipAddToStore
        );

        if (cachedData) return cachedData;

        const result = await this.fetchDataFromApi(id, filters);
        if (!result) return null;

        if (!skipAddToStore) {
          this.setSelectedItem({ item: result, disableCache, cacheKey });
        }

        return result;
      } catch (error) {
        console.error('Error getting document:', error);
        this.setError({ error: error as string });
        throw error;
      } finally {
        this.setStatus({
          key: StoreKeys.GetItem,
          status: ProcessStatus.SUCCESS,
        });
        this.ongoingRequests.delete(cacheKey);
      }
    })();

    this.ongoingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async getByEmail({
    email,
    disableCache,
  }: {
    email: string;
    disableCache?: boolean;
  }) {
    if (this.status[StoreKeys.GetByEmail] === ProcessStatus.LOADING) {
      return;
    }

    this.setStatus({
      key: StoreKeys.GetByEmail,
      status: ProcessStatus.LOADING,
    });

    try {
      const filters: Filter[] = [
        { field: 'email', operator: '==', value: email },
      ];

      console.warn('Reading docs from server', 'GET BY E-MAIL');

      const result = await this.modelApi.list<T>({
        filters,
      });

      if (!result.data?.length) return;

      const cacheKey =
        this.cacheKeys.item + JSON.stringify((result.data?.[0] as T).id);

      this.setSelectedItem({ item: result.data?.[0], disableCache, cacheKey });

      return result.data?.[0];
    } catch (error) {
      console.error('Error getting document:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.GetByEmail,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async getById({
    idFieldName,
    id,
    disableCache,
  }: {
    idFieldName: string;
    id: string;
    disableCache?: boolean;
  }) {
    const loadingKey = 'getById';

    if (this.status[StoreKeys.GetById] === ProcessStatus.LOADING) {
      return;
    }

    this.setStatus({
      key: StoreKeys.GetById,
      status: ProcessStatus.LOADING,
    });

    try {
      const cacheKey = this.cacheKeys.item + JSON.stringify(id);
      if (!disableCache) {
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (this.isCacheValid(timestamp)) {
            this.setSelectedItem({
              item: JSON.parse(cachedData) as T,
              cacheKey,
            });
            return JSON.parse(cachedData) as T;
          }
        }
      }

      console.warn('Reading docs from server', 'GET BY ID');

      const filters: Filter[] = [
        { field: idFieldName, operator: '==', value: id },
      ];

      const result = await this.modelApi.list<T>({
        filters,
      });

      this.setSelectedItem({
        item: result.data?.[0] as T,
        disableCache,
        cacheKey,
      });

      return result.data?.[0];
    } catch (error) {
      console.error('Error getting document:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.GetById,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async createItem({
    userId,
    item,
    disableStore,
    disableCache,
    isInsertLast = true,
    setAsActive,
  }: {
    userId: string;
    item: T;
    disableStore?: boolean;
    disableCache?: boolean;
    isInsertLast?: boolean;
    setAsActive?: boolean;
  }) {
    this.setStatus({
      key: StoreKeys.CreateItem,
      status: ProcessStatus.LOADING,
    });

    try {
      const id = await this.modelApi.create({ ...item, userId });
      const newItem = await this.modelApi.getItem(id as string);

      if (setAsActive) {
        this.setSelectedItem({ item: newItem.data as T });
      }
      if (!disableStore) {
        this.setItemList({
          itemList: isInsertLast
            ? [...this.itemList, newItem.data as T]
            : [newItem.data as T, ...this.itemList],
          storageKey: this.cacheKeys.list,
          disableCache,
        });
      }
      return newItem.data;
    } catch (error) {
      console.error('Error creating item:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.CreateItem,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async createWithCustomId({
    userId,
    id,
    item,
    disableCache,
  }: {
    id: string;
    item: T;
    userId: string;
    disableCache?: boolean;
  }) {
    if (this.status[StoreKeys.CreateWithCustomId] === ProcessStatus.LOADING) {
      return;
    }

    this.setStatus({
      key: StoreKeys.CreateWithCustomId,
      status: ProcessStatus.LOADING,
    });

    try {
      await this.modelApi.createWithCustomId({
        documentId: id,
        data: { ...item, userId },
      });

      const newItem = await this.modelApi.getItem(id);

      this.setItemList({
        itemList: [...this.itemList, newItem.data as T],
        storageKey: this.cacheKeys.list,
        disableCache,
      });
      return newItem.data;
    } catch (error) {
      console.error('Error creating item:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.CreateWithCustomId,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async updateItem({
    id,
    item,
    disableCache,
  }: {
    id: string;
    item: Partial<T>;
    disableCache?: boolean;
  }) {
    if (this.status[StoreKeys.UpdateItem] === ProcessStatus.LOADING) {
      return;
    }

    this.setStatus({
      key: StoreKeys.UpdateItem,
      status: ProcessStatus.LOADING,
    });

    try {
      const cacheKey = this.cacheKeys.item + JSON.stringify(id);

      const result = await this.modelApi.update(id, item);
      if (!result) return;

      const updatedItem = await this.modelApi.getItem(id);

      this.setSelectedItem({ item: updatedItem.data as T, cacheKey });

      this.setItemList({
        itemList: this.itemList.map((item) =>
          item?.id === id ? { ...item, ...updatedItem.data } : item
        ),
        storageKey: this.cacheKeys.list,
        disableCache,
      });

      return result;
    } catch (error) {
      console.error('Error updating item:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.UpdateItem,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async deleteItem({ id }: { id: string }) {
    if (this.status[StoreKeys.DeleteItem] === ProcessStatus.LOADING) {
      return;
    }

    this.setStatus({
      key: StoreKeys.DeleteItem,
      status: ProcessStatus.LOADING,
    });

    try {
      const result = await this.modelApi.delete(id);
      this.setItemList({
        itemList: this.itemList.filter((item) => item.id !== id),
        storageKey: this.cacheKeys.list,
      });

      return result;
    } catch (error) {
      console.error('Error deleting item:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.DeleteItem,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async deleteItems({ ids }: { ids: string[] }) {
    if (this.status[StoreKeys.DeleteItems] === ProcessStatus.LOADING) {
      return;
    }

    this.setStatus({
      key: StoreKeys.DeleteItems,
      status: ProcessStatus.LOADING,
    });

    try {
      const result = await Promise.all(
        ids.map(async (id) => {
          await this.modelApi.delete(id);
        })
      );

      this.setItemList({
        itemList: this.itemList.filter((item) => !ids.includes(item?.id!)),
        storageKey: this.cacheKeys.list,
      });

      return result;
    } catch (error) {
      console.error('Error deleting item:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.DeleteItems,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  onItemsChange({ filter }: { filter?: Filter } = {}): Observable<T[]> {
    let myFunction = this.modelApi.onDocChange<T>(filter);

    return new Observable((observer) =>
      myFunction.subscribe(
        (data) => {
          console.warn(
            'Reading docs from server',
            'ON ITEMS CHANGE',
            data.eventType
          );
          if (data.eventType === 'added') {
            this.setItemList({
              itemList: [...this.itemList, ...data.data],
              storageKey: this.cacheKeys.list,
            });

            // this.setChangeItemData({ type: 'added', data: data.data });
          } else if (data.eventType === 'removed') {
            this.setItemList({
              itemList: this.itemList.filter(
                (item) => item.id !== data.data[0].id
              ),
              storageKey: this.cacheKeys.list,
            });

            this.setChangeItemData({ type: 'removed', data: data.data });
          } else if (data.eventType === 'modified') {
            // find the item and update it

            const itemList = [...this.itemList].map((item) =>
              item.id === data.data[0].id ? data.data[0] : item
            );

            this.setItemList({
              itemList: [...itemList],
              storageKey: this.cacheKeys.list,
            });
            // storageKey: this.cacheKeys.list,

            // this.setChangeItemData({ type: 'modified', data: data.data[0] });
          } else {
            this.setItemList({
              itemList: data.data,
              storageKey: this.cacheKeys.list,
            });
          }

          observer.next(data.data);
        },
        (error) => observer.error(error)
      )
    );
  }

  async listSubCollectionItems({
    collectionDocId,
    docId,
    subCollectionName,
    disableCache,
  }: {
    collectionDocId: string;
    docId: string;
    subCollectionName: string;
    disableCache?: boolean;
  }) {
    if (
      this.status[StoreKeys.listSubCollectionItems] === ProcessStatus.LOADING
    ) {
      return;
    }

    this.setStatus({
      key: StoreKeys.listSubCollectionItems,
      status: ProcessStatus.LOADING,
    });

    try {
      const cacheKey = this.cacheKeys.list + subCollectionName + docId;
      const cachedData = this.getCachedData(cacheKey, disableCache);

      if (cachedData) return cachedData;

      console.warn('Reading docs from server', 'LIST SUBCOLLECTION ITEMS');

      const result = await this.modelApi.getSubCollectionItems<T>({
        collectionDocId,
        subCollectionName,
      });

      this.setItemList({
        itemList: result as T[],
        storageKey: cacheKey,
        disableCache,
      });

      return result;
    } catch (error) {
      console.error('Error getting document:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.listSubCollectionItems,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  async listSubcollectionItems({
    collectionPath,
    parentCollection,
    subCollectionName,
    filters,
    disableCache,
  }: {
    collectionPath?: string;
    parentCollection?: boolean;
    subCollectionName: string;
    filters?: Filter[];
    disableCache?: boolean;
  }) {
    if (this.status[StoreKeys.FilterItems] === ProcessStatus.LOADING) {
      return this.filterResult;
    }

    try {
      if (!disableCache) {
        const cacheKey = JSON.stringify(
          this.collectionName + JSON.stringify(filters)
        );
        const cacheData = localStorage.getItem(cacheKey);
        if (cacheData) {
          this.setFilterResult({ filterResult: JSON.parse(cacheData) as T[] });
          return;
        }
      }

      console.warn('Reading docs from server', 'FILTER ITEMS', this.modelApi);
      const result = await this.modelApi.filterSubcollectionItems<T>({
        subCollectionName,
        collectionPath,
        parentCollection,
        filters,
      });
      this.setFilterResult({ filterResult: result as T[], disableCache });
      return result;
    } catch (error) {
      console.error('Error getting document:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.FilterItems,
        status: ProcessStatus.SUCCESS,
      });
    }
  }

  getSubCollectionItems = async ({
    collectionDocId,
    subCollectionName,
    disableCache,
  }: {
    collectionDocId: string;
    subCollectionName: string;
    disableCache?: boolean;
  }) => {
    const cacheKey = this.cacheKeys.list + subCollectionName + collectionDocId;

    if (this.ongoingRequests.has(cacheKey)) {
      return this.ongoingRequests.get(cacheKey) ?? null;
    }

    this.status[StoreKeys.getSubCollectionItems] === ProcessStatus.LOADING;

    this.setStatus({
      key: StoreKeys.getSubCollectionItems,
      status: ProcessStatus.LOADING,
    });

    const requestPromise: Promise<T | null | undefined> = (async () => {
      try {
        const cachedData = this.getCachedData(cacheKey, disableCache);

        if (cachedData) return cachedData;

        console.warn('Reading docs from server', 'GET SUBCOLLECTION ITEMS');

        const result = await this.modelApi.getSubCollectionItems<T>({
          collectionDocId,
          subCollectionName,
        });

        this.setItemList({
          itemList: result as T[],
          storageKey: cacheKey,
          disableCache,
        });

        return result[0] || null;
      } catch (error) {
        console.error('Error getting document:', error);
        this.setError({ error: error as string });
        throw error;
      } finally {
        this.setStatus({
          key: StoreKeys.getSubCollectionItems,
          status: ProcessStatus.SUCCESS,
        });
        this.ongoingRequests.delete(cacheKey);
      }
    })();

    this.ongoingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  };

  async getSubCollectionItem({
    parentId,
    subCollectionName,
    docId,
    disableCache,
  }: {
    parentId: string;
    subCollectionName: string;
    docId: string;
    disableCache?: boolean;
  }) {
    const cacheKey = this.cacheKeys.list + subCollectionName + docId;

    if (await this.ongoingRequests.get(cacheKey)) {
      return await this.ongoingRequests.get(cacheKey);
    }

    if (this.status[StoreKeys.getSubCollectionItem] === ProcessStatus.LOADING) {
      return await this.ongoingRequests.get(cacheKey);
    }

    this.setStatus({
      key: StoreKeys.getSubCollectionItem,
      status: ProcessStatus.LOADING,
    });

    this.ongoingRequests.set(
      cacheKey,
      (async () => {
        try {
          const cachedData = this.getCachedData(cacheKey, disableCache);

          if (cachedData) {
            this.ongoingRequests.delete(cacheKey);
            return cachedData;
          }

          console.warn('Reading docs from server', 'GET SUBCOLLECTION ITEMS');

          const result = await this.modelApi.getSubCollectionItem<T>({
            parentId,
            subCollectionName,
            docId,
          });

          if (result.error) {
            throw result.error;
          }

          this.setSelectedItem({
            item: result.data as T,
            cacheKey: cacheKey,
            disableCache,
          });

          return result.data;
        } catch (error) {
          console.error('Error getting document:', error);
          this.setError({ error: error as string });
          throw error;
        } finally {
          this.setStatus({
            key: StoreKeys.getSubCollectionItems,
            status: ProcessStatus.SUCCESS,
          });
          this.ongoingRequests.delete(cacheKey);
        }
      })()
    );

    return await this.ongoingRequests.get(cacheKey);
  }

  listenToSubcollectionChanges({
    collectionId,
    subcollectionName,
  }: {
    collectionId: string;
    subcollectionName: string;
  }) {
    const subcollectionChanges$ = this.modelApi.listenToSubCollectionChanges<T>(
      {
        collectionId,
        subcollectionName,
      }
    );

    return new Observable((observer) =>
      subcollectionChanges$.subscribe({
        next: (changes) => {
          changes.forEach((change) => {
            console.log(change);
            if (change.type === 'added') {
              this.setItemList({
                itemList: [...this.itemList, change.data as T],
                storageKey: this.cacheKeys.list,
              });
            } else if (change.type === 'removed') {
              this.setItemList({
                itemList: this.itemList.filter((item) => item.id !== change.id),
                storageKey: this.cacheKeys.list,
              });
            } else if (change.type === 'modified') {
              const itemList = [...this.itemList].map((item) =>
                item.id === change.id ? change.data : item
              );
              this.setItemList({
                itemList: [...itemList],
                storageKey: this.cacheKeys.list,
              });
            } else {
              console.info('No changes');
            }
          });

          observer.next(changes.map((change) => change.data));
        },
        error: (error) => observer.error(error),
      })
    );
  }

  deleteSubsubcollectionItem = async ({
    parentId,
    subCollectionName,
    docId,
  }: {
    parentId: string;
    subCollectionName: string;
    docId: string;
  }) => {
    if (
      this.status[StoreKeys.deleteSubCollectionItem] === ProcessStatus.LOADING
    ) {
      return;
    }

    this.setStatus({
      key: StoreKeys.deleteSubCollectionItem,
      status: ProcessStatus.LOADING,
    });

    try {
      const result = await this.modelApi.deleteSubsubcollectionItem({
        parentId,
        subCollectionName,
        docId,
      });

      this.setItemList({
        itemList: this.itemList.filter((item) => item.id !== docId),
        storageKey: this.cacheKeys.list,
      });

      return result;
    } catch (error) {
      console.error('Error deleting item:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.deleteSubCollectionItem,
        status: ProcessStatus.SUCCESS,
      });
    }
  };

  updateSubCollectionItem = async ({
    parentId,
    subCollectionName,
    docId,
    data,
  }: {
    parentId: string;
    subCollectionName: string;
    docId: string;
    data: Partial<T>;
  }) => {
    if (
      this.status[StoreKeys.updateSubCollectionItem] === ProcessStatus.LOADING
    ) {
      return;
    }

    this.setStatus({
      key: StoreKeys.updateSubCollectionItem,
      status: ProcessStatus.LOADING,
    });

    try {
      const result = await this.modelApi.updateSubCollectionItem({
        parentId,
        subCollectionName,
        docId,
        data,
      });

      const updatedItem = await this.modelApi.getSubCollectionItem<T>({
        parentId,
        subCollectionName,
        docId,
      });

      this.setItemList({
        itemList: this.itemList.map((item) =>
          item.id === docId ? { ...item, ...updatedItem.data } : item
        ),
        storageKey: this.cacheKeys.list,
      });

      return result;
    } catch (error) {
      console.error('Error updating item:', error);
      this.setError({ error: error as string });
      throw error;
    } finally {
      this.setStatus({
        key: StoreKeys.updateSubCollectionItem,
        status: ProcessStatus.SUCCESS,
      });
    }
  };

  setItemList({
    itemList,
    storageKey,
    disableCache,
  }: {
    itemList: T[];
    storageKey: string;
    disableCache?: boolean;
  }) {
    this.itemList = itemList;
    disableCache = disableCache || itemList.length === 0;

    if (!disableCache) {
      const cacheData = {
        timestamp: Date.now(),
        data: itemList,
      };
      localStorage.setItem(storageKey, JSON.stringify(cacheData));
    }
  }

  setSearchResult({ searchResult }: { searchResult: T[] }) {
    this.searchResult = searchResult;
  }

  setFilterResult({
    filterResult,
    disableCache,
  }: {
    filterResult: T[];
    disableCache?: boolean;
  }) {
    this.filterResult = filterResult;
    if (!disableCache)
      localStorage.setItem(
        this.cacheKeys.list + JSON.stringify(filterResult),
        JSON.stringify(filterResult)
      );
  }

  /**
   * Sets the selected item and optionally caches it in the local storage.
   * @param item - The item to be set as the selected item.
   * @param disableCache - Optional. If set to true, the item will not be cached in the local storage. Default is false.
   * @param cacheKey - Optional. The cache key to be used for storing the item in the local storage.
   * @param customIdForCacheKey - Optional. A custom ID to be appended to the cache key for storing the item in the local storage.
   */
  setSelectedItem({
    item,
    disableCache,
    cacheKey,
    customIdForCacheKey,
  }: {
    item: T;
    disableCache?: boolean;
    cacheKey?: string;
    customIdForCacheKey?: string;
  }) {
    this.selectedItem = item;
    if (item && !disableCache) {
      const finalCacheKey = customIdForCacheKey
        ? this.cacheKeys.item + customIdForCacheKey
        : this.cacheKeys.item + JSON.stringify(item.id);
      const cacheData = {
        timestamp: Date.now(),
        data: item,
      };
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } else {
        localStorage.setItem(finalCacheKey, JSON.stringify(cacheData));
      }
    }
  }

  clearItemList() {
    this.itemList = [];
    localStorage.removeItem(this.cacheKeys.list);
  }

  setStatus({ key, status }: { key: StoreKeys; status: ProcessStatus }) {
    this.status[key] = status;
  }

  setError({ error }: { error: string }) {
    this.error = error;
  }

  clearSearchResult() {
    this.searchResult = [];
  }

  clearFilterResult() {
    this.filterResult = [];
  }

  setNewItem({ item }: { item: T }) {
    this.newItem = item;
  }

  setChangeItemData({ type, data }: { type: string; data: T[] }) {
    this.changeItemData = { type, data: data[0] };
  }

  getCachedKey = (type: 'item' | 'list') => {
    return this.cacheKeys[type];
  };

  clearStore() {
    // reset all status  on a recursive loop
    Object.keys(this.status).forEach((key) => {
      this.setStatus({ key: key as StoreKeys, status: ProcessStatus.IDLE });
    });

    this.setItemList({ itemList: [], storageKey: this.cacheKeys.list });
    this.setSelectedItem({ item: null as any });
    this.setNewItem({ item: {} as T });
    this.setError({ error: '' });
    this.clearSearchResult();
    this.clearFilterResult();
    this.changeItemData = { type: '', data: {} as T };
    localStorage.clear();
  }
}

export default BaseStore;
