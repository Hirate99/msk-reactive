import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import DraggableContainerItem, {
  ItemOffset,
  ItemRegister,
} from './DraggableContainerItem';

import '../styles/draggable-container.css';

type ContainerItem = ReturnType<typeof DraggableContainerItem>;
type ContainerChildren = ContainerItem | ContainerItem[];
export type DraggableContainerProps = {
  className?: string;
  itemWidth: number;
  itemHeight: number;
  children: ContainerChildren;
};

interface ItemPosition {
  row: number;
  col: number;
}

const getPosX = (pos: ItemPosition, width: number) => {
  return pos.col * width;
};

const getPosY = (pos: ItemPosition, height: number) => {
  return pos.row * height;
};

const DraggableContainer: React.FC<DraggableContainerProps> = ({
  className: _className,
  itemWidth,
  itemHeight,
  children: _children,
}) => {
  const [children, setChildren] = useState<ContainerItem[]>([]);
  const [childOffsets, setChildOffsets] = useState<ItemOffset[]>([]);
  const [childRegisters, setChildRedisters] = useState<ItemRegister[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const childRefs = useRef<HTMLElement[]>([]);
  const className = classNames('draggable-container', _className);

  const getItemPos = useCallback(
    (idx: number) => {
      if (childRefs.current) {
        const childRef = childRefs.current[idx];
        const x = childRef.offsetLeft;
        const { offsetLeft, offsetTop } = childRef;
        return {
          row: Math.floor(offsetTop / itemHeight),
          col: Math.floor(offsetLeft / itemWidth),
        } as ItemPosition;
      }
      return null;
    },
    [ref, itemHeight, itemWidth]
  );

  const toX = useCallback(
    (pos: ItemPosition) => {
      return getPosX(pos, itemWidth);
    },
    [itemWidth]
  );

  const toY = useCallback(
    (pos: ItemPosition) => {
      return getPosY(pos, itemHeight);
    },
    [itemHeight]
  );

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
      setChildRedisters(childList.map((_) => ({})));
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
    console.log(idx, offset.deltaX, offset.deltaY);
    // console.log(childRefs.current[idx]?.move)
    console.log(getItemPos(idx));
    console.log(childRegisters[idx]);
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, idx) =>
        child ? (
          React.cloneElement(child, {
            ...child.props,
            register: childRegisters[idx],
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
