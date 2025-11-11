import { _decorator, Component, Node, Vec3 } from 'cc';
import { ICharacterState } from './ICharacterState';
import { CharactorController } from '../Controller/CharactorController';
const { ccclass, property } = _decorator;

@ccclass('ImpactState')
export class ImpactState implements ICharacterState {
    enter(controller: CharactorController): void {
        // Handle entering impact state
        //controller.playAnimation(controller.impact);
    }

    update(controller: CharactorController): void {
        const current = controller.node.worldPosition;
        const dir = new Vec3();
        Vec3.subtract(dir, controller.safePos, current);

        const dist = dir.length();
        if (dist < 0.5) {
            controller.node.setWorldPosition(controller.safePos);
            return;
        }
        
        dir.normalize();
        const moveAmount = controller.moveSpeed * controller.getDeltaTime();
        const moveVec = dir.multiplyScalar(moveAmount);
        controller.node.setWorldPosition(controller.node.worldPosition.clone().add(moveVec));
    }

    exit(controller: CharactorController): void {
        // Handle exiting impact state
        //controller.playAnimation(controller.idle1111111111);
    }
}


