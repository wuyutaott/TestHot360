import { _decorator, Component, director, Label, Node } from 'cc';
import { Tools } from '../../src/Tools';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    @property(Label)
    ver: Label = null;

    start() {
        let localVersion = Tools.getLocalVersion('game2');        
        this.ver.string = localVersion;
    }

    update(deltaTime: number) {
        
    }

    onBtnBack() {
        director.loadScene('Lobby');
    }
}

