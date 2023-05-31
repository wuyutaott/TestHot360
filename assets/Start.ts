import { _decorator, Component, native, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        let path = native.fileUtils.getWritablePath();
        console.log('WritablePath = ', path);
    }

    update(deltaTime: number) {
        
    }
}

