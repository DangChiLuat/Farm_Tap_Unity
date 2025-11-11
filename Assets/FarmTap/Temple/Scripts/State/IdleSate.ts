import { _decorator, Component, Node, Vec3 } from 'cc';
import { ICharacterState } from './ICharacterState';
import { CharactorController } from '../Controller/CharactorController';
import { CharacterStateType } from '../Enum/CharacterStateType';
const { ccclass, property } = _decorator;

@ccclass('IdleState')
export class IdleState implements ICharacterState {
    enter(controller: CharactorController): void {
        controller.playRandomIdleAnimation();
    }

    update(controller: CharactorController): void {
        // Handle updating idle state

    }

    exit(controller: CharactorController): void {
        // Handle exiting idle state

        console.log("Exiting Idle State");
        controller.dustEffect.stop();
    }
}


