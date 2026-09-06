'use client';

import React from 'react';
import { DesmosModal } from './tools/DesmosModal';
import { DesmosSatHack } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialExpression?: string;
  hacks?: DesmosSatHack[];
  customIconUrl?: string;
  isDarkMode?: boolean;
}

export const FloatingDesmosModal: React.FC<Props> = (props) => {
  return <DesmosModal {...props} />;
};

export default FloatingDesmosModal;
