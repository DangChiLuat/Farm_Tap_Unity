import { _decorator, Camera, Component, instantiate, Node, Prefab, tween, UITransform, Vec3 } from 'cc';
import { SoundManager } from '../Utility/SoundManager';
import { Gamecontroller } from '../Controller/Gamecontroller';
const { ccclass, property } = _decorator;

@ccclass('CoinEffect')
export class CoinEffect extends Component {
    @property(Prefab)
    cointPrefab: Prefab = null;
    @property(Node)
    targetCoin: Node = null;
    @property(Camera)
    camera3D: Camera = null;
    @property(Camera)
    cameraUI: Camera = null;
    public playCoinEffect(position: Node) {
        if (Gamecontroller.instance.isVideo) return;
        const worldPos = position.getWorldPosition();
        this.scheduleOnce(() => {
            SoundManager.Instance(SoundManager).playSound("key");
            for (let i = 0; i < 3; i++) {
                const coin = instantiate(this.cointPrefab);
                this.targetCoin.parent.addChild(coin);

                let startPos: Vec3;

                if (this.camera3D) {
                    const screenPos = this.camera3D.worldToScreen(worldPos);
                    const canvasTransform = this.targetCoin.parent.getComponent(UITransform);
                    if (canvasTransform) {
                        if (this.cameraUI) {
                            const uiWorldPos = this.cameraUI.screenToWorld(screenPos);
                            startPos = canvasTransform.convertToNodeSpaceAR(uiWorldPos);
                        } else {
                            startPos = canvasTransform.convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y, 0));
                        }
                        coin.setPosition(startPos);
                    }
                }


                const baseAngle = (i * 72) * Math.PI / 180;
                const randomAngleOffset = (Math.random() - 0.5) * 30 * Math.PI / 180;
                const angle = baseAngle + randomAngleOffset;

                const baseDistance = 50;
                const randomDistance = baseDistance + Math.random() * 30;

                const spreadPos = new Vec3(
                    startPos.x + Math.cos(angle) * randomDistance,
                    startPos.y + Math.sin(angle) * randomDistance,
                    startPos.z
                );

                const delay = i * 0.05;

                tween(coin)
                    .delay(delay)
                    .to(0.3, {
                        position: spreadPos,
                        scale: new Vec3(0.9, 0.9, 0.9)
                    }, { easing: 'sineOut' })
                    .to(0.6, {
                        position: this.targetCoin.position,
                        scale: new Vec3(0.65, 0.65, 0.65)
                    }, { easing: 'sineIn' })
                    .call(() => {
                        coin.destroy();
                    })
                    .start();
            }
        }, 0.4)
    }
}


