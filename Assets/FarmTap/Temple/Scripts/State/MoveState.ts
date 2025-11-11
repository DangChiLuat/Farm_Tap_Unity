import { _decorator, Component, Game, Node, Vec3 } from 'cc';
import { ICharacterState } from './ICharacterState';
import { CharactorController } from '../Controller/CharactorController';
import { CharacterStateType } from '../Enum/CharacterStateType';
import { SoundManager } from '../Utility/SoundManager';
import { Gamecontroller } from '../Controller/Gamecontroller';
import { GlobalEvent } from '../Event/GlobalEvent';
const { ccclass, property } = _decorator;

@ccclass('MoveState')
export class MoveState implements ICharacterState {
    private currentSpeed: number = 0;
    private accelerationTime: number = 0;
    private maxAccelerationTime: number = 0.2;
    private static lastSheepSoundTime: number = 0;
    private static sheepSoundCooldown: number = 0.3; // 0.2 giây cooldown
    public isDone: boolean = false;
    enter(controller: CharactorController): void {
        controller.playAnimation(CharacterStateType.RUN);
        controller.smokeEffect.play();

        if (!controller.isHaveBox) {
            // Gamecontroller.instance.IQBar.updateProgressBar();
            SoundManager.Instance(SoundManager).playSound("Coin_collect");

            // const currentTime = Date.now() / 1000;
            // if (currentTime - MoveState.lastSheepSoundTime >= MoveState.sheepSoundCooldown) {
            //     const sheepSounds = ["Sheepba", "Sheepbaa"];
            //     const randomSound = sheepSounds[Math.floor(Math.random() * sheepSounds.length)];
            //     if (Math.random() < 0.4) {
            //         SoundManager.Instance(SoundManager).playSound(randomSound);
            //     }

            //     MoveState.lastSheepSoundTime = currentTime;
            // }

            Gamecontroller.instance.cointEffect.playCoinEffect(controller.node);
            Gamecontroller.instance.countMove++;
            // if (Gamecontroller.instance.countMove == 20) {
            //     GlobalEvent.instance().dispatchEvent(GlobalEvent.OPEN_STORE);
            // }
            // if (Gamecontroller.instance.countMove >= 30) {
            //     GlobalEvent.instance().dispatchEvent(GlobalEvent.OPEN_STORE);
            // }
            if (!controller.isHaveBox || controller.targetDistance > 1.1) {
                SoundManager.Instance(SoundManager).playSound("runing");
            }
        }
        else {
            // Gamecontroller.instance.IQBar.reduceProgressBar();
        }
        // Reset tốc độ và thời gian gia tốc
        this.currentSpeed = 0;
        this.accelerationTime = 0;
    }

    update(controller: CharactorController): void {
        if (this.isDone) return;
        // Tính toán gia tốc
        this.accelerationTime += controller.getDeltaTime();
        const accelerationRatio = Math.min(this.accelerationTime / this.maxAccelerationTime, 1.0);

        // Sử dụng easing function để có chuyển động mượt mà hơn
        const easedRatio = this.easeInQuad(accelerationRatio);
        this.currentSpeed = controller.moveSpeed * easedRatio;

        const remaining = controller.targetDistance - controller.distanceMoved;
        const moveAmount = Math.min(this.currentSpeed * controller.getDeltaTime(), remaining);

        const moveVec = controller.moveDirection.clone().multiplyScalar(moveAmount);
        controller.node.setWorldPosition(controller.node.worldPosition.clone().add(moveVec));
        controller.distanceMoved += moveAmount;

        if (controller.distanceMoved >= controller.targetDistance) {
            if (controller.isHitWayPoint) {
                controller.wayPoint.moveToNextWayPoint(controller.node);
                //controller.changeState(CharacterStateType.IDLE);
                this.isDone = true;
            } else {
                // Va chạm với vật thể khác, thực hiện IMPACT bình thường
                controller.playAnimation(CharacterStateType.IMPACT);
                controller.handleImpactAnimationEnd();
                controller.changeState(CharacterStateType.IMPACT);
                controller.getClosestNode(controller.nodeClosest);
            }
        }
    }

    private easeInQuad(t: number): number {
        return t * t;
    }

    exit(controller: CharactorController): void {

        console.log("Exit Move State");
        if (controller.isChar) {
            controller.smokeEffect.stop();
            controller.isChar = false;
        }
        else {
            controller.wayPoint.moveToNextWayPoint(controller.node);
            // Chuyển sang RUN animation khi di chuyển đến waypoint tiếp theo
            controller.playAnimation(CharacterStateType.RUN);
            controller.smokeEffect.play();
            //   controller.smokeEffect.stop();
        }
    }
}


