import { _decorator, Component, geometry, Node, PhysicsSystem, Prefab, Quat, Vec3, instantiate } from 'cc';
const { ccclass, property } = _decorator;

enum MoveState {
    Idle,
    Forward, // A -> B
    Backward // B -> Safe
}

@ccclass('SweepBoxExample')
export class SweepBoxExample extends Component {
    @property(Node)
    startNode: Node = null;

    @property(Prefab)
    drawLineByPrefab: Prefab = null;

    @property
    moveSpeed: number = 10;
 
    @property
    safeDistance: number = 1.0; // Khoảng cách an toàn từ vật va chạm

    public isMoving: boolean = false;
    private moveDirection: Vec3 = new Vec3();
    private startPosition: Vec3 = new Vec3();
    private distanceMoved: number = 0;
    private targetDistance: number = 0; // Khoảng cách tối đa có thể di chuyển
    private maxScanDistance: number = 20; // Khoảng cách quét tối đa

    private moveState: MoveState = MoveState.Idle;
    private safePos: Vec3 = new Vec3();
    private hitPos: Vec3 = new Vec3();

    update(deltaTime: number) {
        if (this.moveState === MoveState.Idle) return;

        if (this.moveState === MoveState.Forward) { 
            // Di chuyển từ A -> B
            const remaining = this.targetDistance - this.distanceMoved;
            const moveAmount = Math.min(this.moveSpeed * deltaTime, remaining);

            const moveVec = this.moveDirection.clone().multiplyScalar(moveAmount);
            this.node.setWorldPosition(this.node.worldPosition.clone().add(moveVec));
            this.distanceMoved += moveAmount;

            if (this.distanceMoved >= this.targetDistance) {
                // Tới B (va chạm)
                console.log("Va chạm tại B, bắt đầu lùi về safePos...");
                this.moveState = MoveState.Backward;
            }
        }
        else if (this.moveState === MoveState.Backward) {
            // Di chuyển từ B -> safePos
            const current = this.node.worldPosition;
            const dir = new Vec3();
            Vec3.subtract(dir, this.safePos, current);
            const dist = dir.length();

            if (dist < 0.05) {
                this.node.setWorldPosition(this.safePos);
                console.log("Đã lùi về vị trí an toàn!");
                this.moveState = MoveState.Idle;
                return;
            }

            dir.normalize();
            const moveAmount = this.moveSpeed * deltaTime;
            const moveVec = dir.multiplyScalar(moveAmount);
            this.node.setWorldPosition(current.clone().add(moveVec));
        }
    }

    private performSweepScan(origin: Vec3, direction: Vec3): number {
        const ray = new geometry.Ray(origin.x, origin.y, origin.z, direction.x, direction.y, direction.z);
        const halfExtent = new Vec3(0.5, 0.5, 0.5);
        const orientation = new Quat();
        const mask = 0xffffffff;
        const queryTrigger = false; // Không quét trigger để tránh false positive

        // Spawn visual để hiển thị vùng quét
        this.spawnSweepBoxVisual(origin, direction, halfExtent, this.maxScanDistance);

        //Thử phương pháp 2: sweepBox (lấy tất cả kết quả)
        const hasHit = PhysicsSystem.instance.sweepBox(ray, halfExtent, orientation, mask, this.maxScanDistance, queryTrigger);
        console.log(`SweepBox result: ${hasHit}`);

        if (hasHit) {
            const results = PhysicsSystem.instance.sweepCastResults;
            console.log(`Found ${results.length} hits`);

            let closestDistance = this.maxScanDistance;
            let foundValidHit = false;

            for (let i = 0; i < results.length; i++) {
                const hit = results[i];
                console.log(`Hit ${i}: node=${hit.collider.node?.name}, distance=${hit.distance}, self=${hit.collider.node === this.node}`);

                // Bỏ qua va chạm với chính bản thân
                if (hit.collider.node === this.node) {
                    continue;
                }

                if (hit.distance < closestDistance) {
                    closestDistance = hit.distance;
                    foundValidHit = true;
                }
            }

            if (foundValidHit) {
                return Math.max(0, closestDistance - this.safeDistance);
            }
        }

        return this.maxScanDistance;
    }

    private spawnSweepBoxVisual(origin: Vec3, dir: Vec3, halfExtent: Vec3, maxDistance: number) {
        if (!this.drawLineByPrefab) return;

        const lineNode = instantiate(this.drawLineByPrefab);
        this.node.scene.addChild(lineNode);

        // Tính toán kích thước và vị trí của visual
        lineNode.setScale(new Vec3(
            halfExtent.x * 2,
            halfExtent.y * 2,
            maxDistance
        ));

        // Đặt vị trí: origin + dir * maxDistance/2 (tâm đường quét)
        const midPoint = new Vec3();
        Vec3.scaleAndAdd(midPoint, origin, dir, maxDistance / 2);
        lineNode.setWorldPosition(midPoint);

        // Xoay theo hướng dir
        const lookAtPos = new Vec3();
        Vec3.add(lookAtPos, origin, dir);
        lineNode.lookAt(lookAtPos);

        // Tự động xóa visual sau 2 giây để tránh spam
        this.scheduleOnce(() => {
            if (lineNode && lineNode.isValid) {
                lineNode.destroy();
            }
        }, 2);
    }

    onClick() {
        if (!this.startNode || this.moveState !== MoveState.Idle) return;

        const dir = new Vec3(0, 0, 1).normalize();
        this.moveDirection.set(dir);

        const origin = this.node.worldPosition.clone();
        const safeDistance = this.performSweepScan(origin, dir);

        // hitPos = điểm va chạm (A + dir * hitDistance)
        const hitDistance = (safeDistance < this.maxScanDistance)
            ? safeDistance + this.safeDistance -0.5 // cộng lại để ra đúng vị trí va chạm
            : this.maxScanDistance;

        this.hitPos = origin.clone().add(dir.clone().multiplyScalar(hitDistance));
        this.safePos = origin.clone().add(dir.clone().multiplyScalar(safeDistance));

        this.startPosition = origin.clone();
        this.distanceMoved = 0;
        this.targetDistance = hitDistance;
        this.moveState = MoveState.Forward;
    }

    // Phương thức helper để dừng di chuyển từ bên ngoài nếu cần
    public stopMovement() {
        this.isMoving = false;
    }

    // Phương thức để thiết lập khoảng cách quét tối đa
    public setMaxScanDistance(distance: number) {
        this.maxScanDistance = Math.max(1, distance);
    }

    // Phương thức để thiết lập khoảng cách an toàn
    public setSafeDistance(distance: number) {
        this.safeDistance = Math.max(0.1, distance);
    }
}