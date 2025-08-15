
import { useState, useCallback } from 'react';

interface HistoryState<T> {
  data: T;
  operationType: string;
}

export const useUndoRedo = <T,>(initialState: T) => {
    const [history, setHistory] = useState<HistoryState<T>[]>([{ data: initialState, operationType: 'initial' }]);
    const [pointer, setPointer] = useState(0);

    const state = history[pointer].data;
    const operationType = history[pointer].operationType;

    const setState = useCallback((newState: T, operationType: string, isInitialSet: boolean = false) => {
        if (isInitialSet) {
             setHistory([{ data: JSON.parse(JSON.stringify(newState)), operationType }]);
             setPointer(0);
             return;
        }

        // Deep compare to avoid saving state if nothing changed
        if (JSON.stringify(state) === JSON.stringify(newState)) return;

        const newHistory = history.slice(0, pointer + 1);
        const finalHistory = [...newHistory, { data: JSON.parse(JSON.stringify(newState)), operationType }];
        
        setHistory(finalHistory);
        setPointer(finalHistory.length - 1);
    }, [history, pointer, state]);

    const undo = useCallback((): HistoryState<T> => {
        const newPointer = Math.max(0, pointer - 1);
        setPointer(newPointer);
        return history[newPointer];
    }, [pointer, history]);

    const redo = useCallback((): HistoryState<T> => {
        const newPointer = Math.min(history.length - 1, pointer + 1);
        setPointer(newPointer);
        return history[newPointer];
    }, [pointer, history]);

    const canUndo = pointer > 0;
    const canRedo = pointer < history.length - 1;

    return { state, setState, undo, redo, canUndo, canRedo, saveState: setState, operationType };
};
