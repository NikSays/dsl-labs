// A function to check wether two arrays have the same elements
export function arrayEq<T> (arr1: T[], arr2: T[]): boolean {
  return JSON.stringify(arr1.sort((a, b) => Number(a < b))) === JSON.stringify(arr2.sort((a, b) => Number(a < b)))
}

// A function to check wether array contains another array
export function arrayIncludesArray<T> (arr: T[][], includes: T[]): boolean {
  return arr.some(v => arrayEq(v, includes))
}
