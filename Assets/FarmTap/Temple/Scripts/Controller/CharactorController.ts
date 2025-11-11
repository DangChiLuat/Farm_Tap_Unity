import { _decorator, BoxCollider, Camera, Component, geometry, instantiate, Node, ParticleSystem, PhysicsSystem, Prefab, Quat, SkeletalAnimation, tween, Vec3, easing, find, screen, CCBoolean, Collider, RigidBody } from 'cc';
import { CharacterStateType } from '../Enum/CharacterStateType';
import { ICharacterState } from '../State/ICharacterState';
import { MoveState } from '../State/MoveState';
import { IdleState } from '../State/IdleSate';
import { ImpactState } from '../State/impactState';
import { Gamecontroller } from './Gamecontroller';
import { Sound, SoundManager } from '../Utility/SoundManager';
import { WayPoint } from '../WayPoint/WayPoint';
const { ccclass, property } = _decorator;

@ccclass('CharactorController')
export class CharactorController extends Component {
    @property(Node)
    startNode: Node = null;


    @property(Node)
    player: Node = null;
    @property
    moveSpeed: number = 10;
    @property
    safeDistance: number = 1.0;
    @property(Node)
    posEffect: Node = null;
    @property(Node)
    boom: Node = null;
    @property(Number)
    public distanceToStop: number = 0.3;
    @property(CCBoolean)
    isSheep: boolean = false;
    @property(CCBoolean)
    isCow: boolean = false;
    @property(CCBoolean)
    isPig: boolean = false;
    @property(CCBoolean)
    public isOneWay: boolean = false;

    @property(ParticleSystem)
    smokeEffect: ParticleSystem = null;
    @property(ParticleSystem)
    dustEffect: ParticleSystem = null;

    public wayPoint: WayPoint = null;

    private _currentState: ICharacterState;
    private _currentStateType: CharacterStateType;
    private _states: Map<CharacterStateType, ICharacterState>;

    public isMoving: boolean = false;
    public moveDirection: Vec3 = new Vec3();
    public startPosition: Vec3 = new Vec3();
    public distanceMoved: number = 0;
    public targetDistance: number = 0;
    private maxScanDistance: number = 30;
    public checkDistance: number = 0;

    public safePos: Vec3 = new Vec3();
    public hitPos: Vec3 = new Vec3();
    public currentPosBoom: Vec3 = new Vec3();

    private _isInImpact: boolean = false;
    public isHaveBox: boolean = true;
    public isSheepMove: boolean = false;
    public isHitWayPoint: boolean = false;
    public isChar: boolean = false;
    public isCanNotInteract: boolean = false;

    private _skeleton: SkeletalAnimation;
    public nodeClosest: Node;

    protected start(): void {
        this._skeleton = this.player.getComponent(SkeletalAnimation);
        this.initializeStates();
        this.setPivotSmoke();
        // if (this.isSheep) {
        //     this.scheduleOnce(() => {
        //         this.onClick();
        //     },1.5)
        // }
    }

    private _deltaTime: number = 0;

    public getDeltaTime(): number {
        return this._deltaTime;
    }



    update(dt: number) {
        this._deltaTime = dt;

        if (this._currentState) {
            this._currentState.update(this);
        }

        if (this._currentStateType === CharacterStateType.IDLE) return;
    }

    setPivotSmoke() {
        let angleParent = (this.node.parent.eulerAngles.y + 360) % 360;


        let angle = (this.node.eulerAngles.y + 360) % 360;
        this.dustEffect.startRotation3D = true;
        let deg = (angle + angleParent + 90) * Math.PI / 180;
        this.dustEffect.startRotationX.constant = 0;
        this.dustEffect.startRotationY.constant = 0;
        this.dustEffect.startRotationZ.constant = deg;
    }

    private initializeStates() {
        this._states = new Map();
        this._states.set(CharacterStateType.IDLE, new IdleState());
        this._states.set(CharacterStateType.RUN, new MoveState());
        this._states.set(CharacterStateType.IMPACT, new ImpactState());

        this.changeState(CharacterStateType.IDLE);
    }

    public changeState(newStateType: CharacterStateType) {
        if (this._currentStateType === newStateType) return;
        let newState = this._states.get(newStateType);
        if (!newState) return;
        if (this._currentState) {
            this._currentState.exit(this);
        }
        this._currentState = newState;
        this._currentStateType = newStateType;

        if (newStateType === CharacterStateType.IMPACT) {
            this._isInImpact = true;
        } else if (newStateType === CharacterStateType.IDLE) {
            this._isInImpact = false;
        }

        this._currentState.enter(this);
    }

    public getCurrentState(): ICharacterState {
        return this._currentState;
    }

    public getCurrentStateType(): CharacterStateType {
        return this._currentStateType;
    }

    public playAnimation(animName: string) {
        if (this._skeleton && animName) {
            this._skeleton.play(animName);
        }
        return null;
    }

    public playRandomIdleAnimation() {
        if (!this._skeleton) return;

        const idleAnimations = [
            CharacterStateType.IDLE,
            // CharacterStateType.IDLE2,
            // CharacterStateType.IDLE3
        ];

        const randomIndex = Math.floor(Math.random() * idleAnimations.length);
        const selectedAnimation = idleAnimations[randomIndex];

        this._skeleton.play(selectedAnimation);

    }
    public playIdleAnimation(useRandom: boolean = true, specificIdle?: CharacterStateType) {
        if (!this._skeleton) return;

        if (useRandom) {
            this.playRandomIdleAnimation();
        } else {
            const idleToPlay = specificIdle || CharacterStateType.IDLE;
            this._skeleton.play(idleToPlay);
        }
    }

    public handleImpactAnimationEnd() {
        if (!this._skeleton) return;
        const animationState = this._skeleton.getState(CharacterStateType.IMPACT);
        Gamecontroller.instance.playEffect(this.posEffect);
        if (animationState) {
            const duration = animationState.duration;

            this.scheduleOnce(() => {
                if (this._currentStateType === CharacterStateType.IMPACT) {
                    Gamecontroller.instance.faceEffect.playAnimationFace(this.node, "Angry");
                    this.dustEffect.play();
                    this.changeState(CharacterStateType.IDLE);
                    Gamecontroller.instance.checkCharCanMove();
                    if (!this.isSheep) return;
                    //SoundManager.Instance(SoundManager).playSound("fart");
                }
            }, duration / 8);
        }
    }

    private performSweepScan(origin: Vec3, direction: Vec3): number {
        const ray = new geometry.Ray(origin.x, origin.y, origin.z, direction.x, direction.y, direction.z);
        const mask = 0xffffffff; // Quét tất cả layer
        const queryTrigger = false;

        const hasHit = PhysicsSystem.instance.raycastClosest(ray, mask, this.maxScanDistance, queryTrigger);

        if (!hasHit) {
            Gamecontroller.instance.checkCharCanMove();
            Gamecontroller.instance.faceEffect.playAnimationFace(this.node, "Laugh");
            this.isHaveBox = false;
            this.isSheepMove = true;
            let a = this.node.getComponent(BoxCollider);
            if (a) a.destroy()
            this.scheduleOnce(() => {
                this.checkAndDestroyIfOutOfViewport();
            }, 0.1);
        }
        else {
            const result = PhysicsSystem.instance.raycastClosestResult;

            this.checkDistance = result.distance;
            let closestDistance = this.maxScanDistance;
            let foundValidHit = false;

            this.nodeClosest = result.collider.node;

            const otherController = result.collider.node.getComponent(CharactorController);
            const wayPoint = result.collider.node.parent.parent.getComponent(WayPoint);
            if (otherController) {
                if (result.distance < closestDistance) {
                    closestDistance = result.distance;
                    foundValidHit = true;
                    this.isChar = true;
                }
            } else if (wayPoint) {
                Gamecontroller.instance.checkCharCanMove();
                Gamecontroller.instance.cointEffect.playCoinEffect(this.node);
                Gamecontroller.instance.updateProgressBar();
                this.isHitWayPoint = true;
                this.wayPoint = wayPoint;
                this.node.getComponent(RigidBody).group = 16;
                //wayPoint.moveToNextWayPoint(this.node)
                if (this.isOneWay) {
                    return result.distance + 0.1;
                }
                else {
                    return result.distance + this.distanceToStop;
                }
            }
            else {
                this.node.getComponent(Collider).enabled = false;
                if (result.distance < closestDistance) {
                    closestDistance = result.distance;
                    foundValidHit = true;
                    this.scheduleOnce(() => {
                        Gamecontroller.instance.checkCharCanMove();
                        this.node.destroy();
                    }, (closestDistance / this.moveSpeed));
                }
            }

            if (foundValidHit) {
                return Math.max(0, closestDistance - this.safeDistance);
            }
        }
        return this.maxScanDistance;
    }

    public setupMovement(origin: Vec3, direction: Vec3) {
        // Reset wayPoint flag
        this.isHitWayPoint = false;

        this.moveDirection.set(direction);
        this.moveDirection.normalize();

        const safeDistance = this.performSweepScan(origin, this.moveDirection);

        const hitDistance = (safeDistance < this.maxScanDistance)
            ? safeDistance + this.safeDistance
            : this.maxScanDistance;

        this.hitPos = origin.clone().add(this.moveDirection.clone().multiplyScalar(hitDistance));
        this.safePos = origin.clone().add(this.moveDirection.clone().multiplyScalar(safeDistance));

        this.startPosition = origin.clone();
        this.distanceMoved = 0;
        this.targetDistance = hitDistance - 0.5;
    }

    public getClosestNode(nodeClose: Node) {
        if (!nodeClose || !nodeClose.getComponent(CharactorController)) return;
        if (this.isSheep) {
            SoundManager.Instance(SoundManager).playSound("Uh_1");
        }
        if (this.isCow) {
            SoundManager.Instance(SoundManager).playSound("Uh_1");
        }
        if (this.isPig) {
            SoundManager.Instance(SoundManager).playSound("pig_va_cham");
        }
        const currentPosOther = nodeClose.position.clone();
        if (this.boom != null) {
            this.currentPosBoom = this.boom.position.clone();
        }

        //Gamecontroller.instance.playAnimationFace(nodeClose, "Angry");
        if (this.node.eulerAngles.y == 0 || this.node.eulerAngles.y == 180) {

            tween(nodeClose)
                .to(0.05, { position: new Vec3(currentPosOther.x, currentPosOther.y, currentPosOther.z + 0.2) }, { easing: easing.sineOut })
                .to(0.05, { position: currentPosOther }, { easing: easing.backOut })
                .start();
            if (this.boom != null) {
                tween(this.boom)
                    .to(0.05, { position: new Vec3(this.currentPosBoom.x + 0.2, this.currentPosBoom.y, this.currentPosBoom.z) }, { easing: easing.sineOut })
                    .to(0.05, { position: this.currentPosBoom }, { easing: easing.backOut })
                    .start();
            }
        }
        else {
            tween(nodeClose)
                .to(0.05, { position: new Vec3(currentPosOther.x + 0.2, currentPosOther.y, currentPosOther.z) }, { easing: easing.sineOut })
                .to(0.05, { position: currentPosOther }, { easing: easing.backOut })
                .start();
            if (this.boom != null) {
                tween(this.boom)
                    .to(0.05, { position: new Vec3(this.currentPosBoom.x, this.currentPosBoom.y, this.currentPosBoom.z + 0.2) }, { easing: easing.sineOut })
                    .to(0.05, { position: this.currentPosBoom }, { easing: easing.backOut })
                    .start();
            }
        }

        this.nodeClosest = nodeClose;
    }
    onClick() {
        if (this._currentStateType !== CharacterStateType.IDLE) {
            return;
        }

        const direction = new Vec3();
        Vec3.negate(direction, this.startNode.forward);
        const origin = this.startNode.worldPosition.clone();

        // Kiểm tra xem có thể di chuyển không
        const canMove = this.checkMove();
        if (!canMove) {
            console.log("Movement blocked by obstacle with group 16");
            return;
        }

        this.setupMovement(origin, direction);
        this.changeState(CharacterStateType.RUN);

    }

    public stopMovement() {
        this.isMoving = false;
    }

    public checkMove() {
        const origin = this.startNode.worldPosition.clone();
        const direction = new Vec3();
        Vec3.negate(direction, this.startNode.forward);
        direction.normalize();

        const ray = new geometry.Ray(origin.x, origin.y, origin.z, direction.x, direction.y, direction.z);
        const mask = 0xffffffff;
        const queryTrigger = false;

        const hasHit = PhysicsSystem.instance.raycast(ray, mask, this.maxScanDistance, queryTrigger);

        if (hasHit) {
            const results = PhysicsSystem.instance.raycastResults;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];

                if (result.collider.node.getComponent(RigidBody)) {
                    const rigidBody = result.collider.node.getComponent(RigidBody);

                    if (rigidBody.group === 16) {
                        return false;
                    }
                }
            }

            return true;
        } else {
            return true;
        }
    }

    public get isInImpact(): boolean {
        return this._isInImpact;
    }

    private isNodeOutOfViewport(): boolean {
        const cameraNode = find("Main Camera");
        if (!cameraNode) return false;

        const camera = cameraNode.getComponent(Camera);
        if (!camera) return false;
        const worldPos = this.node.worldPosition;
        const screenPos = camera.worldToScreen(worldPos);
        const { width, height } = screen.windowSize;
        const margin = -30;
        return screenPos.x < -margin ||
            screenPos.x > width + margin ||
            screenPos.y < -margin ||
            screenPos.y > height + margin;
    }

    private checkAndDestroyIfOutOfViewport(): void {
        if (this.isNodeOutOfViewport()) {
            //console.log("Node is out of viewport, destroying...");
            Gamecontroller.instance.checkCharCanMove();
            this.node.destroy();
        } else {
            this.scheduleOnce(() => {
                this.checkAndDestroyIfOutOfViewport();
            });
        }
    }

    public canMove(): boolean {
        if (!this.node || !this.node.isValid) {
            return false;
        }
        const origin = this.startNode.worldPosition.clone();
        const direction = new Vec3();
        Vec3.negate(direction, this.startNode.forward);
        direction.normalize();

        const ray = new geometry.Ray(origin.x, origin.y, origin.z, direction.x, direction.y, direction.z);
        const mask = 0xffffffff & ~(1 << 4);
        const queryTrigger = false;

        const hasHit = PhysicsSystem.instance.raycastClosest(ray, mask, this.maxScanDistance, queryTrigger);

        if (!hasHit) {
            return true;
        }

        const result = PhysicsSystem.instance.raycastClosestResult;
        const currentDistance = result.distance;
        return currentDistance >= this.safeDistance;
    }


}