import React, { useEffect, useRef, useState } from 'react';
import DraggableContainerItem from './DraggableContainerItem';

import '../styles/draggable-container.css';

type ContainerItem = ReturnType<typeof DraggableContainerItem>;
type ContainerChildren = ContainerItem | ContainerItem[];
export type DraggableContainerProps = {
  children: ContainerChildren;
};

const DraggableContainer: React.FC<DraggableContainerProps> = ({
  children: _children,
}) => {
  const [children, setChildren] = useState<ContainerChildren>([]);
  const childRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    let childList = [];
    if (Array.isArray(_children)) {
      childList = _children;
    } else {
      childList = [_children];
    }
    childRefs.current = new Array(childList.length) as unknown as HTMLElement[];
    setChildren(
      childList.map((child, idx) => {
        const ref = (_ref: HTMLElement) => {
          childRefs.current[idx] = _ref;
          return _ref;
        };
        if (child) {
          return React.cloneElement(child, { ...child.props, ref });
        }
        return <></>;
      })
    );
  }, [_children]);

  return <div className={'draggable-container'}>{children}</div>;
};

DraggableContainer.displayName = 'DraggableContainer';

export default Object.assign(DraggableContainer, {
  Item: DraggableContainerItem,
});
