import { ReactNode } from 'react';

export declare type ReactChildren = ReactNode;

export declare type CompChildren = {
  children: ReactChildren;
};

export declare interface ItemPosition {
  row: number;
  col: number;
}

export declare type MoveTo = (
  col: number,
  row: number,
  duration?: number
) => Promise<ItemPosition | null>;
