export type MoveDirection = 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'NONE';

export interface ControllerState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface PlayerState {
  position: [number, number, number];
  rotation: [number, number, number];
}
