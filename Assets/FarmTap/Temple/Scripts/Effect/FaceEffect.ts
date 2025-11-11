import { _decorator, Animation, Component, Game, instantiate, Node, Prefab, UITransform, Vec3 } from 'cc';
import { Gamecontroller } from '../Controller/Gamecontroller';
import { SoundManager } from '../Utility/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('FaceEffect')
export class FaceEffect extends Component {
    @property(Node)
    parentFace: Node = null;
    @property(Prefab)
    angry: Prefab = null;
    @property(Prefab)
    hearts: Prefab = null;
    @property(Prefab)
    emoji: Prefab = null;
    @property(Prefab)
    laugh: Prefab = null;
    private animationPool: Node[] = [];
    public createEffectInstance() {
        return;
        for (let i = 0; i < Gamecontroller.instance.POOL_SIZE; i++) {
            const angry = instantiate(this.angry);
            const hearts = instantiate(this.hearts);
            const emoji = instantiate(this.emoji);
            const laugh = instantiate(this.laugh);

            this.parentFace.addChild(angry);
            this.parentFace.addChild(hearts);
            this.parentFace.addChild(emoji);
            this.parentFace.addChild(laugh);
            angry.active = false;
            hearts.active = false;
            emoji.active = false;
            laugh.active = false;
            this.animationPool.push(angry, hearts, emoji, laugh);

        }
    }
    private getAnimationFromPool(name: string): Node | null {
        for (const animation of this.animationPool) {
            if (!animation.active && animation.name === name) {
                return animation;
            }
        }
        return null;
    }

    playAnimationFace(position: Node, name: string) {
        //return;
        if (Math.random() < 0.3) {
            SoundManager.Instance(SoundManager).playSound("sharp_pop");
            const animation = this.getAnimationFromPool(name);
            if (!animation) return;

            const animComp = animation.getComponent(Animation);
            const worldPos = position.getWorldPosition();
            let localPos = new Vec3(worldPos.x + 0.5, worldPos.y + 3, worldPos.z - 1);
            if (this.parentFace && this.parentFace.getComponent(UITransform)) {
                localPos = this.parentFace.getComponent(UITransform).convertToNodeSpaceAR(localPos);
            }
            if (animComp) {
                animComp.node.setPosition(localPos);
                animComp.play();
            }

            animation.active = true;
            this.scheduleOnce(() => {
                this.resetAnimation(animation);
            }, 1);
        }
    }

    private resetAnimation(animation: Node): void {
        if (!animation) return;
        animation.active = false;
    }
}


