export default function validateState(state) {
  if (state && typeof state === 'object') return state;
  return {};
}