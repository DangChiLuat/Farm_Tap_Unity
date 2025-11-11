import { _decorator, Component, Node, Vec3, tween, NodePool, UIOpacity, Animation, Tween } from 'cc';
import { Gamecontroller } from './Gamecontroller';
const { ccclass, property } = _decorator;

@ccclass('HandControllder')
export class HandControllder extends Component {
    public static instance: HandControllder = null;

    @property(Node)
    hand: Node = null;


    private currentTutorialIndex: number = 0;
    public isTutorialActive: boolean = false;
    private currentTargetTween: any = null;
    @property([Node])
    listTargetTut: Node[] = [];

    private touchCount: number = 0;
    private readonly TOUCH_THRESHOLD: number = 3;
    private isUsingTargetTut: boolean = true;
    private handShowScheduleId: any = null;
    private originalScaleMap: Map<Node, Vec3> = new Map();

    private isDoneTutorial: boolean = false;
    protected onLoad(): void {
        // if(Gamecontroller.instance.isVideo){
        //     this.node.active = false;
        //     return;
        // }
        HandControllder.instance = this;
        if (!HandControllder.instance) {
            HandControllder.instance = this;
        }
    }

    public startTutorial(): void {
        if (this.listTargetTut.length > 0) {
            this.isTutorialActive = true;
            this.isUsingTargetTut = true;
            this.currentTutorialIndex = 0;
            this.touchCount = 0;
            this.moveHandToCurrentTarget();
        } else if (Gamecontroller.instance.movableCharacters.length > 0) {
            this.isTutorialActive = true;
            this.isUsingTargetTut = false;
            this.currentTutorialIndex = 0;
            this.touchCount = 0;
            this.moveHandToCurrentTarget();
        }
    }

    public moveHandToCurrentTarget(): void {
        this.stopCurrentTargetTween();

        const targetArray = this.isUsingTargetTut ? this.listTargetTut : Gamecontroller.instance.movableCharacters;

        if (this.currentTutorialIndex < targetArray.length) {
            const targetNode = targetArray[this.currentTutorialIndex];
            if (targetNode && this.hand) {
                const targetWorldPos = targetNode.getWorldPosition();
                const handPosition = new Vec3(targetWorldPos.x + 0.8, 4, targetWorldPos.z + 0.4);
                this.hand.setWorldPosition(handPosition);
                this.hand.active = true;
                this.startTargetTween(targetNode);
            }
        } else {
            this.endTutorial();
        }
    }

    public moveToNextTarget(): void {
        if (!this.isTutorialActive) return;

        this.currentTutorialIndex++;
        //if (this.currentTutorialIndex >= 1) return;

        if (this.isUsingTargetTut) {

            if (this.currentTutorialIndex >= this.listTargetTut.length) {
                this.switchToMovableCharacters();
                return;
            }
            this.moveHandToCurrentTarget();
        } else {
            if (this.currentTutorialIndex >= Gamecontroller.instance.movableCharacters.length) {
                this.endTutorial();
                return;
            }
            this.moveHandToCurrentTarget();
        }
    }

    private switchToMovableCharacters(): void {
        this.isUsingTargetTut = false;
        this.currentTutorialIndex = 0;

        if (Gamecontroller.instance.movableCharacters.length > 0) {
            this.scheduleShowHand(0.5);
        } else {
            this.endTutorial();
        }
    }



    public endTutorial(): void {
        this.stopCurrentTargetTween();
        this.clearHandShowSchedule();
        this.isTutorialActive = false;
        this.hand.active = false;
        this.touchCount = 0;
        this.isUsingTargetTut = true;

        this.originalScaleMap.clear();
    }

    public hindHand(): void {
        const randomDelay = 5 + Math.random() * 2;
        if (!this.isTutorialActive) return;
        console.log("Hind Hand");
        if (!this.isDoneTutorial) {
            //Gamecontroller.instance.handMove.active = true;
            this.isDoneTutorial = true;
        }

        this.touchCount++;

        this.stopCurrentTargetTween();
        this.hand.active = false;
        this.clearHandShowSchedule();

        if (this.isUsingTargetTut) {
            if (this.touchCount >= this.TOUCH_THRESHOLD) {
                this.scheduleOnce(() => {
                    if (this.isTutorialActive) {
                        this.switchToMovableCharacters();
                    }
                }, randomDelay);
            } else {
                this.scheduleShowHand(0.1);
            }
        } else {

            this.scheduleShowHand(randomDelay);
        }
    }

    public showHand(): void {
        if (!this.isTutorialActive) return;

        this.moveToNextTarget();
    }

    private scheduleShowHand(delay: number): void {
        this.clearHandShowSchedule();
        this.handShowScheduleId = this.scheduleOnce(() => {
            if (this.isTutorialActive) {
                this.showHand();
            }
            this.handShowScheduleId = null;
        }, delay);
    }

    private clearHandShowSchedule(): void {
        this.unscheduleAllCallbacks();

    }

    public getCurrentTargetNode(): Node | null {
        const targetArray = this.isUsingTargetTut ? this.listTargetTut : Gamecontroller.instance.movableCharacters;

        if (this.currentTutorialIndex < targetArray.length) {
            return targetArray[this.currentTutorialIndex];
        }
        return null;
    }

    public isTutorialNode(node: Node): boolean {
        return this.isTutorialActive && this.getCurrentTargetNode() === node;
    }


    public updateTutorial(): void {
        if (!this.isTutorialActive) {
            return;
        }
        if (!this.isUsingTargetTut) {
            if (Gamecontroller.instance.movableCharacters.length === 0) {
                this.endTutorial();
                return;
            }
            if (this.currentTutorialIndex >= Gamecontroller.instance.movableCharacters.length) {
                this.currentTutorialIndex = Gamecontroller.instance.movableCharacters.length - 1;
            }
            if (this.hand.active) {
                this.moveHandToCurrentTarget();
            }
        }
    }
    private startTargetTween(targetNode: Node): void {
        if (!targetNode || !targetNode.isValid) {
            return;
        }

        if (this.currentTargetTween) {
            this.currentTargetTween.stop();
        }

        if (!this.originalScaleMap.has(targetNode)) {
            this.originalScaleMap.set(targetNode, targetNode.scale.clone());
        }

        const originalScale = this.originalScaleMap.get(targetNode);
        const loopTween = () => {
            this.currentTargetTween = tween(targetNode)
                .to(0.2, { scale: new Vec3(originalScale.x + 0.2, originalScale.y + 0.2, originalScale.z + 0.2) })
                .to(0.2, { scale: originalScale })
                .call(() => {
                    if (this.isTutorialActive && this.getCurrentTargetNode() === targetNode && targetNode.isValid) {
                        loopTween();
                    }
                })
                .start();
        };
        loopTween();
    }

    private stopCurrentTargetTween(): void {
        if (this.currentTargetTween) {
            this.currentTargetTween.stop();
            this.currentTargetTween = null;
        }

        const currentTarget = this.getCurrentTargetNode();
        if (currentTarget && currentTarget.isValid) {
            const originalScale = this.originalScaleMap.get(currentTarget);
            if (originalScale) {
                currentTarget.setScale(originalScale);
            }
        }
    }


}


