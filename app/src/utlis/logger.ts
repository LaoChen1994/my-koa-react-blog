export function logger(notes: string, fn?: () => void) {
  console.log(`*********************Start ${notes}*********************`);
  fn && fn();
  console.log(`*********************End   ${notes}*********************`);
}
