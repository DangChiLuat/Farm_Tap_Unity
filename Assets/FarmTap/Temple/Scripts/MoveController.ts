import { _decorator, Component, Node, Vec3, geometry, PhysicsSystem, BoxCollider, ICollisionEvent, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoveController')
export class MoveController extends Component {
    @property(Node)
    startNode: Node = null;
    @property(Prefab)
    drawLineByPrefab: Prefab = null;
    @property
    moveSpeed: number = 5; // Tốc độ di chuyển

    @property
    maxMoveDistance: number = 10;


    private isMoving: boolean = false;
    private moveDirection: Vec3 = new Vec3();
    private startPosition: Vec3 = new Vec3();
    private distanceMoved: number = 0;
    private linePoints: Node[] = [];

    onLoad() {
        if (!this.node.getComponent(BoxCollider)) {
            this.node.addComponent(BoxCollider);
        }
    }

    private clearLine() {
        // Xóa các cube cũ
        this.linePoints.forEach(point => {
            point.destroy();
        });
        this.linePoints = [];
    }

    private drawRaycastLine(start: Vec3, direction: Vec3, length: number) {
        this.clearLine(); // Xóa line cũ

        const numPoints = 20; // Số điểm để vẽ đường
        const spacing = length / numPoints; // Khoảng cách giữa các điểm

        for (let i = 0; i < numPoints; i++) {
            const point = instantiate(this.drawLineByPrefab) as Node;
            point.setScale(0.1, 0.1, 0.1); // Scale nhỏ lại để tạo đường mảnh hơn
            
            // Tính toán vị trí cho mỗi điểm
            const position = new Vec3(
                start.x + direction.x * spacing * i,
                start.y + direction.y * spacing * i,
                start.z + direction.z * spacing * i
            );
            
            point.setWorldPosition(position);
            point.parent = this.node.parent; // Đặt parent là cùng cấp với node hiện tại
            this.linePoints.push(point);
        }
    }
    update(deltaTime: number) {
        if (!this.startNode) return;

        const boxCollider = this.node.getComponent(BoxCollider);
        if (!boxCollider) return;

        // Check for collision ahead
        const origin = this.node.worldPosition.clone();
        const size = boxCollider.size.clone();
        const center = new Vec3(origin.x, origin.y + size.y / 2, origin.z);

        // Calculate direction and distances
        const dir = new Vec3();
        Vec3.negate(dir, this.startNode.forward);
        dir.normalize();

        // Draw raycast line
        const visualDistance = this.isMoving ? this.maxMoveDistance - this.distanceMoved : this.maxMoveDistance;
        this.drawRaycastLine(center, dir, visualDistance);

        if (!this.isMoving) return;

        // Check collision
        const ray = new geometry.Ray(center.x, center.y, center.z,
            this.moveDirection.x, this.moveDirection.y, this.moveDirection.z);

        const lookAheadDistance = this.moveSpeed * deltaTime * 2;
        if (PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, lookAheadDistance)) {
            // Collision detected, stop moving
            this.isMoving = false;
            console.log('Movement stopped due to obstacle');
            return;
        }

        // Continue moving if within max distance
        if (this.distanceMoved < this.maxMoveDistance) {
            // Calculate movement for this frame
            const moveAmount = this.moveSpeed * deltaTime;
            const moveVec = new Vec3(
                this.moveDirection.x * moveAmount,
                this.moveDirection.y * moveAmount,
                this.moveDirection.z * moveAmount
            );

            // Update position
            this.node.setWorldPosition(this.node.worldPosition.clone().add(moveVec));

            // Update total distance moved
            this.distanceMoved += moveAmount;
        } else {
            // Reached maximum distance
            this.isMoving = false;
            this.clearLine();
            console.log('Reached maximum move distance');
        }
    }

    onClick() {
        if (!this.startNode || this.isMoving) return;

        // Start new movement
        this.moveDirection = new Vec3();
        Vec3.negate(this.moveDirection, this.startNode.forward);
        this.moveDirection.normalize();

        // Reset movement tracking
        this.startPosition = this.node.worldPosition.clone();
        this.distanceMoved = 0;
        this.isMoving = true;

        console.log('Starting continuous movement');
    }
}


