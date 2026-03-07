import { useState, useEffect, useCallback } from "react";
import { fakeDB, firestoreDB } from "../services";

export function useTransactions(user) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDemo = !user || user.isDemo;

  useEffect(() => {
    if (!user) { setTransactions([]); setLoading(false); return; }
    setLoading(true);
    setError(null);

    const fetch = isDemo
      ? fakeDB.getTransactions()
      : firestoreDB.getTransactions(user.uid);

    fetch
      .then(txs => {
        setTransactions(txs.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [user, isDemo]);

  const addTransaction = useCallback(async (tx) => {
    // Optimistic update: show in UI immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticTx = { ...tx, id: tempId };
    setTransactions(prev => [optimisticTx, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

    // Fire the DB write in background — don't block the caller
    const writePromise = isDemo
      ? fakeDB.addTransaction(tx)
      : firestoreDB.addTransaction(user.uid, tx);

    writePromise
      .then(newTx => {
        setTransactions(prev => prev.map(t => t.id === tempId ? newTx : t));
      })
      .catch(err => {
        console.error("Failed to save transaction:", err);
        setTransactions(prev => prev.filter(t => t.id !== tempId));
      });

    return optimisticTx;
  }, [user, isDemo]);

  const deleteTransaction = useCallback(async (id) => {
    // Optimistic update: remove from UI immediately
    const snapshot = [...transactions];
    setTransactions(prev => prev.filter(t => t.id !== id));

    // Fire the DB delete in background
    const deletePromise = isDemo
      ? fakeDB.deleteTransaction(id)
      : firestoreDB.deleteTransaction(user.uid, id);

    deletePromise.catch(err => {
      console.error("Failed to delete transaction:", err);
      setTransactions(snapshot);
    });
  }, [user, isDemo, transactions]);

  return { transactions, loading, error, addTransaction, deleteTransaction };
}
