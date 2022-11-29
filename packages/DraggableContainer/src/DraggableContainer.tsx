import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import DraggableContainerItem, { ItemOffset } from './DraggableContainerItem';

import '../styles/draggable-container.css';

type ContainerItem = ReturnType<typeof DraggableContainerItem>;
type ContainerChildren = ContainerItem | ContainerItem[];
export type DraggableContainerProps = {
  className?: string;
  itemWidth: number;
  itemHeight: number;
  children: ContainerChildren;
};

const DraggableContainer: React.FC<DraggableContainerProps> = ({
  className: _className,
  itemWidth,
  itemHeight,
  children: _children,
}) => {
  const [children, setChildren] = useState<ContainerItem[]>([]);
  const [childOffsets, setChildOffsets] = useState<ItemOffset[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const childRefs = useRef<HTMLElement[]>([]);
  const className = classNames('draggable-container', _className);

  useEffect(() => {
    if (ref.current) {
      let childList = [];
      if (Array.isArray(_children)) {
        childList = _children;
      } else {
        childList = [_children];
      }
      childRefs.current = new Array(
        childList.length
      ) as unknown as HTMLElement[];
      setChildOffsets(
        childList.map((_) => ({
          deltaX: 0,
          deltaY: 0,
        }))
      );
      setChildren(
        childList.map((child, idx) => {
          const ref = (_ref: HTMLElement) => {
            childRefs.current[idx] = _ref;
            return _ref;
          };
          if (child) {
            return React.cloneElement(child, {
              ...child.props,
              height: itemHeight,
              width: itemWidth,
              ref,
            });
          }
          return <></>;
        })
      );
    }
  }, [_children]);

  const onDragging = (idx: number) => (offset: ItemOffset) => {
    console.log(idx, offset);
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, idx) =>
        child ? (
          React.cloneElement(child, {
            ...child.props,
            onDragging: onDragging(idx),
          })
        ) : (
          <></>
        )
      )}
    </div>
  );
};

DraggableContainer.displayName = 'DraggableContainer';

export default Object.assign(DraggableContainer, {
  Item: DraggableContainerItem,
});
