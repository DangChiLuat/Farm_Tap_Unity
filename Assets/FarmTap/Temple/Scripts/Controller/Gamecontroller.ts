import { _decorator, Component, instantiate, Label, Node, ParticleSystem, Prefab, ProgressBar, SpriteFrame, tween, Camera, UITransform, Vec3, find, Animation, CCBoolean } from 'cc';
import { CharactorController } from './CharactorController';
import { HandControllder } from './HandControllder';
import { SoundManager } from '../Utility/SoundManager';
import { ResizeCam } from '../ResizeCam';
import { GlobalEvent } from '../Event/GlobalEvent';
import { CoinEffect } from '../Effect/CoinEffect';
import { FaceEffect } from '../Effect/FaceEffect';
const { ccclass, property } = _decorator;

@ccclass('Gamecontroller')
export class Gamecontroller extends Component {
    public static instance: Gamecontroller = null;

    @property(Prefab)
    effectPrefab: Prefab = null;

    public  POOL_SIZE = 5;

    @property(Node)
    gameLose: Node = null;
    @property(Node)
    gameWin: Node = null;
    @property(Node)
    map: Node = null;
    @property(ProgressBar)
    progressBar: ProgressBar = null;
    @property(Label)
    txtProgress: Label = null;
    @property(Label)
    txtCoin: Label = null;
    @property(CoinEffect)
    cointEffect: CoinEffect = null;
    @property(FaceEffect)
    faceEffect: FaceEffect = null;

    @property(ResizeCam)
    resizeCam: ResizeCam = null;
    @property(Node)
    handMove: Node = null;
    @property(CCBoolean)
    isVideo: boolean = false;
    @property(CCBoolean)
    isCam: boolean = false;
    @property(CCBoolean)
    isCanInteracte: boolean = true;
    @property([Node])
    listCharacter: Node[] = [];
    public movableCharacters: Node[] = [];
    @property([SpriteFrame])
    number: SpriteFrame[] = [];

    totalCharacterCount: number = 0;

    private effectPool: Node[] = [];

    public countMove = 0;

    public isEndGame: boolean = false;
    public isCanTouch: boolean = false;
    public coin: number = -5;
    protected start(): void {
        this.progressBar.progress = 0;
        this.scheduleOnce(() => {
            this.initializeMovableCharacters();
            this.updateProgressBar();
        }, 0.1);
    }
    protected onLoad(): void {
        Gamecontroller.instance = this;
        if (!Gamecontroller.instance) {
            Gamecontroller.instance = this;
        }
        this.initializeEffectPools();
        this.faceEffect.createEffectInstance();

        this.map.children.forEach(generateDataNode => {
            generateDataNode.children.forEach(skModelNode => {
                const charactorController = skModelNode.getComponent(CharactorController);
                if (charactorController) {
                    this.listCharacter.push(skModelNode);
                }
            });
        });

        if (this.totalCharacterCount === 0) {
            this.totalCharacterCount = this.listCharacter.length;
        }
    }

    private initializeEffectPools(): void {
        // Khởi tạo effect pool
        if (this.effectPrefab) {
            for (let i = 0; i < this.POOL_SIZE; i++) {
                const effect = instantiate(this.effectPrefab);
                this.node.addChild(effect);
                effect.active = false;
                this.effectPool.push(effect);
            }
        }
    }



    private getAvailableEffect(): Node | null {
        for (const effect of this.effectPool) {
            if (!effect.active) {
                return effect;
            }
        }
        return null;
    }

    private getGlowFromEffect(effect: Node): Node | null {
        if (!effect) return null;
        for (let i = 0; i < effect.children.length; i++) {
            const child = effect.children[i];
            if (child.name.toLowerCase().includes('glow') ||
                child.getComponent(ParticleSystem)) {
                return child;
            }
        }
        return null;
    }

    private resetEffect(effect: Node): void {
        if (!effect) return;
        const particleSystem = effect.getComponent(ParticleSystem);
        if (particleSystem) {
            particleSystem.stop();
            particleSystem.clear();
        }
    }




    playEffect(position: Node) {
        const effect = this.getAvailableEffect();

        if (!effect) {
            return;
        }

        const glow = this.getGlowFromEffect(effect);

        this.resetEffect(effect);
        if (glow) this.resetEffect(glow);

        effect.active = true;
        const worldPos = position.getWorldPosition();
        effect.setPosition(worldPos);

        const particleSystem = effect.getComponent(ParticleSystem);
        const particleGlow = glow ? glow.getComponent(ParticleSystem) : null;

        if (particleSystem) particleSystem.play();
        if (particleGlow) particleGlow.play();
        this.scheduleOnce(() => {
            effect.active = false;
        }, 0.2);
    }
    public updateProgressBar(): void {
        if (this.isVideo) return;
        if (this.totalCharacterCount === 0) {
            this.progressBar.progress = 0;
            return;
        }

        const charactersRemoved = this.totalCharacterCount - this.listCharacter.length;
        const progress = charactersRemoved / this.totalCharacterCount;

        // Đảm bảo progress trong khoảng [0, 1]
        this.progressBar.progress = Math.max(0, Math.min(1, progress));



        this.txtProgress.string = `${Math.round(this.progressBar.progress * 100)}%`;

        this.coin += 5;
        this.txtCoin.string = "Target : " + `${this.coin}` + "/450";
        // if (this.coin >= 330) {
        //     GlobalEvent.instance().dispatchEvent(GlobalEvent.ACTIVE_AUTO_OPEN_STORE);
        // }
    }

    public checkCharCanMove() {
        this.scheduleOnce(() => {
            let contCharCanMove = 0;
            this.movableCharacters = [];

            for (let i = this.listCharacter.length - 1; i >= 0; i--) {
                const characterNode = this.listCharacter[i];

                if (!characterNode || !characterNode.isValid) {
                    this.listCharacter.splice(i, 1);
                    continue;
                }
                const charactorController = characterNode.getComponent(CharactorController);
                if (!charactorController) {
                    this.listCharacter.splice(i, 1);
                    continue;
                }
                const canMove = charactorController.canMove();

                if (canMove) {
                    contCharCanMove++;
                    this.movableCharacters.push(characterNode);
                }
            }

            //this.updateProgressBar();

            if (contCharCanMove === 0 && this.listCharacter.length != 0) {
                if (Gamecontroller.instance.isVideo) return;
                this.gameLose.active = true;
                this.isEndGame = true;
                SoundManager.Instance(SoundManager).playSound("Level_lose");
            }
            if (this.listCharacter.length === 0) {
                if (Gamecontroller.instance.isVideo) return;
                SoundManager.Instance(SoundManager).playSound("winning");
                this.gameWin.active = true;
                this.progressBar.node.active = false;
            }
        }, 0.05);
    }

    private initializeMovableCharacters(): void {
        this.movableCharacters = [];

        for (const characterNode of this.listCharacter) {
            if (!characterNode || !characterNode.isValid || !characterNode.active) {
                continue;
            }

            const characterController = characterNode.getComponent(CharactorController);
            if (!characterController) {
                continue;
            }

            if (characterController.canMove()) {
                this.movableCharacters.push(characterNode);
            }
        }

        console.log(`Initialized ${this.movableCharacters.length} movable characters`);

        if (HandControllder.instance) {
            HandControllder.instance.startTutorial();
        }
    }

    showWin() {
        SoundManager.Instance(SoundManager).playSound("winning");
        this.gameWin.active = true;
        this.progressBar.node.active = false;
    }
}
