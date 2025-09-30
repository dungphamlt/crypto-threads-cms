/**
 * Suppress Ant Design React 19 compatibility warning
 * This is a temporary solution until Ant Design officially supports React 19
 */
export function suppressAntdReact19Warning() {
  if (typeof window !== "undefined") {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("[antd: compatible]")
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
}
