import React from 'react';
import { CompChildren } from '../types';
import '../styles/draggable-container.css';
export type DraggableContainerProps = {} & CompChildren;
declare function DraggableContainer({
  children,
}: DraggableContainerProps): JSX.Element;
declare namespace DraggableContainer {
  var Item: React.ForwardRefExoticComponent<
    CompChildren & React.RefAttributes<HTMLElement>
  >;
}
export default DraggableContainer;
