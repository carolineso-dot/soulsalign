/**
 * Developer/test mode gate.
 *
 * Enabled ONLY when NEXT_PUBLIC_TEST_MODE === "true" AND we're not running a
 * production build. The second condition is belt-and-suspenders: even if the
 * flag were accidentally set in a production environment, test-mode shortcuts
 * stay off. Pure module — safe on client or server (NEXT_PUBLIC_* and NODE_ENV
 * are both inlined into the client bundle by Next).
 */
export function testModeEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_TEST_MODE === "true" &&
    process.env.NODE_ENV !== "production"
  );
}
