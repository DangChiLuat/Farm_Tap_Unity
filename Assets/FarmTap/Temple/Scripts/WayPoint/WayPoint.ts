import { _decorator, Component, Node, tween, Vec3, Quat, BoxCollider, ITriggerEvent, Tween } from 'cc';
import { UITransform } from 'cc';
import { Point } from '../Point/Point';
import { CharactorController } from '../Controller/CharactorController';
const { ccclass, property } = _decorator;

@ccclass('WayPoint')
export class WayPoint extends Component {

    @property(Node)
    point: Node = null;
    @property(Node)
    pointParrent: Node = null;
    @property(Node)
    gateCheck: Node = null;
    @property(Node)
    endPos: Node = null;
    @property([Node])
    listWayPoints: Node[] = [];

    protected start(): void {
        this.point.children.forEach((wayPointNode: Node) => {
            this.listWayPoints.push(wayPointNode);
        });
    }


    moveToNextWayPoint(characterNode: Node) {
        const worldPos = characterNode.worldPosition.clone();
        const worldRot = characterNode.worldRotation.clone();

        for (let i = 0; i < this.listWayPoints.length; i++) {
            if (this.listWayPoints[i].children.length > 0) {
                continue;
            }
            characterNode.parent = this.listWayPoints[i];

            characterNode.setWorldPosition(worldPos);
            characterNode.setWorldRotation(worldRot);
            const point = this.listWayPoints[i].getComponent(Point);
            const char = characterNode.getComponent(CharactorController);

            if (!char.isOneWay) {
                point.moveWithRotation(characterNode);
            }
            else{
                point.moveWithOneWay(characterNode);
            }
            break;
        }

    }
}


