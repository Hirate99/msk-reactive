import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import classNames from 'classnames';
import { CompChildren, ItemPosition, MoveTo } from './types/global';

import '../styles/draggable-item.css';

export interface ItemOffset {
  deltaX: number;
  deltaY: number;
}

export interface ItemRegister {
  moveTo?: MoveTo;
}

export interface DraggableContainerItemProps extends CompChildren {
  key?: string;
  className?: string;
  width?: number;
  height?: number;
  register?: ItemRegister;
  position?: ItemPosition;
  onDraggingStart?: () => void;
  onDragging?: (offset: ItemOffset) => void;
  onLoaded?: () => void;
  onMoveEnd?: (pos: ItemPosition) => void;
  onMouseUp?: () => void;
}

const defaultTransition = '0.3s ease-in-out';

const DraggableContainerItem = forwardRef<
  HTMLDivElement,
  DraggableContainerItemProps
>(
  (
    {
      className: _className,
      height,
      width,
      children,
      register,
      position,
      onDraggingStart,
      onLoaded,
      onDragging,
      onMoveEnd,
      onMouseUp,
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
    const [transformStyle, setTransformStyle] = useState<CSSProperties>({
      transition: defaultTransition,
    });
    const [loaded, setLoaded] = useState(false);
    const [realPosition, setRealPosition] = useState<ItemPosition | null>(null);

    useEffect(() => {
      if (position) {
        setRealPosition(position);
      }
    }, [position]);

    useEffect(() => {
      if (ref.current && !loaded) {
        setLoaded(true);
        if (typeof onLoaded === 'function') {
          onLoaded();
        }
      }
    }, [ref]);

    const style: React.CSSProperties = {
      width: width,
      height: height,
    };

    const itemClassName = useMemo(
      () =>
        classNames('draggable-item', {
          'draggable-item--pressed': longPressed,
        }),
      [longPressed]
    );

    const contentClassName = useMemo(
      () =>
        classNames('draggable-item__content', _className, {
          'draggable-item__content--pressed': longPressed,
          'draggable-item__content--dragging': isDragging,
        }),
      [longPressed, isDragging]
    );

    useEffect(() => {
      if (
        isDragging &&
        (transformStyle.transition || transformStyle.transition !== 'none')
      ) {
        setTransformStyle({
          ...transformStyle,
          transition: 'none',
        });
      } else if (
        !isDragging &&
        (!transformStyle.transition || transformStyle.transition === 'none')
      ) {
        setTransformStyle({
          ...transformStyle,
          transition: defaultTransition,
        });
      }
    }, [isDragging]);

    const moveTo = useCallback<MoveTo>(
      (col: number, row: number, duration?: number) => {
        return new Promise((resolve, reject) => {
          const _duration = duration ?? 0.3;
          if (!position) {
            reject('position is null');
          }
          if (
            position &&
            (!realPosition ||
              (realPosition &&
                (realPosition.col !== col || realPosition.row !== row)))
          ) {
            const transformX = (col - position.col) * 100;
            const transformY = (row - position.row) * 100;
            setTransformStyle({
              ...transformStyle,
              transform: `translate(${transformX}%, ${transformY}%)`,
              transition: `${_duration}s ease-in-out`,
            });
            dragTo(0, 0);

            const toPos: ItemPosition = {
              col,
              row,
            };

            setRealPosition(toPos);
            setTimeout(() => {
              if (typeof onMoveEnd === 'function') {
                onMoveEnd(toPos);
              }
              resolve(toPos);
            }, _duration * 1000);

            return;
          }

          resolve(null);
        });
      },
      [position, transformStyle, onMoveEnd]
    );

    const dragTo = useCallback(
      (top: number, left: number) => {
        if (ref.current) {
          ref.current.style.top = `${top}px`;
          ref.current.style.left = `${left}px`;
        }
      },
      [ref]
    );

    useEffect(() => {
      if (register) {
        register.moveTo = moveTo;
      }
    }, [register, moveTo]);

    const longPressEventHandler = useCallback(() => {
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
        if (typeof onMouseUp === 'function') {
          onMouseUp();
        }
      };

      return {
        mouseDownHandler,
        mouseUpHandler,
      };
    }, [onMouseUp]);

    const mouseMoveHandler = (e: MouseEvent) => {
      if (longPressed && ref.current) {
        if (!isDragging) {
          setIsDragging(true);
          if (typeof onDraggingStart === 'function') {
            onDraggingStart();
          }
        }
        const _selfOffset = {
          deltaX: selfOffset.deltaX + e.movementX,
          deltaY: selfOffset.deltaY + e.movementY,
        };
        setSelfOffset(_selfOffset);
        dragTo(_selfOffset.deltaY, _selfOffset.deltaX);
        if (onDragging) {
          onDragging(_selfOffset);
        }
      }
      e.stopPropagation();
    };

    useEffect(() => {
      document.addEventListener('mousemove', mouseMoveHandler);
      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
      };
    }, [longPressed, selfOffset, isDragging]);

    useEffect(() => {
      const { mouseDownHandler, mouseUpHandler } = longPressEventHandler();
      ref.current?.addEventListener('mousedown', mouseDownHandler);
      ref.current?.addEventListener('mouseup', mouseUpHandler);
      return () => {
        ref.current?.removeEventListener('mousedown', mouseDownHandler);
        ref.current?.removeEventListener('mouseup', mouseUpHandler);
      };
    }, [longPressEventHandler, ref]);

    return (
      <div
        className={itemClassName}
        ref={(e) => {
          if (typeof _ref === 'function') {
            _ref(e);
          } else if (_ref) {
            _ref.current = e;
          }
          ref.current = e;
        }}
        style={{
          ...style,
          ...transformStyle,
        }}
      >
        <div className={contentClassName}>{children}</div>
      </div>
    );
  }
);

DraggableContainerItem.displayName = 'DraggableContainerItem';

export default DraggableContainerItem;
