import { _decorator, Camera, Color, Component, easing, Node, SpriteRenderer, tween, Vec3 } from 'cc';
import { Gamecontroller } from './Controller/Gamecontroller';
import { HandleInputListener } from './HandleInput/HandleInputListener';
const { ccclass, property } = _decorator;

@ccclass('Intro')
export class Intro extends Component {
    @property(Camera)
    camera: Camera = null;
    @property(SpriteRenderer)
    bg: SpriteRenderer = null;
    @property(HandleInputListener)
    cameraCom: HandleInputListener = null;

    protected start(): void {
        this.scheduleOnce(this.intro, 1.5);
        this.introBg();
    }
    intro() {
        tween(this.camera)
            .to(1, { orthoHeight: 8 }, { easing: 'sineInOut' })
            .start();
        if (Gamecontroller.instance.resizeCam.isLands) {
            console.log("Landscape mode");
            tween(this.camera.node)
                .to(1, { position: new Vec3(5, 10, -17) }, { easing: 'smooth' })
                .call(() => {
                    tween(this.camera.node)
                        .to(0.7, { position: new Vec3(5, 10, -17) }, { easing: 'smooth' })
                        .call(() => {
                            this.cameraCom._targetCameraPosition.set(this.camera.node.position);
                            Gamecontroller.instance.isCam = true;
                        }) 
                        .start();
                    tween(this.camera)
                        .to(0.7, { orthoHeight: 10 }, { easing: 'smooth' })
                        .call(() => {
                            Gamecontroller.instance.isCanTouch = true;
                        })
                        .start();
                })
                .start();
        }
        else {
            console.log("Portrait mode");
            tween(this.camera.node)
                .to(1, { position: new Vec3(3, 10, -7) }, { easing: 'smooth' })
                .call(() => {
                    tween(this.camera.node)
                        .to(0.7, { position: new Vec3(3, 10, -7) }, { easing: 'smooth' })
                        .call(() => {
                            this.cameraCom._targetCameraPosition.set(this.camera.node.position);
                            Gamecontroller.instance.isCam = true;
                        })
                        .start();
                    tween(this.camera)
                        .to(0.7, { orthoHeight: 10 }, { easing: 'smooth' })
                        .call(() => {
                            Gamecontroller.instance.isCanTouch = true;
                        })
                        .start();
                })
                .start();
        }

    }

    introBg() {
        const material = this.bg.getMaterial(0);
        if (material) {
            const currentColor = material.getProperty('mainColor') as Color;

            const defaultColor = new Color(255, 255, 255, 255);
            const targetColor = new Color(255, 255, 255, 0);

            const colorObj = { color: defaultColor.clone() };
            tween(colorObj)
                .to(2, { color: targetColor }, {
                    easing: 'sineInOut',
                    onUpdate: () => {
                        material.setProperty('mainColor', colorObj.color);
                    }
                })
                .start();
        }
    }
}


