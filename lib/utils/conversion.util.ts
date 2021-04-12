export function lineToHump(name) {
  return name.replace(/\_(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
}

export function humpToLine(name) {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function firstUpperCase([first, ...rest]) {
  return first?.toUpperCase() + rest.join('');
}
