import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import {
  collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db, isConfigured } from "./firebase";

const DEMO_TRANSACTIONS = [
  { id: "1", amount: 85000, category: "salary", date: "2025-06-01", note: "Monthly salary", type: "income" },
  { id: "2", amount: 4500, category: "food", date: "2025-06-03", note: "Weekly groceries", type: "expense" },
  { id: "3", amount: 1500, category: "transport", date: "2025-06-05", note: "Uber rides", type: "expense" },
  { id: "4", amount: 25000, category: "freelance", date: "2025-06-07", note: "Design project", type: "income" },
  { id: "5", amount: 7500, category: "shopping", date: "2025-06-09", note: "New shoes + shirt", type: "expense" },
  { id: "6", amount: 999, category: "utilities", date: "2025-06-10", note: "Internet bill", type: "expense" },
  { id: "7", amount: 2500, category: "health", date: "2025-06-12", note: "Gym membership", type: "expense" },
  { id: "8", amount: 3500, category: "entertainment", date: "2025-06-14", note: "Concert tickets", type: "expense" },
  { id: "9", amount: 10000, category: "investment", date: "2025-06-15", note: "SIP contribution", type: "expense" },
  { id: "10", amount: 1200, category: "food", date: "2025-06-16", note: "Team lunch", type: "expense" },
  { id: "11", amount: 85000, category: "salary", date: "2025-07-01", note: "Monthly salary", type: "income" },
  { id: "12", amount: 3800, category: "food", date: "2025-07-02", note: "Weekly groceries", type: "expense" },
  { id: "13", amount: 2200, category: "transport", date: "2025-07-04", note: "Monthly metro pass", type: "expense" },
  { id: "14", amount: 15000, category: "freelance", date: "2025-07-06", note: "Logo design", type: "income" },
  { id: "15", amount: 5500, category: "shopping", date: "2025-07-08", note: "Books & supplies", type: "expense" },
  { id: "16", amount: 1500, category: "entertainment", date: "2025-07-10", note: "Streaming subs", type: "expense" },
  { id: "17", amount: 8000, category: "investment", date: "2025-07-12", note: "Stock purchase", type: "expense" },
  { id: "18", amount: 85000, category: "salary", date: "2025-08-01", note: "Monthly salary", type: "income" },
  { id: "19", amount: 4200, category: "food", date: "2025-08-03", note: "Groceries", type: "expense" },
  { id: "20", amount: 1800, category: "transport", date: "2025-08-05", note: "Fuel", type: "expense" },
];

let txStore = [...DEMO_TRANSACTIONS];
let nextId = 21;

export const fakeDB = {
  getTransactions: () => new Promise(r => setTimeout(() => r([...txStore]), 600)),
  addTransaction: (tx) => new Promise(r => setTimeout(() => {
    const newTx = { ...tx, id: String(nextId++) };
    txStore = [newTx, ...txStore];
    r(newTx);
  }, 400)),
  deleteTransaction: (id) => new Promise(r => setTimeout(() => {
    txStore = txStore.filter(t => t.id !== id);
    r(id);
  }, 300)),
};

// Firestore-backed database for real authenticated users
export const firestoreDB = {
  getTransactions: async (uid) => {
    const ref = collection(db, "users", uid, "transactions");
    const q = query(ref, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  addTransaction: async (uid, tx) => {
    const ref = collection(db, "users", uid, "transactions");
    const docRef = await addDoc(ref, { ...tx, createdAt: serverTimestamp() });
    return { ...tx, id: docRef.id };
  },
  deleteTransaction: async (uid, id) => {
    await deleteDoc(doc(db, "users", uid, "transactions", id));
    return id;
  },
};

export const pennyAuth = {
  signInGoogle: async () => {
    if (isConfigured && auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        createdAt: result.user.metadata.creationTime,
        isDemo: false,
      };
    }
    throw new Error("Firebase is not configured. Please add your Firebase credentials to .env");
  },

  signInDemo: () => {
    const user = {
      uid: "demo-user",
      email: "demo@penny.app",
      displayName: "Demo User",
      photoURL: null,
      isDemo: true,
    };
    sessionStorage.setItem("penny_demo_user", JSON.stringify(user));
    return user;
  },

  signOut: async () => {
    sessionStorage.removeItem("penny_demo_user");
    if (isConfigured && auth) await firebaseSignOut(auth);
  },
};
