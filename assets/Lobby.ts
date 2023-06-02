import { _decorator, Component, Label, Node } from 'cc';
import { Tools } from './src/Tools';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    @property(Label)
    ver: Label = null;

    start() {
        let localVersion = Tools.getLocalVersion('main');        
        this.ver.string = localVersion;
    }

    update(deltaTime: number) {
        
    }

    onGameClick(btn, id) {
        console.log('id = ', id);
    }
}

