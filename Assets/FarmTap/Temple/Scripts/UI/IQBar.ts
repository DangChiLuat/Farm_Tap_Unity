import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { Gamecontroller } from '../Controller/Gamecontroller';
const { ccclass, property } = _decorator;

@ccclass('IQBar')
export class IQBar extends Component {
    @property(Node)
    UI: Node = null;
    @property(Node)
    progess: Node = null;
    @property(Label)
    txtCoin: Label = null;
    @property(Node)
    indicator: Node = null;
    public spriteFill: Sprite = null;
    rangeMoveIndicator: number = 702;
    maxIQ: number = 180;


    public coin: number = 45;
    protected start(): void {
        this.spriteFill = this.progess.getComponent(Sprite);
        
        this.spriteFill.fillRange = this.coin / this.maxIQ;
        this.updateIndicatorPosition();

        this.txtCoin.string = "IQ : " + `${this.coin}`;
    }
    totalCharacterCount: number = 0;
    public updateProgressBar(): void {
        if (this.totalCharacterCount === 0) {
            return;
        }

        this.updateIndicatorPosition();
        if (this.coin >= this.maxIQ) return;
        
        this.coin += 5;
        this.spriteFill.fillRange = Math.min(1, this.coin / this.maxIQ);
        this.updateIndicatorPosition();
        this.txtCoin.string = "IQ : " + `${this.coin}`;
    }
    public reduceProgressBar(): void {
        if (this.coin <= 10) return;
        
        this.coin -= 10;
        this.spriteFill.fillRange = Math.max(0, this.coin / this.maxIQ);
        this.updateIndicatorPosition();
        this.txtCoin.string = "IQ : " + `${this.coin}`;
    }

    private updateIndicatorPosition(): void {
        if (!this.indicator) return;
        const indicatorX = this.spriteFill.fillRange * this.rangeMoveIndicator;


        this.indicator.setPosition(indicatorX, this.indicator.position.y, this.indicator.position.z);
    }
}


