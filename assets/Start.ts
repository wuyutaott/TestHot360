import { _decorator, Component, native, Node, sys } from 'cc';
import { Tools } from './src/Tools';
import Http from './src/Http';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    async start() {
        if (sys.isNative) {
            let path = native.fileUtils.getWritablePath();
            console.log('WritablePath = ', path);
        }
        
        let changelog = await this.reqChangeLog();
        this.checkHotUpdate('main', changelog);
    }

    // 请求changelog
    async reqChangeLog() {
        return new Promise((resolve, reject) => {
            Http.Get('http://127.0.0.1/assets/changelog.json', (err, response) => {
                if (err) {
                    console.log(err);
                    reject();
                    return;
                }
                let obj = JSON.parse(response);
                resolve(obj);
            });
        });
    }

    // 检测是否需要热更新
    checkHotUpdate(module: string, changelog): boolean {
        let m = changelog[module];
        console.log(`${module}.remoteVersion = ${m.ver}`);

        let localVersion = Tools.getLocalVersion(module);
        console.log(`${module}.localVersion = ${localVersion}`);

        return false;
    }
}

