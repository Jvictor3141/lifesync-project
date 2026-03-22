import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAgendaDateKey, isFinanceMonthKey } from '@/shared/lib/security';

const noop = () => {};

const userCollection = (uid, collectionName) => collection(db, 'users', uid, collectionName);
const userDocument = (uid, collectionName, documentId) => doc(db, 'users', uid, collectionName, documentId);
const invalidPathError = (label) => new Error(`Chave invalida para ${label}.`);

export const createUserDataRepository = (uid) => {
  const isReady = Boolean(uid);

  return {
    isReady,
    watchAgenda(onData, onError = noop) {
      if (!uid) {
        return noop;
      }

      return onSnapshot(userCollection(uid, 'agendas'), onData, onError);
    },
    saveAgendaDay(dateKey, payload) {
      if (!uid) {
        return Promise.resolve();
      }

      if (!isAgendaDateKey(dateKey)) {
        return Promise.reject(invalidPathError('agenda'));
      }

      return setDoc(userDocument(uid, 'agendas', dateKey), payload);
    },
    watchFinanceMonth(monthKey, onData, onError = noop) {
      if (!uid || !isFinanceMonthKey(monthKey)) {
        return noop;
      }

      return onSnapshot(userDocument(uid, 'financas', monthKey), onData, onError);
    },
    saveFinanceMonth(monthKey, payload) {
      if (!uid) {
        return Promise.resolve();
      }

      if (!isFinanceMonthKey(monthKey)) {
        return Promise.reject(invalidPathError('mes financeiro'));
      }

      return setDoc(userDocument(uid, 'financas', monthKey), payload);
    },
    deleteFinanceMonth(monthKey) {
      if (!uid) {
        return Promise.resolve();
      }

      if (!isFinanceMonthKey(monthKey)) {
        return Promise.reject(invalidPathError('mes financeiro'));
      }

      return deleteDoc(userDocument(uid, 'financas', monthKey));
    },
    async listFinanceMonths() {
      if (!uid) {
        return [];
      }

      const snapshot = await getDocs(userCollection(uid, 'financas'));
      const months = [];

      snapshot.forEach((documentSnapshot) => {
        if (!isFinanceMonthKey(documentSnapshot.id)) {
          return;
        }

        const data = documentSnapshot.data() || {};
        const totalItems = (data.entradas?.length || 0) + (data.gastos?.length || 0);

        if (totalItems > 0) {
          months.push(documentSnapshot.id);
        }
      });

      return months.sort((left, right) => (left > right ? -1 : 1));
    },
    async getFinanceMonth(monthKey) {
      if (!uid || !isFinanceMonthKey(monthKey)) {
        return null;
      }

      const snapshot = await getDoc(userDocument(uid, 'financas', monthKey));
      return snapshot.exists() ? snapshot.data() : null;
    },
    watchSpecialDates(onData, onError = noop) {
      if (!uid) {
        return noop;
      }

      return onSnapshot(userDocument(uid, 'datasEspeciais', 'lista'), onData, onError);
    },
    saveSpecialDates(specialDates) {
      if (!uid) {
        return Promise.resolve();
      }

      return setDoc(userDocument(uid, 'datasEspeciais', 'lista'), {
        datas: specialDates,
      });
    },
  };
};
