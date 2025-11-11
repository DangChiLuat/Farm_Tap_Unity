import { _decorator, BoxCollider, Component, ITriggerEvent, Node, Quat, Tween, tween, Vec3 } from 'cc';
import { Gamecontroller } from '../Controller/Gamecontroller';
const { ccclass, property } = _decorator;

@ccclass('Point')
export class Point extends Component {
    @property(Node)
    gateCheck: Node = null;
    @property(Node)
    endPos: Node = null;
    @property({ tooltip: "Vận tốc di chuyển (đơn vị/giây)" })
    speed: number = 3;
    protected start(): void {

        let collider = this.gateCheck.getComponent(BoxCollider);
        collider.on('onTriggerEnter', this.OnTriggerEnter, this);

    }
    private OnTriggerEnter(event: ITriggerEvent) {
        console.log("OnTriggerEnter Point");
        let otherNode = event.otherCollider.node;
        if (!otherNode) return;
        let childNode = this.node.children[0];
        if (!childNode) return;
        if (otherNode.uuid !== this.node.children[0].uuid) return;
        // console.log(event.type, event);
        this.stopAllTween();
        this.moveToEndPos(this.node.children[0]);
        console.log(this.node.name)
    }


    public moveWithOneWay(characterNode: Node) {
        // Gamecontroller.instance.cointEffect.playCoinEffect(characterNode);
        // Gamecontroller.instance.updateProgressBar();
        const targetWorldPos = this.endPos.worldPosition.clone();
        const distance = Vec3.distance(characterNode.worldPosition, targetWorldPos);
        const moveTime = distance / this.speed;

        if (characterNode.eulerAngles.y < 0) {
            tween(characterNode)
                .to(0.1, { eulerAngles: new Vec3(0, -180, 0) })
                .start();
        }
        else {
            tween(characterNode)
                .to(0.1, { eulerAngles: new Vec3(0, 180, 0) })
                .start();
        }

        tween(characterNode)
            .to(moveTime, { worldPosition: targetWorldPos })
            .call(() => {
                Gamecontroller.instance.checkCharCanMove();
                characterNode.destroy();
            })
            .start();
    }
    moveWithRotation(characterNode: Node) {
        const radius = new Vec3();

        Vec3.subtract(radius, characterNode.worldPosition, this.node.worldPosition);
        radius.y = 0;

        // diện tích
        const radiusLength = radius.length();

        // chu vi
        const circumference = 2 * Math.PI * radiusLength;

        // time 
        const rotationTime = circumference / this.speed;
        //console.log(`Bán kính: ${radiusLength.toFixed(2)}, Quãng đường: ${circumference.toFixed(2)}, Thời gian: ${rotationTime.toFixed(2)}s, Vận tốc: ${this.speed}`);

        radius.normalize();
        const tangent = new Vec3(radius.z, 0, -radius.x);

        const angle = Math.atan2(tangent.x, tangent.z);
        let targetAngle = angle * (180 / Math.PI);
        const currentAngle = characterNode.eulerAngles.y;
        let deltaAngle = targetAngle - currentAngle;
        while (deltaAngle > 180) deltaAngle -= 360;
        while (deltaAngle < -180) deltaAngle += 360;

        const finalAngle = currentAngle + deltaAngle;
        tween(characterNode)
            .to(0.05, { eulerAngles: new Vec3(0, finalAngle, 0) })
            .start();

        this.scheduleOnce(() => {
            tween(this.node)
                .to(rotationTime, { eulerAngles: new Vec3(0, 360, 0) })
                .start();
        }, 0)
    }
    stopAllTween() {
        Tween.stopAllByTarget(this.node);
    }
    moveToEndPos(characterNode: Node) {
        Tween.stopAllByTarget(characterNode);
        const targetWorldPos = this.endPos.worldPosition.clone();
        const distance = Vec3.distance(characterNode.worldPosition, targetWorldPos);
        const moveTime = distance / this.speed;

        tween(characterNode)
            .to(moveTime, { worldPosition: targetWorldPos })
            .call(() => {
                Gamecontroller.instance.checkCharCanMove();
                characterNode.destroy();
                this.node.setRotation(Quat.IDENTITY);
            })
            .start();
    }

}


