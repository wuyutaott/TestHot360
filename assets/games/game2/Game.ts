import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    onBtnBack() {
        director.loadScene('Lobby');
    }
}

