import { _decorator, Component, director, native, Node, sys } from 'cc';
import { Tools } from './src/Tools';
import Http from './src/Http';
import HotUpdate from './src/HotUpdate';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    async start() {
        if (sys.isNative) {
            let path = native.fileUtils.getWritablePath();
            console.log('WritablePath = ', path);

            let changelog = await this.reqChangeLog();
            let updateFlag = this.checkHotUpdate('main', changelog);
            if (updateFlag) {
                // 需要更新大厅                
                // this.doHotUpdate();
            } else {
                // 已经是最新版本
                director.loadScene('Lobby');
            }
        }
        else {
            director.loadScene('Lobby');
        }
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
        let remoteVersion = m.ver;
        console.log(`${module}.remoteVersion = ${remoteVersion}`);

        let localVersion = Tools.getLocalVersion(module);
        console.log(`${module}.localVersion = ${localVersion}`);

        return Tools.versionCompare(remoteVersion, localVersion) > 0;
    }

    // 开始热更新
    doHotUpdate() {
        let hotUpdate: HotUpdate = new HotUpdate('main', (name: string, event: native.EventAssetsManager) => {
            switch (event.getEventCode()) {
                case native.EventAssetsManager.UPDATE_PROGRESSION: // 进度                    
                    if (event.getPercentByFile()) {                        
                        console.log('UPDATE_PROGRESSION', event.getPercentByFile());
                    }
                    break;
                case native.EventAssetsManager.ALREADY_UP_TO_DATE: // 已经是最新版本
                    {
                        console.log('ALREADY_UP_TO_DATE');
                    }
                    break;
                case native.EventAssetsManager.UPDATE_FINISHED: // 更新完成
                    {
                        console.log('UPDATE_FINISHED');                                                                        
                    }
                    break;
                case native.EventAssetsManager.UPDATE_FAILED:
                case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    {
                        // let retry = () => {
                        //     self.doUpdate();
                        // }
                        // let cancel = () => {
                        //     cc.game.end();
                        // }
                        // NUIMgr.Ins.open(EUI.HOT_UPDATE_FAILED, new Param(retry, cancel));                        
                        console.log('UPDATE_FAILED');  
                    }
                    break;
                case native.EventAssetsManager.NEW_VERSION_FOUND:
                    {
                        // let m = hotUpdate.am.getTotalBytes() / 1024 / 1024;
                        // let title = I18nMgr.Ins.getLangStr('TID_TIP')
                        // let tid = cc.sys.getNetworkType() == cc.sys.NetworkType.WWAN ? 'TID_SETTING_POORNET' : 'TID_SETTING_UPDATECONTENT'
                        // let msg = I18nMgr.Ins.getLangStr(tid, m.toFixed(2))
                        // let force = Global.Ins.ChangeLog['main'].forceupdate;   // 强制更新  需求不弹出面板 #3260
                        // NUIMgr.Ins.open(EUI.CHANGE_SCENE_LOADING);              // 显示进度条
                        // if (force)
                        //     hotUpdate.hotUpdate();
                        // else
                        //     NUIMgr.Ins.open(EUI.MSG_BOX_HOT_UPDATE, new Param(title, msg, () => { hotUpdate.hotUpdate(); }));
                        // Log.i("更新信息  jsb.EventAssetsManager.NEW_VERSION_FOUND: ", hotUpdate.am.getTotalBytes(), '  ', m, ' M')
                        console.log('NEW_VERSION_FOUND');  
                    }                    
                    break;
            }
        })
        hotUpdate.hotUpdate();
        // hotUpdate.am.checkUpdate();
    }
}

