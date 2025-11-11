import { _decorator, Component, Node } from 'cc';
import { CharactorController } from '../Controller/CharactorController';
const { ccclass, property } = _decorator;

export interface ICharacterState {
    enter(controller: CharactorController): void;
    update(controller: CharactorController): void;
    exit(controller: CharactorController): void;
}


