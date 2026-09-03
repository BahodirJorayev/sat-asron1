import React from 'react';
import { MinimalAITutorView } from './ai/MinimalAITutorView';
import { Question } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  userWrongAnswer?: string;
}

export const SocraticTutorDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  question,
  userWrongAnswer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dark Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Responsive Slide-over / Bottom Sheet Container */}
      <div className="absolute inset-x-0 bottom-0 top-12 md:top-0 md:left-auto md:right-0 md:inset-y-0 max-w-full flex">
        <div className="w-full md:w-screen md:max-w-lg bg-[#0A0F1D] rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-[#1E293B] shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-200 overflow-hidden">
          {/* Mobile Drag Pill */}
          <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-[#121A2F]">
            <div className="w-10 h-1 rounded-full bg-[#334155]" />
          </div>

          <MinimalAITutorView
            question={question}
            userWrongAnswer={userWrongAnswer}
            onClose={onClose}
            isSlideOver={true}
          />
        </div>
      </div>
    </div>
  );
};
