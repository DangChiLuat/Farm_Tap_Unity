import { _decorator } from 'cc';
import BaseEvent from './BaseEvent';
const { ccclass, property } = _decorator;

@ccclass('GlobalEvent')
export class GlobalEvent extends BaseEvent {
    private static event: GlobalEvent | null = null;
    private constructor() {
        super();
    }

    public static instance(): GlobalEvent {
        if (!GlobalEvent.event) {
            GlobalEvent.event = new GlobalEvent();
        }
        return GlobalEvent.event;
    }

    static readonly START_GAME = "GlobalEvent.START_GAME";
    static readonly SHOW_LOSE = "GlobalEvent.SHOW_LOSE";
    static readonly SHOW_WIN = "GlobalEvent.SHOW_WIN";
    static readonly OPEN_STORE = "GlobalEvent.OPEN_STORE";
    static readonly ACTIVE_AUTO_OPEN_STORE = "GlobalEvent.ACTIVE_AUTO_OPEN_STORE";
    static readonly CHECK_PLAYABLE = "GlobalEvent.CHECK_PLAYABLE";
    static readonly SHOW_TUTORIAL = "GlobalEvent.SHOW_TUTORIAL";
    static readonly CLEAR_TUTORIAL = "GlobalEvent.CLEAR_TUTORIAL";
    static readonly END_GAME = "GlobalEvent.END_GAME";
    static readonly SHOW_GUIDE = "GlobalEvent.SHOW_GUIDE";
    static readonly HIDE_GUIDE = "GlobalEvent.HIDE_GUIDE";


}
