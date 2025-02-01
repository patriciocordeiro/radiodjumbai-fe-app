import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  DocumentChangeType,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  Query,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where
} from 'firebase/firestore';

import { FirebaseError } from 'firebase/app';
import { Observable } from 'rxjs';
import firebaseApp from './firebase.config';

const db = getFirestore(firebaseApp);

export interface Result<T> {
  data: T | null;
  error: FirebaseError | null;
}
interface FilterParams {
  collectionName: string;
  docId: string;
  subCollectionName: string;
  field: string;
  value: string | number | boolean;
}

interface FilteredItem {
  id: string;
  [key: string]: any;
}
export interface Filter {
  field: string;
  operator: '==' | '<' | '<=' | '>' | '>=' | 'array-contains';
  value: any;
}

interface SubCollectionParams {
  collectionDocId: string;
  subCollectionName: string;
}

interface SubCollectionItem {
  id: string;
  [key: string]: any;
}

interface SubCollectionItemParams {
  parentId: string;
  subCollectionName: string;
  docId: string;
}

export interface ListParams {
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Filter[];
}
class FirestoreService<T> {
  collection: string;
  lastDoc: any = null; // To store the last document from the previous page

  constructor(collection: string) {
    this.collection = collection;
  }

  async getItem(documentId: string): Promise<Result<T>> {
    try {
      const documentRef = doc(db, this.collection, documentId);
      const documentSnap = await getDoc(documentRef);
      if (documentSnap.exists()) {
        return {
          data: { ...documentSnap.data() as T, id: documentSnap.id },
          error: null
        } as Result<T>;
      } else {
        return {
          data: null,
          error: { code: 'not-found', message: 'Document not found' }
        } as Result<T>;
      }
    } catch (error: any) {
      console.error('Error getting document:', error);

      return {
        data: null,
        error: error as FirebaseError
      };
    }
  }

  // create an interface  for list

  async list<T>({
    pageSize,
    sortField,
    sortOrder,
    filters,
  }: ListParams): Promise<Result<Array<T>>> {
    try {
      let queryArgs: any[] = [];

      if (sortField && sortOrder) {
        queryArgs.push(orderBy(sortField, sortOrder));
      }

      if (filters) {
        for (const filter of filters) {
          queryArgs.push(where(filter.field, filter.operator, filter.value));
        }
      }

      if (pageSize) {
        queryArgs.push(limit(pageSize));
      }

      if (pageSize && this.lastDoc) {
        queryArgs.push(startAfter(this.lastDoc));
      }

      const collectionRef = collection(db, this.collection);
      const listQuery = query(collectionRef, ...(queryArgs as [any])); // Type casting

      const snapshot = await getDocs(listQuery);
      this.lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        data: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as T[],
        error: null
      } as Result<T[]>;
    } catch (error) {
      console.error('Error listing documents:', error);
      return {
        data: [],
        error: error as FirebaseError
      };
    }
  }

  async getSubCollectionItems<T>({
    collectionDocId,
    subCollectionName,
  }: SubCollectionParams): Promise<T[]> {
    try {
      const subCollectionRef = collection(
        db,
        this.collection,
        collectionDocId,
        subCollectionName
      );
      const querySnapshot = await getDocs(subCollectionRef);

      const results: SubCollectionItem[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ ...doc.data(), id: doc.id });
      });

      return results as T[];
    } catch (error) {
      console.error('Error getting subcollection items: ', error);
      throw error;
    }
  }

  async listSubCollectionItems(collectionId: string, subcollectionName: string) {
    try {
      const subcollectionRef = collection(
        db,
        this.collection,
        collectionId,
        subcollectionName
      );
      const querySnapshot = await getDocs(subcollectionRef);

      const data = querySnapshot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
      }));
      return data;
    } catch (error) {
      console.error('Error fetching subcollection data:', error);
      return [];
    }
  }

  getSubCollectionItem<T>({
    parentId,
    subCollectionName,
    docId,
  }: SubCollectionItemParams): Promise<Result<T>> {
    return new Promise(async (resolve, reject) => {
      try {
        const documentRef = doc(
          db,
          this.collection,
          parentId,
          subCollectionName,
          docId
        );
        const documentSnap = await getDoc(documentRef);
        if (documentSnap.exists()) {
          resolve({
            data: { ...documentSnap.data() as T, id: documentSnap.id },
            error: null
          } as Result<T>);
        } else {
          resolve({
            data: null,
            error: { code: 'not-found', message: 'Document not found' }
          } as Result<T>);
        }
      } catch (error: any) {
        console.error('Error getting subcollection item:', error);
        reject({
          data: null,
          error: error as FirebaseError
        });
      }
    });
  }

  listenToSubCollectionChanges<T>({ collectionId, subcollectionName }: { collectionId: string; subcollectionName: string; }): Observable<{
    data: T;
    id: string;
    type: DocumentChangeType;
  }[]> {
    return new Observable((subscriber) => {
      try {
        const subcollectionRef = collection(
          db,
          this.collection,
          collectionId,
          subcollectionName
        );

        const unsubscribe = onSnapshot(subcollectionRef, (querySnapshot) => {
          const changes = querySnapshot.docChanges().map((change) => {
            const data = {
              data: { ...change.doc.data() as T, id: change.doc.id },
              id: change.doc.id,
              type: change.type,
            };
            return data;
          });
          subscriber.next(changes);
        }, (error) => {
          console.error('Error listening to subcollection changes:', error);
          subscriber.error(error);
        });

        // Return the unsubscribe function when the Observable is disposed
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up listener for subcollection:', error);
        subscriber.error(error);
      }
    });
  }

  // async filterSubcollectionItems({
  //   collectionName,
  //   docId,
  //   subCollectionName,
  //   field,
  //   value,
  // }: FilterParams): Promise<FilteredItem[]> {
  //   try {
  //     const collectionRef = collection(
  //       db,
  //       collectionName,
  //       docId,
  //       subCollectionName
  //     );
  //     const q = query(collectionRef, where(field, '==', value));
  //     const querySnapshot = await getDocs(q);

  //     const results: FilteredItem[] = [];
  //     querySnapshot.forEach((doc) => {
  //       results.push({ ...doc.data(), id: doc.id });
  //     });

  //     return results;
  //   } catch (error) {
  //     console.error('Error filtering subcollection items: ', error);
  //     throw error;
  //   }
  // }

  async filterSubcollectionItems<T>({
    collectionPath,
    subCollectionName,
    filters = [],
    parentCollection = false

  }: {
    collectionPath?: string; //Optional now. Required only if parentCollection is true
    subCollectionName: string;
    filters?: Filter[];
    parentCollection?: boolean;
  }): Promise<FilteredItem[]> {

    try {
      let q: Query;

      if (parentCollection) {
        if (!collectionPath) {
          throw new Error("collectionPath is required when parentCollection is true.");
        }
        const subCollectionRef = collection(db, collectionPath, subCollectionName);
        q = query(subCollectionRef);
      } else {
        const subCollectionGroup = collectionGroup(db, subCollectionName);
        q = query(subCollectionGroup);
      }

      if (filters.length !== 0) {
        filters.forEach((filter) => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }

      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        if (!parentCollection) {
          return { ...data, id: doc.id, parentDocId: doc.ref.parent.parent?.id };
        } else {
          return { ...data, id: doc.id };
        }
      });

      return results;

    } catch (error) {
      console.error("Error getting subcollection items:", error);
      throw error;
    }
  }

  deleteSubsubcollectionItem({
    parentId,
    subCollectionName,
    docId,
  }: SubCollectionItemParams): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const documentRef = doc(
          db,
          this.collection,
          parentId,
          subCollectionName,
          docId
        );
        await deleteDoc(documentRef);
        resolve(true);
      } catch (error) {
        console.error("Error deleting subcollection item:", error);
        reject(false);
      }
    });
  }

  updateSubCollectionItem({
    parentId,
    subCollectionName,
    docId,
    data,
  }: SubCollectionItemParams & { data: Partial<T>; }): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const documentRef = doc(
          db,
          this.collection,
          parentId,
          subCollectionName,
          docId
        );
        await updateDoc(documentRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        resolve(true);
      } catch (error) {
        console.error("Error updating subcollection item:", error);
        reject(false);
      }
    });
  }


  async create(data: T): Promise<string | null> {
    try {
      const collectionRef = collection(db, this.collection);
      const documentRef = await addDoc(collectionRef, {
        ...data as any,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }); // Type assertion
      return documentRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      return null;
    }
  }

  async createWithCustomId({ data, documentId }: { data: T; documentId: string; }): Promise<string | null> {
    try {

      console.log('data', data, documentId);
      const documentRef = doc(db, this.collection, documentId);
      await setDoc(documentRef, {
        ...data as any,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return documentRef.id;

    } catch (error) {
      console.error('Error adding document:', error);
      return null;
    }
  }

  async update(documentId: string, data: Partial<T>): Promise<boolean> {
    try {

      const documentRef = doc(db, this.collection, documentId);
      await updateDoc(documentRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }

  async delete(documentId: string): Promise<boolean> {
    try {
      const documentRef = doc(db, this.collection, documentId);
      await deleteDoc(documentRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  };

  /** Subscriptions methods */

  onDocChange<T>(filter?: Filter): Observable<{
    data: T[], eventType: string;
  }> {
    const collectionRef = collection(db, this.collection);

    let q = query(collectionRef);

    if (filter) {
      q = query(collectionRef, where(filter.field, filter.operator, filter.value));
    }

    return new Observable((subscriber) => {
      try {
        onSnapshot(q, (snapshot) => {
          let eventType = '';
          const data = snapshot.docChanges()
            // .filter((change) => change.type === 'added')
            .map((change) => {
              eventType = change.type;
              return { ...change.doc.data(), id: change.doc.id } as T;
            });

          subscriber.next(
            {
              data: data,
              eventType: eventType
            }
          );
        });
      } catch (error) {
        subscriber.error(error);
      }
    });
  };





  onUpdate(callback: (data: T) => void): () => void {
    const collectionRef = collection(db, this.collection);
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          callback(change.doc.data() as T);
        }
      });
    });

    return unsubscribe;
  };

  onDelete(callback: (data: T) => void): () => void {
    const collectionRef = collection(db, this.collection);
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          callback(change.doc.data() as T);
        }
      });
    });

    return unsubscribe;
  }
}

export default FirestoreService;
