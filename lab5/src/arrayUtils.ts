// A function to check wether two arrays have the same elements
export function arrayEq<T> (arr1: T[], arr2: T[]): boolean {
  return JSON.stringify(arr1.sort((a, b) => Number(a < b))) === JSON.stringify(arr2.sort((a, b) => Number(a < b)))
}

// A function to check wether array contains another array
export function arrayIncludesArray<T> (arr: T[][], includes: T[]): boolean {
  return arr.some(v => arrayEq(v, includes))
}

export function getPosition<T> (arr: T[], element: T, index: number): number {
  let j = 0
  // eslint-disable-next-line @typescript-eslint/no-for-in-array
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === element) {
      if (j === index) return i
      j++
    }
  }
  return -1
}
