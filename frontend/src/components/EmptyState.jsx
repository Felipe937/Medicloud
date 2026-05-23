import { FileSearch } from 'lucide-react';
import React from 'react';

const EmptyState = ({ title, message, icon: Icon = FileSearch }) => (
  <div className="empty-state">
    <Icon size={42} />
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

export default EmptyState;
