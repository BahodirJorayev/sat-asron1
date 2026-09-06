'use client';

import React, { useState, useEffect } from 'react';
import { DesmosSatHack, GlobalPlatformSettings } from '../../types';
import { FloatingDesmosBubble } from './FloatingDesmosBubble';
import { DesmosModal } from './DesmosModal';
import { INITIAL_SAT_DESMOS_HACKS } from '../../data/desmosHacksData';

export interface DesmosWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialExpression?: string;
  hacks?: DesmosSatHack[];
  globalSettings?: GlobalPlatformSettings;
  customIconUrl?: string;
  isDarkMode?: boolean;
  showBubble?: boolean;
}

const STORAGE_KEY_OPEN = 'asron_sat_desmos_open';

export const DesmosWidget: React.FC<DesmosWidgetProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  initialExpression,
  hacks = INITIAL_SAT_DESMOS_HACKS,
  globalSettings,
  customIconUrl: propIconUrl,
  isDarkMode,
  showBubble = true,
}) => {
  const isEnabled = globalSettings?.desmosEnabled ?? true;
  const customIconUrl = propIconUrl || globalSettings?.desmosIconUrl;

  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OPEN);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (isControlled) {
      if (isOpen) {
        controlledOnClose?.();
      }
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!isControlled) {
      try {
        localStorage.setItem(STORAGE_KEY_OPEN, JSON.stringify(internalIsOpen));
      } catch {}
    }
  }, [internalIsOpen, isControlled]);

  if (!isEnabled) return null;

  return (
    <>
      {showBubble && !isControlled && (
        <FloatingDesmosBubble
          isOpen={isOpen}
          onToggle={handleToggle}
          customIconUrl={customIconUrl}
        />
      )}

      <DesmosModal
        isOpen={isOpen}
        onClose={handleClose}
        initialExpression={initialExpression}
        hacks={hacks}
        customIconUrl={customIconUrl}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

export default DesmosWidget;
