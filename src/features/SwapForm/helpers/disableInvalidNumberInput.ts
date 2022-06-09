import React from 'react';

export const disableNumberInputUpDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
  }
};

export const disableInvalidCharacters = (e: React.KeyboardEvent<HTMLDivElement>): void => {
  if (e.key == 'e' || e.key == 'E' || e.key == '+' || e.key == '-') {
    e.preventDefault();
  }
};

export const disableNumberInputScroll = (e: React.WheelEvent<HTMLDivElement>): void => {
  (e.currentTarget.querySelector('input') as HTMLInputElement).blur();
};
