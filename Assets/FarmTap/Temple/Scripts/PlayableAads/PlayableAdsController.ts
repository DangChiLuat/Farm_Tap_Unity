import { _decorator, Component, Button, macro } from 'cc';
import MainData from './MainData';
import super_html_playable from './super_html/super_html/super_html_playable';
import { GlobalEvent } from '../Event/GlobalEvent';

const { ccclass, property, executionOrder } = _decorator;
const androidUrl = "https://play.google.com/store/apps/details?id=com.farm.tap.jam";
const iosUrl = "https://apps.apple.com/us/app/farm-out/id6752285531";

@ccclass('PlayableAdsController')
@executionOrder(0)

export default class PlayableAdsController extends Component {

    isBuild: boolean = true;
    button: Button = null;
    isActiveAutoStore: boolean = false;
    onLoad() {
        let IronSource = !!((window as any).IronSource);
        //SoundManager.instance().setAllVolume(!IronSource);

        macro.ENABLE_MULTI_TOUCH = false;
        macro.ENABLE_TRANSPARENT_CANVAS = true;
        // if (this.isBuild) console.log = () => { };
        this.addButton();
    }
    protected onEnable(): void {
        GlobalEvent.instance().addEventListener(GlobalEvent.OPEN_STORE, this.openStore, this);
        GlobalEvent.instance().addEventListener(GlobalEvent.ACTIVE_AUTO_OPEN_STORE, this.activeAutoStore, this);
        super_html_playable.set_google_play_url(androidUrl);
        super_html_playable.set_app_store_url(iosUrl);
    }

    protected onDisable(): void {
        GlobalEvent.instance().removeEventListener(GlobalEvent.OPEN_STORE, this.openStore, this);
        GlobalEvent.instance().removeEventListener(GlobalEvent.ACTIVE_AUTO_OPEN_STORE, this.activeAutoStore, this);
    }

    start() {
        if ((window as any).mintegral) window.gameReady && window.gameReady();
    }

    addButton() {
        this.button = this.node.addComponent(Button);
        this.node.on('click', this.click, this);
        this.button.enabled = false;
        this.isActiveAutoStore = false;
    }
    openStore() {
        console.log("open store");

        this.onHandlerGotoStore();

    }
    click() {
        console.log("autoOpenStore");
        GlobalEvent.instance().dispatchEvent(GlobalEvent.OPEN_STORE)
    }
    activeAutoStore() {
        this.isActiveAutoStore = true;
        this.button.enabled = true;

    }


    onHandlerGotoStore() {

        // let linkStore: string = this.getLinkStore();
        // window.open(linkStore);

        // super_html_playable.game_end();
        // super_html_playable.download();
        this.installHandle();

        // return;
        // try
        // { let linkStore: string = this.getLinkStore();
        //     window.open(linkStore);
        //     this.installHandle();
        // } catch (error) {
        //     let linkStore: string = this.getLinkStore();
        //     window.open(linkStore);
        // }
    }

    public installHandle(): void {
        super_html_playable.game_end();
        super_html_playable.download();
    }

    getLinkStore() {
        let mobile = this.getMobileOS();
        switch (mobile) {
            case "android":
                return androidUrl;
            case "iOS":
                return iosUrl;
            default:
                return androidUrl;
        }
    }
    getMobileOS(): string {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/android|Android/i.test(userAgent)) {
            return "android";
        } else if (/iPad|iPhone|iPod|Macintosh/.test(userAgent) && !(window as any).MSStream) {
            return "iOS";
        }
        return "unknown";
    }
}


// window.audioIronSource=false;
