import { CompChildren } from '../types';
import React, { forwardRef } from 'react';

export type DraggableContainerItemProps = {} & CompChildren;

const DraggableContainerItem = forwardRef<
  HTMLElement,
  DraggableContainerItemProps
>(({ children }: DraggableContainerItemProps, ref) => {
  return <div>Hi, {children}</div>;
});

export default DraggableContainerItem;
