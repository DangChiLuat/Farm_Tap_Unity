import { _decorator, CCInteger, CharacterController, Component, Node, Prefab, instantiate, director, CCBoolean } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('generateData')
export class generateData extends Component {

    @property(Prefab)
    data: Prefab | null = null;

    @property(Node)
    listChar: Node[] = [];

    @property(CCBoolean)
    isCanRefresh: boolean = true;

    @property({ type: CCInteger, slide: true, min: 0, max: 20, step: 1 })
    private _amountData: number = 0;
    @property({ type: CCInteger, slide: true, min: 0, max: 20, step: 1 })
    public get amountData(): number {
        return this._amountData;
    }
    public set amountData(value: number) {
        this._amountData = value;
        if (this.isCanRefresh) {
            this.refreshData();
        }
    }

    protected onLoad(): void {
        if (this.isCanRefresh) {
            this.refreshData();
        }
    }

    refreshData() {
        if (!this.data) return;

        if (this.node.children.length < this._amountData) {
            let diff = this._amountData - this.node.children.length;
            for (let i = 0; i < diff; i++) {
                const newNode = instantiate(this.data);
                newNode.parent = this.node;
                //this.listChar.push(newNode);
            }
        }
        else if (this.node.children.length > this._amountData) {
            let diff = this.node.children.length - this._amountData;
            for (let i = 0; i < diff; i++) {
                const lastChild = this.node.children[this.node.children.length - 1];
                if (lastChild) {
                    lastChild.destroy();

                }
            }
        }
        const stepZ =1.05; 
        this.node.children.forEach((child, index) => {
            child.setPosition(0, 0, index * stepZ);
        });
    }
}   
