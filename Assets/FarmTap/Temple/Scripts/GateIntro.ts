import { _decorator, Component, Material, MeshRenderer, Node, tween, Color, Tween, easing } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GateIntro')
export class GateIntro extends Component {
    @property(MeshRenderer)
    gateMaterial: MeshRenderer = null;

    protected start(): void {
        this.showIntro();
    }

    changeColor = { opacity: 255 }
    showIntro() {
        if (!this.gateMaterial || !this.gateMaterial.material) {
            console.warn('Gate material not found');
            return;
        }
        const redColor = new Color(255, 0, 0, 205);
        const brownColor = new Color(139, 69, 19, 255);
        const originalColor = this.gateMaterial.material.getProperty('albedo') || new Color(255, 255, 255, 255);

        this.gateMaterial.material.setProperty('albedo', brownColor);
        let time: number = 0.5; 
        Tween.stopAllByTarget(this.changeColor);
        let colorTween = tween(this.changeColor)
            .to(time, { opacity: 255 }, {
                onUpdate: (target, ratio) => {
                    let r = easing.smooth(ratio);
                    const currentColor = brownColor.clone().lerp(redColor, r);
                    this.gateMaterial.material.setProperty('albedo', currentColor);
                },
            })
            .to(time, { opacity: 0 }, {
                onUpdate: (target, ratio) => {
                    let r = easing.smooth(ratio);
                    const currentColor = redColor.clone().lerp(brownColor, r);
                    this.gateMaterial.material.setProperty('albedo', currentColor);
                },
            })

        tween(this.changeColor)
            .repeat(3, colorTween)
            .start()

    }
}


