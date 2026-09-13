'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExamProgram } from '../types';

interface ExamProgramContextType {
  examType: ExamProgram;
  setExamType: (type: ExamProgram) => void;
  toggleExamType: () => void;
  isSat: boolean;
  isIelts: boolean;
}

const STORAGE_KEY = 'asron_active_exam_program';

const ExamProgramContext = createContext<ExamProgramContextType | undefined>(undefined);

export const ExamProgramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [examType, setExamTypeState] = useState<ExamProgram>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'SAT' || saved === 'IELTS') {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return 'SAT';
  });

  const setExamType = (type: ExamProgram) => {
    setExamTypeState(type);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, type);
        window.dispatchEvent(new CustomEvent('asron_exam_program_changed', { detail: type }));
      } catch {
        // ignore
      }
    }
  };

  const toggleExamType = () => {
    const nextType: ExamProgram = examType === 'SAT' ? 'IELTS' : 'SAT';
    setExamType(nextType);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'SAT' || e.newValue === 'IELTS')) {
        setExamTypeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ExamProgramContext.Provider
      value={{
        examType,
        setExamType,
        toggleExamType,
        isSat: examType === 'SAT',
        isIelts: examType === 'IELTS',
      }}
    >
      {children}
    </ExamProgramContext.Provider>
  );
};

export const useExamProgram = (): ExamProgramContextType => {
  const context = useContext(ExamProgramContext);
  if (!context) {
    // Graceful fallback if outside provider
    return {
      examType: 'SAT',
      setExamType: () => {},
      toggleExamType: () => {},
      isSat: true,
      isIelts: false,
    };
  }
  return context;
};
