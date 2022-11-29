import React, { forwardRef, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { CompChildren } from './types/global';

import '../styles/draggable-item.css';

export interface ItemOffset {
  deltaX: number;
  deltaY: number;
}

export type DraggableContainerItemProps = {
  key?: string;
  className?: string;
  width?: number;
  height?: number;
  onDragging?: (offset: ItemOffset) => void;
} & CompChildren;

const DraggableContainerItem = forwardRef<
  HTMLDivElement,
  DraggableContainerItemProps
>(
  (
    {
      className: _className,
      height,
      width,
      onDragging,
      children,
    }: DraggableContainerItemProps,
    _ref
  ) => {
    const [longPressed, setLongPressed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const [selfOffset, setSelfOffset] = useState<ItemOffset>({
      deltaX: 0,
      deltaY: 0,
    });

    const style: React.CSSProperties = {
      width: width,
      height: height,
    };

    const className = classNames('draggable-item', _className, {
      'draggable-item--pressed': longPressed,
      'draggable-item--dragging': isDragging,
    });

    const longPressEventHandler = () => {
      let timeout: ReturnType<typeof setTimeout> | number = 0;

      const longPressHandler = () => {
        setLongPressed(true);
      };

      const mouseDownHandler = (e: MouseEvent) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          longPressHandler();
        }, 600);
        e.stopPropagation();
      };

      const mouseUpHandler = () => {
        clearTimeout(timeout);
        setIsDragging(false);
        setLongPressed(false);
      };

      return {
        mouseDownHandler,
        mouseUpHandler,
      };
    };

    useEffect(() => {
      document.addEventListener('mousemove', mouseMoveHandler);
      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
      };
    }, [longPressed, selfOffset, isDragging]);

    const mouseMoveHandler = (e: MouseEvent) => {
      if (longPressed && ref.current) {
        if (!isDragging) {
          setIsDragging(true);
        }
        const _selfOffset = {
          deltaX: selfOffset.deltaX + e.movementX,
          deltaY: selfOffset.deltaY + e.movementY,
        };
        setSelfOffset(_selfOffset);
        ref.current.style.top = `${_selfOffset.deltaY}px`;
        ref.current.style.left = `${_selfOffset.deltaX}px`;
        if (onDragging) {
          onDragging(_selfOffset);
        }
      }
      e.stopPropagation();
    };

    useEffect(() => {
      const { mouseDownHandler, mouseUpHandler } = longPressEventHandler();
      ref.current?.addEventListener('mousedown', mouseDownHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      return () => {
        ref.current?.removeEventListener('mousedown', mouseDownHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
    }, []);

    return (
      <div
        className={className}
        ref={(e) => {
          if (typeof _ref === 'function') {
            _ref(e);
          } else if (_ref) {
            _ref.current = e;
          }
          ref.current = e;
        }}
        style={style}
      >
        {children}
      </div>
    );
  }
);

DraggableContainerItem.displayName = 'DraggableContainerItem';

export default DraggableContainerItem;
