export function lineToHump(name: string): string {
  return name.replace(/\_(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
}

export function humpToUnderscore(name: string): string {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function firstUpperCase(str: string): string {
  const [first, ...rest] = str;
  return first?.toUpperCase() + rest.join('');
}

export function humpToDash(name: string): string {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase();
}
