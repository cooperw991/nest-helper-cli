const pad = (len: number): string => {
  let res = '';

  for (let i = 0; i < len; i++) {
    res += ' ';
  }

  return res;
};

export const p2 = pad(2);
export const p4 = pad(4);
export const p6 = pad(6);
export const p8 = pad(8);
export const p10 = pad(10);
export const p12 = pad(12);
export const p14 = pad(14);
export const p16 = pad(16);
