import type { Command } from './keyboard';

/** Polls navigator.getGamepads() and emits game commands. */
export const bindGamepad = (
  onCommand: (command: Command) => void,
  intervalMs = 120,
): (() => void) => {
  if (typeof window === 'undefined' || !('getGamepads' in navigator)) {
    return () => undefined;
  }

  let lastButtonA = false;
  let lastButtonX = false;
  let lastButtonY = false;
  let lastButtonLB = false;
  let lastButtonRB = false;

  const timer = setInterval(() => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    if (!gp) return;

    // Movement: axes 0 (horizontal), 1 (vertical) or d-pad
    const axisX = gp.axes[0] ?? 0;
    const axisY = gp.axes[1] ?? 0;
    const dpadUp = gp.buttons[12]?.pressed ?? false;
    const dpadDown = gp.buttons[13]?.pressed ?? false;
    const dpadLeft = gp.buttons[14]?.pressed ?? false;
    const dpadRight = gp.buttons[15]?.pressed ?? false;

    let forward: 1 | -1 | 0 = 0;
    let right: 1 | -1 | 0 = 0;

    if (axisY < -0.4 || dpadUp) forward = 1;
    else if (axisY > 0.4 || dpadDown) forward = -1;

    if (axisX > 0.4 || dpadRight) right = 1;
    else if (axisX < -0.4 || dpadLeft) right = -1;

    if (forward !== 0 || right !== 0) {
      onCommand({ type: 'move', forward, right });
    }

    // Button A (0): Use
    const btnA = gp.buttons[0]?.pressed ?? false;
    if (btnA && !lastButtonA) onCommand({ type: 'use' });
    lastButtonA = btnA;

    // Button X (2): Sleep
    const btnX = gp.buttons[2]?.pressed ?? false;
    if (btnX && !lastButtonX) onCommand({ type: 'sleep' });
    lastButtonX = btnX;

    // Button Y (3): Shop
    const btnY = gp.buttons[3]?.pressed ?? false;
    if (btnY && !lastButtonY) onCommand({ type: 'shop' });
    lastButtonY = btnY;

    // LB / RB: Cycle seed
    const btnLB = gp.buttons[4]?.pressed ?? false;
    if (btnLB && !lastButtonLB) onCommand({ type: 'cycle-seed', direction: -1 });
    lastButtonLB = btnLB;

    const btnRB = gp.buttons[5]?.pressed ?? false;
    if (btnRB && !lastButtonRB) onCommand({ type: 'cycle-seed', direction: 1 });
    lastButtonRB = btnRB;
  }, intervalMs);

  return () => clearInterval(timer);
};
