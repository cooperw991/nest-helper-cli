import R from 'ramda';

export const arrayToString = (arr: string[], linker = ', ') => {
  const setArr = [...new Set(arr)];
  const sortedArr = R.sort((a, b) => a.localeCompare(b), setArr);
  return sortedArr.join(linker);
};
