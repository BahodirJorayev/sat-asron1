'use client';

import React from 'react';
import { DesmosWidget } from './tools/DesmosWidget';
import { DesmosSatHack, GlobalPlatformSettings } from '../types';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  initialExpression?: string;
  hacks?: DesmosSatHack[];
  globalSettings?: GlobalPlatformSettings;
  isDarkMode?: boolean;
  showBubble?: boolean;
}

export const FloatingDesmosWidget: React.FC<Props> = (props) => {
  return <DesmosWidget {...props} />;
};

export default FloatingDesmosWidget;
