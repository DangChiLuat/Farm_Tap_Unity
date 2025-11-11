import { AnimationState } from "../State/AnimationState";

interface IAnimationState {
    enter(): void;
    exit(): void;
    update(dt: number): void;
    canTransitionTo(nextState: AnimationState): boolean;
}