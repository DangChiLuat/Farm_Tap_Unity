import { _decorator, Camera, CCFloat, Component, Game, log, math, Node, screen, Vec3, view, Widget } from 'cc';
import { Gamecontroller } from './Controller/Gamecontroller';
const { ccclass, property } = _decorator;

@ccclass('ResizeCam')
export class ResizeCam extends Component {
    @property(Camera)
    camera: Camera = null;



    @property(Node)
    map: Node = null;
    @property(Node)
    button: Node = null;
    @property(Node)
    gameLose: Node = null;
    @property(Node)
    button1: Node = null;
    @property(Node)
    gameWin: Node = null;
    @property(Node)
    progessBar: Node = null;
    @property(Node)
    txtDraw: Node = null;
    @property(Node)
    bgPRT: Node = null;
    @property(Node)
    bgLC: Node = null;
    @property(Node)
    UILC: Node = null;
    @property(Node)
    UIPRT: Node = null;
    initPosTopBar: Vec3 = new Vec3();
    ratio: number = 1.5;
    public isLands: boolean = false;
    defaultVerticalRatio: number = 1080 / 1920;
    defaultHorizontalRatio: number = 1920 / 1080;

    // defaultCamVertical: number = 70;
    // defaultCamHorizontal: number = 55;

    defaultCamVertical: number = 12.5;
    defaultCamHorizontal: number = 11.5;

    verticalRatio: number = 0.98;
    horizontalRatio: number = 0.65;

    onEnable() {
        //  if (!Gamecontroller.instance.isCam) return;
        view['_resizeCallback'] = () => {
            this.checkAndRotate();
            // Log orientation khi thay đổi
            console.log("Orientation changed - Is landscape:", this.isLandscape());
            console.log("Aspect ratio:", this.getAspectRatio());
        };

    }

    protected onLoad(): void {

        console.log('this.initPosTopBar :', this.initPosTopBar);
        //if (!Gamecontroller.instance.isCam) return;
        this.checkAndRotate();
    }

    // Method để kiểm tra orientation
    isLandscape(): boolean {
        const { width, height } = screen.windowSize;
        return width > height;
    }

    getAspectRatio(): number {
        const { width, height } = screen.windowSize;
        return width / height;
    }

    checkAndRotate() {
        //if (!Gamecontroller.instance.isCam) return;
        // console.log('checkAndRotate');

        const { width, height } = screen.windowSize;
        // console.log(width / height)
        // console.log("width: " + width);
        // console.log("height: " + height);
        if (width > height) {
            log("landscape");
            this.bgPRT.active = false;
            this.bgLC.active = true;
            this.UILC.active = true;
            this.UIPRT.active = false;
            this.map.setPosition(0, 0, -2);
            this.map.setScale(1, 1, 1);
            this.button.setScale(0.5, 0.5, 0.5);
            this.button1.setScale(0.5, 0.5, 0.5);
            this.gameLose.setScale(0.5, 0.5, 0.5);
            this.gameWin.setScale(0.5, 0.5, 0.5);
            this.txtDraw.setScale(0.5, 0.5, 0.5);
            const widget = this.progessBar.getComponent(Widget);
            widget.isAlignTop = true;
            widget.top = 0.04;
            this.progessBar.setScale(0.5, 0.5, 0.5);
            if (width / height < 1.2) {

                let newRatio = this.defaultCamHorizontal / ((width / height) / this.defaultHorizontalRatio) * this.horizontalRatio;
                console.log('newRatio :', newRatio);
                this.camera.fov = newRatio;
            }
            else {
                this.camera.fov = this.defaultCamHorizontal;
                this.camera.orthoHeight = this.defaultCamHorizontal;

            }

            this.isLands = true;

        } else {
            log("portrait");

            this.bgPRT.active = true;
            this.UILC.active = false;
            this.bgLC.active = false;
            console.log('Screen height:', height, 'Screen width:', width);
            if (width >= 1000 && height >= 1000 && width < height) {
                this.map.setScale(1, 1, 1);
                console.log('Larger than 1000');
                this.map.setPosition(0, 0, -1);
                this.UIPRT.active = false;
            }
            else {
                console.log('Smaller than 1000');
                this.map.setScale(1, 1, 1);
                this.map.setPosition(0, 0, -2);
                this.UIPRT.active = true;
            }
            this.button1.setScale(1, 1, 1);
            this.progessBar.setScale(1.3, 1.3, 1.3);
            const widget = this.progessBar.getComponent(Widget);
            widget.isAlignTop = true;
            widget.top = 0.08;
            this.gameLose.setScale(1, 1, 1);
            this.gameWin.setScale(1, 1, 1);
            this.txtDraw.setScale(1.5, 1.5, 1.5);
            if (width / height < 0.6) {
                let newRatio = this.defaultCamVertical / ((width / height) / this.defaultVerticalRatio) * this.verticalRatio;
                // this.camera.fov = newRatio;
                this.camera.orthoHeight = newRatio;
            }
            else {
                // this.camera.fov = this.defaultCamVertical;
                this.camera.orthoHeight = this.defaultCamVertical;
            }

            if (width / height < 0.5) {
                let topRatio = this.initPosTopBar.y / ((width / height) / this.defaultVerticalRatio) * this.ratio;
                console.log('topRatio :', topRatio);
            }
            this.isLands = false;
        }
    }
}