// Layout uses h-screen overflow-hidden — fixed modals naturally block background scroll.
// No DOM manipulation needed; this hook is intentionally a no-op.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScrollLock(_isLocked: boolean) {}
