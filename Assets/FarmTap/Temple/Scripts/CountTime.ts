import { _decorator, Component, Node, ParticleSystem, SpriteRenderer, Vec3 } from 'cc';
import { Gamecontroller } from './Controller/Gamecontroller';
import { SoundManager } from './Utility/SoundManager';
import { GlobalEvent } from './Event/GlobalEvent';
import { HandControllder } from './Controller/HandControllder';
const { ccclass, property } = _decorator;

@ccclass('CountTime')
export class CountTime extends Component {
    @property(Node)
    pointPos: Node = null;
    arrPoint: number[] = [];

    @property(ParticleSystem)
    exp: ParticleSystem = null;

    @property(Node)
    nodeBoom: Node = null;
    @property
    time: number = 180;

    private currentTime: number = 180;
    private countdownTimer: number = 0;

    protected start(): void {
        this.currentTime = this.time;
        this.updateTimeDisplay();
    }

    protected update(dt: number): void {
        this.countdownTimer += dt;
        if (this.currentTime == 135) {
            GlobalEvent.instance().dispatchEvent(GlobalEvent.OPEN_STORE);
        }

        if (this.currentTime == 90) {
            GlobalEvent.instance().dispatchEvent(GlobalEvent.OPEN_STORE);
        }
        // Cập nhật mỗi giây
        if (this.countdownTimer >= 1.0) {
            this.countdownTimer = 0;
            this.currentTime--;

            if (this.currentTime <= -1) {
                this.currentTime = 0;
                return;
            }

            this.updateTimeDisplay();

            // Hiển thị hand khi currentTime == 45 hoặc == 90
            if (this.currentTime == 135 || this.currentTime == 90) {
                if (HandControllder.instance) {

                }
            }

            if (this.currentTime == 0) {
                if(!this.nodeBoom.isValid || Gamecontroller.instance.isEndGame) return;
                this.exp.node.active = true;
                SoundManager.Instance(SoundManager).playSound("explode");
                //this.nodeBoom.active = false;
                Gamecontroller.instance.gameLose.active = true;
                SoundManager.Instance(SoundManager).playSound("Level_lose");
            }

        }

    }

    updateTimeDisplay() {
        this.arrPoint = [];
        const timeString = this.currentTime.toString();

        for (let i = 0; i < timeString.length; i++) {
            this.arrPoint.push(parseInt(timeString[i]));
        }

        const maxDigits = 3;
        while (this.pointPos.children.length < maxDigits) {
            const newChild = new Node();
            newChild.addComponent(SpriteRenderer);
            this.pointPos.addChild(newChild);
        }

        for (let i = 0; i < this.pointPos.children.length; i++) {
            this.pointPos.children[i].active = false;
        }

        const kc = 0.7;
        const startIndex = maxDigits - this.arrPoint.length;

        for (let i = 0; i < this.arrPoint.length; i++) {
            const childIndex = startIndex + i;
            if (this.pointPos.children[childIndex]) {
                this.pointPos.children[childIndex].active = true;
                this.pointPos.children[childIndex].getComponent(SpriteRenderer).spriteFrame = Gamecontroller.instance.number[this.arrPoint[i]];
            }
        }

        let offsetX = 0.9;
        if (this.arrPoint.length === 2) {
            offsetX = 1;
        }
        if (this.arrPoint.length === 1) {
            offsetX = 1.1;
        }
        this.pointPos.position = new Vec3(offsetX - kc * (maxDigits - 1) / 2, 2, -0.175);
        for (let i = 0; i < maxDigits; i++) {
            this.pointPos.children[i].position = new Vec3(kc * i, 0, 0);
        }
    }
}


