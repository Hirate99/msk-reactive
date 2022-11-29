import DraggableContainerItem from './DraggableContainerItem';
import React from 'react';
import { CompChildren } from '../types';

import '../styles/draggable-container.css';

export type DraggableContainerProps = {} & CompChildren;

function DraggableContainer({ children }: DraggableContainerProps) {
  return <div className={'draggable-container'}>{children}</div>;
}

DraggableContainer.Item = DraggableContainerItem;

export default DraggableContainer;
