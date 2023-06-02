import { _decorator, Component, Label, Node } from 'cc';
import { GameState } from './Define';
const { ccclass, property } = _decorator;

@ccclass('GameItem')
export class GameItem extends Component {
    state: GameState;

    start() {

    }

    setState(state: GameState) {
        this.state = state;

        let labelStatus = this.node.getChildByName('Status');
        switch(state) {
            case GameState.OK:
                labelStatus.getComponent(Label).string = 'OK';
                break;
            case GameState.NEW_VERSION:
                labelStatus.getComponent(Label).string = '有更新';
                break;
            case GameState.UNINSTALL:
                labelStatus.getComponent(Label).string = '未下载';
                break;
        }  
    }
}

