import { forwardRef } from 'react';
import { CompChildren } from './types/global';

export type DraggableContainerItemProps = {} & CompChildren;

const DraggableContainerItem = forwardRef<
  HTMLDivElement,
  DraggableContainerItemProps
>(({ children }: DraggableContainerItemProps, ref) => {
  return <div ref={ref}>Hi, {children}</div>;
});

DraggableContainerItem.displayName = 'DraggableContainerItem';

export default DraggableContainerItem;
