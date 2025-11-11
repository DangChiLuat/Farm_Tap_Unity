import { _decorator, CCBoolean, CCInteger, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GeneratePoint')
export class GeneratePoint extends Component {
    @property(Prefab)
    point: Prefab | null = null;
    @property(Node)
    WayPointParent: Node = null;

    @property
    radius: number = 5;
    @property 
    distance : number = 1;
    @property(CCBoolean)
    isCanRefresh: boolean = true;
    @property({ type: CCInteger, slide: true, min: 0, max: 10, step: 1 })
    private _amountData: number = 0;
    @property({ type: CCInteger, slide: true, min: 0, max: 10, step: 1 })
    public get amountData(): number {
        return this._amountData;
    }
    public set amountData(value: number) {
        this._amountData = value;
        if (this.isCanRefresh) {
            this.refreshData();
        }
    }

    refreshData() {
        if (!this.point) return;

        if (this.node.children.length < this._amountData) {
            let diff = this._amountData - this.node.children.length;
            for (let i = 0; i < diff; i++) {
                const newNode = instantiate(this.point);
                newNode.parent = this.WayPointParent;
            }
        }
        else if (this.WayPointParent.children.length > this._amountData) {
            let diff = this.WayPointParent.children.length - this._amountData;
            for (let i = 0; i < diff; i++) {
                const lastChild = this.WayPointParent.children[this.WayPointParent.children.length - 1];
                if (lastChild) {
                    lastChild.destroy();

                }
            }
        }
        
        // Sắp xếp các point theo hình tròn
        this.WayPointParent.children.forEach((child, index) => {
            const angle = (index / this._amountData) * 2 * Math.PI; // Góc cho mỗi point
            const x = this.radius * Math.cos(angle); // Tọa độ X
            const z = this.radius * Math.sin(angle); // Tọa độ Z
            child.setPosition(x, 0, z);
        });
    }
}


