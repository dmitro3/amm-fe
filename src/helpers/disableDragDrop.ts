export const disableDragDrop = (tag: string): any => {
  const elm = document.getElementById(tag);
  elm?.addEventListener('dragstart', (e: any) => {
    e.preventDefault();
  });

  elm?.addEventListener('drop', (e: any) => {
    e.preventDefault();
  });
};
