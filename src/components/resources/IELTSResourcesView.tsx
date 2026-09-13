'use client';

import React from 'react';
import { ResourcesHubView } from './ResourcesHubView';
import { User } from '../../types';

interface IELTSResourcesViewProps {
  user?: User | null;
  onNavigateTab?: (tab: string) => void;
}

export const IELTSResourcesView: React.FC<IELTSResourcesViewProps> = (props) => {
  return <ResourcesHubView {...props} initialExamTag="IELTS" />;
};

export default IELTSResourcesView;
