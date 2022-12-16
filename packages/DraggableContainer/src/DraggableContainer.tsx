import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import DraggableContainerItem, { ItemRegister } from './DraggableContainerItem';
import { getDraggableItemPos } from './utils';
import { ItemPosition } from './types/global';

import '../styles/draggable-container.css';

type ContainerItem = ReturnType<typeof DraggableContainerItem>;
type ContainerChildren = ContainerItem | ContainerItem[];

export interface DraggableContainerProps {
  className?: string;
  itemWidth: number;
  itemHeight: number;
  children: ContainerChildren;
}

const DraggableContainer: React.FC<DraggableContainerProps> = ({
  className: _className,
  itemWidth,
  itemHeight,
  children: _children,
}) => {
  const [children, setChildren] = useState<ContainerItem[]>([]);
  const [childRegisters, setChildRegisters] = useState<ItemRegister[]>([]);

  const [childPosition, setChildPosition] = useState<{
    [key: string | number]: ItemPosition | null;
  }>({});

  const [realChildPosition, setRealChildPosition] = useState<{
    [key: string | number]: ItemPosition;
  }>({});

  const [tempPosition, setTempPosition] = useState<ItemPosition>();

  const [inTransition, setInTransition] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const childRefs = useRef<HTMLElement[]>([]);
  const className = classNames('draggable-container', _className);

  const getItemPos = useCallback(
    (idx: number) => {
      if (childRefs.current && childRefs.current[idx]) {
        const { offsetLeft, offsetTop } = childRefs.current[idx];
        return getDraggableItemPos(
          offsetLeft,
          offsetTop,
          itemWidth,
          itemHeight
        );
      }
      return null;
    },
    [childRefs, itemHeight, itemWidth]
  );

  const getCollisionItemPos = useCallback(
    (idx: number) => {
      if (childRefs.current && childRefs.current[idx]) {
        const { offsetLeft, offsetTop } = childRefs.current[idx];
        const centerX = offsetLeft + itemWidth / 2;
        const centerY = offsetTop + itemHeight / 2;
        return getDraggableItemPos(centerX, centerY, itemWidth, itemHeight);
      }
      return null;
    },
    [childRefs, itemHeight, itemWidth]
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
      setChildRegisters(childList.map((_) => ({})));
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

  const getRealIndex = useCallback(
    (idx: number) => {
      if (ref.current && realChildPosition[idx]) {
        const colNums = Math.floor(ref.current.clientWidth / itemWidth);
        const pos = realChildPosition[idx];
        return pos.row * colNums + pos.col;
      }
      return null;
    },
    [ref, realChildPosition, itemWidth]
  );

  const getPositionByIndex = useCallback(
    (idx: number) => {
      if (ref.current) {
        const colNums = Math.floor(ref.current.clientWidth / itemWidth);
        const row = Math.floor(idx / colNums);
        const col = idx % colNums;
        return {
          col,
          row,
        } as ItemPosition;
      }
      return null;
    },
    [ref, itemWidth]
  );

  const checkPosition = async (movingIdx: number) => {
    const currentPos = getCollisionItemPos(movingIdx);
    if (ref.current && currentPos && tempPosition && realChildPosition) {
      const colNums = Math.floor(ref.current.clientWidth / itemWidth);
      const rowNums = Math.ceil(children.length / colNums);
      const posInRect = {
        col: Math.max(Math.min(colNums - 1, currentPos.col), 0),
        row: Math.max(Math.min(rowNums - 1, currentPos.row), 0),
      };
      if (
        (posInRect.col !== tempPosition.col ||
          posInRect.row !== tempPosition.row) &&
        !inTransition
      ) {
        const prevIndex = tempPosition.row * colNums + tempPosition.col;
        const toIndex = posInRect.row * colNums + posInRect.col;
        setInTransition(true);
        const moves: Promise<ItemPosition | null>[] = [];
        Object.keys(realChildPosition).forEach((key) => {
          const idx = parseInt(key);
          if (idx === movingIdx) {
            return;
          }
          const realIdx = getRealIndex(idx);
          const moveTo = childRegisters[idx].moveTo;
          if (
            realIdx !== null &&
            ((toIndex > prevIndex &&
              realIdx > prevIndex &&
              realIdx <= toIndex) ||
              (toIndex < prevIndex &&
                realIdx < prevIndex &&
                realIdx >= toIndex))
          ) {
            const itemToIdx = toIndex > prevIndex ? realIdx - 1 : realIdx + 1;
            const pos = getPositionByIndex(itemToIdx);
            if (pos && typeof moveTo === 'function') {
              moves.push(moveTo(pos.col, pos.row, 0.3));
            }
          }
        });
        try {
          await Promise.all(moves);
          setTempPosition(posInRect as ItemPosition);
          setInTransition(false);
        } catch (e) {
          console.error(e);
          setInTransition(false);
        }
      }
    }
  };

  const onDragging = useCallback(
    (idx: number) => () => {
      checkPosition(idx);
    },
    [checkPosition]
  );

  const onItemLoad = useCallback(
    (idx: number) => {
      const pos = getItemPos(idx);
      setChildPosition((prev) => ({
        ...prev,
        [idx]: pos,
      }));
      if (pos) {
        setRealChildPosition((prev) => ({
          ...prev,
          [idx]: pos,
        }));
      }
    },
    [childPosition, realChildPosition, getItemPos]
  );

  const syncItemPos = useCallback((pos: ItemPosition, idx: number) => {
    setRealChildPosition((prev) => ({
      ...prev,
      [idx]: pos,
    }));
  }, []);

  const startPressing = useCallback(
    (idx: number) => {
      setTempPosition(realChildPosition[idx]);
    },
    [realChildPosition]
  );

  const moveToTarget = (idx: number) => {
    const moveTo = childRegisters[idx].moveTo;
    if (tempPosition && moveTo) {
      moveTo(tempPosition.col, tempPosition.row, 0.3);
    }
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, idx) =>
        child ? (
          React.cloneElement(child, {
            ...child.props,
            register: childRegisters[idx],
            position: childPosition[idx],
            onDraggingStart: () => {
              startPressing(idx);
            },
            onDragging: onDragging(idx),
            onLoaded: () => {
              onItemLoad(idx);
            },
            onMoveEnd: (pos: ItemPosition) => {
              syncItemPos(pos, idx);
            },
            onMouseUp: () => {
              console.log('up!');
              moveToTarget(idx);
            },
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
