// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, AudioSource, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass
export default class Singleton<T> extends Component{
    public static Instance<T>(c: {new(): T; }) : T{
        if (this._instance == null){
            this._instance = new c();
        }
        return this._instance;
    }
    public static _instance = null;
}
