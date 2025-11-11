import { _decorator, Camera, Component, EventTouch, game, geometry, Input, input, Node, PhysicsSystem, Tween, Vec2, Vec3 } from 'cc';
import { CharactorController } from '../Controller/CharactorController';
import { HandControllder } from '../Controller/HandControllder';
import { Gamecontroller } from '../Controller/Gamecontroller';
import { Sound, SoundManager } from '../Utility/SoundManager';
import { CharacterStateType } from '../Enum/CharacterStateType';
import { TouchMove } from './TouchMove';
const { ccclass, property } = _decorator;
@ccclass('HandleInputListener')
export class HandleInputListener extends Component {

    @property(Camera)
    readonly cameraCom!: Camera;
    private _ray: geometry.Ray = new geometry.Ray();

    // Camera movement variables
    private _lastTouchPosition: Vec2 = new Vec2();
    private _isDragging: boolean = false;

    private _cameraMoveSpeed: number = 0.02; // Tốc độ di chuyển camera
    private _cameraSmoothing: number = 0.1; // Độ mượt mà khi di chuyển camera
    public _targetCameraPosition: Vec3 = new Vec3();

    @property(Node)
    txtTap: Node = null;
    @property(Node)
    btnPlayNow: Node = null;
    // Touch timing variables
    private _touchStartTime: number = 0;
    private _touchThreshold: number = 0.2; // 0.2 seconds
    private _isTouchMoved: boolean = false;
    private isDone = false;
    private canInteract: boolean = true;

    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        // Khởi tạo vị trí target camera
        this._targetCameraPosition.set(this.cameraCom.node.position);
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    onTouchMove(event: EventTouch) {
        return;
        //if (!Gamecontroller.instance.isCanTouch) return;
        this.hindHandMove();
        const touch = event.touch!;
        // HandControllder.instance.handMove.active = false;
        const currentTouchPosition = new Vec2(touch.getLocationX(), touch.getLocationY());

        if (this._isDragging) {
            // Đánh dấu đã có touch move
            this._isTouchMoved = true;

            // Tính toán delta movement
            const deltaX = currentTouchPosition.x - this._lastTouchPosition.x;
            const deltaY = currentTouchPosition.y - this._lastTouchPosition.y;

            const worldDeltaX = -deltaX * this._cameraMoveSpeed;
            const worldDeltaZ = deltaY * this._cameraMoveSpeed;

            // Tính toán vị trí mới
            const newTargetX = this._targetCameraPosition.x + worldDeltaX;
            const newTargetZ = this._targetCameraPosition.z + worldDeltaZ;

            // Giới hạn camera trong phạm vi cho phép
            let clampedX = 0;
            let clampedZ = 0;
            if (Gamecontroller.instance.resizeCam.isLands) {
                clampedX = Math.max(-10, Math.min(7, newTargetX));
                clampedZ = Math.max(-20, Math.min(20, newTargetZ));
            } else {
                clampedX = Math.max(-10, Math.min(7, newTargetX));
                clampedZ = Math.max(-10, Math.min(10, newTargetZ));
            }

            this._targetCameraPosition.x = clampedX;
            this._targetCameraPosition.z = clampedZ;
        }

        this._lastTouchPosition.set(currentTouchPosition);
    }

    onTouchStart(event: EventTouch) {
        if (!this.canInteract) return;
        this.hindHandMove();
        // if (!Gamecontroller.instance.isCanTouch) return;
        SoundManager.Instance(SoundManager).playTheme();
        const touch = event.touch!;

        // Bắt đầu đếm thời gian và reset trạng thái
        this._touchStartTime = Date.now();
        this._isTouchMoved = false;

        // Khởi tạo trạng thái dragging
        this._isDragging = true;

        this._lastTouchPosition.set(touch.getLocationX(), touch.getLocationY());

        this.cameraCom.screenPointToRay(touch.getLocationX(), touch.getLocationY(), this._ray);
    }

    onTouchEnd(event: EventTouch) {
        this.canInteract = false;
        this.scheduleOnce(() => {
            this.canInteract = true;
        }, 0.3);
        //if (!Gamecontroller.instance.isCanTouch) return;
        this.hindHandMove();
        this.showHandMove();
        const touch = event.touch!;
        if (this._isDragging == false) return;
        const touchDuration = (Date.now() - this._touchStartTime) / 1000;

        this.cameraCom.screenPointToRay(touch.getLocationX(), touch.getLocationY(), this._ray);
        const mask = (1 << 1);

        if (PhysicsSystem.instance.raycastClosest(this._ray, mask)) {
            console.log("Raycast hit");
            const result = PhysicsSystem.instance.raycastClosestResult;
            const nodeOther = result.collider.node;
            const hole = nodeOther.getComponent(CharactorController);

            this.txtTap.active = false;
            //this.btnPlayNow.active = true;
            if (hole && hole.getCurrentStateType() === CharacterStateType.IDLE &&
                touchDuration < this._touchThreshold) {
                hole.onClick();
                if (!Gamecontroller.instance.isVideo) {
                    HandControllder.instance.hindHand();
                }
            }
        }

        this._isDragging = false;
    }

    update(deltaTime: number) {
        // Smooth camera movement
        const currentPos = this.cameraCom.node.position;
        const newPos = new Vec3();

        Vec3.lerp(newPos, currentPos, this._targetCameraPosition, this._cameraSmoothing);
        newPos.y = currentPos.y;

        this.cameraCom.node.setPosition(newPos);
    }
    showWin() {
        this.node.active = false;
    }

    hindHandMove() {
        return;
        Gamecontroller.instance.handMove.active = false;
        this.unscheduleAllCallbacks();
    }
    showHandMove() {

        return;
        if (this.isDone) return;
        this.scheduleOnce(() => {
            Gamecontroller.instance.handMove.active = true;
            this.isDone = true;
        }, 3);
    }
}
