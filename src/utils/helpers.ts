let _uid = 1;

export const uid = () => `s_${Date.now()}_${_uid++}`;

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
