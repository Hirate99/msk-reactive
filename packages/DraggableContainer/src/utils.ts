import { ItemPosition } from './types/global';

export const getDraggableItemPos = (
  offsetLeft: number,
  offsetTop: number,
  itemWidth: number,
  itemHeight: number
) => {
  return {
    row: Math.floor(offsetTop / itemHeight),
    col: Math.floor(offsetLeft / itemWidth),
  } as ItemPosition;
};
