import { _decorator, Component, native, Node } from 'cc';
import { Tools } from './src/Tools';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        let path = native.fileUtils.getWritablePath();
        console.log('WritablePath = ', path);

        let ver = Tools.getVersion('main');
        console.log('ver = ', ver);
    }

    update(deltaTime: number) {
        
    }
}

