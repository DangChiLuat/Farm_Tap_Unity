import { macro } from "cc";
import { BallType } from "../Config/GameConfig";
import { Utils } from "../Config/Utils";


export default class MainData {
    private static mainData: MainData | null = null;

    public static instance(): MainData {
        if (!MainData.mainData) {
            MainData.mainData = new MainData();
        }
        return MainData.mainData;
    }

    isPlaySound = true;
    constructor() {
    }
}
