export function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  let i = 0;

  while (i < items.length) {
    chunks.push(items.slice(i, (i += size)));
  }

  return chunks;
}
