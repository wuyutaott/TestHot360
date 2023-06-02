import { _decorator, AssetManager, assetManager, Component, director, Label, Node, Prefab, Scene, SceneAsset } from 'cc';
import { Tools } from './src/Tools';
import { Global } from './src/Global';
import { Game_INFO, GameState } from './src/Define';
import { GameItem } from './src/GameItem';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    @property(Label)
    ver: Label = null;

    @property([GameItem])
    gameItems: GameItem[] = [];

    start() {
        let localVersion = Tools.getLocalVersion('main');        
        this.ver.string = localVersion;        

        this.initGameItem();
    }

    update(deltaTime: number) {
        
    }

    onGameClick(btn, index) {
        let gameItem = this.gameItems[index]; 
        let gameId = gameItem.gameId;
        let info = Game_INFO[gameId];               

        switch (gameItem.state) {
            case GameState.OK:
                {
                    let bundleName = info.bundleName;
                    assetManager.loadBundle(bundleName, (err: Error, bundle: AssetManager.Bundle) => {
                        if (err)
                            return console.error(err);
                        bundle.loadScene('Game', (err: Error, sceneAsset: SceneAsset) => {
                            if (err) {                    
                                return console.error(err);
                            }                    
                            director.runScene(sceneAsset);
                        })            
                    }) 
                }
                break;
            case GameState.NEW_VERSION:
                break;
            case GameState.UNINSTALL:
                break;
        }
    }

    initGameItem() {        
        let gameIds = [1, 2, 3];
        for (let i = 0; i < gameIds.length; i++) {
            let gameId = gameIds[i];
            let info = Game_INFO[gameId];
            let bundleName = info.bundleName;
            let state = this.checkGameState(bundleName);
            console.log(`${bundleName} - ${state}`);

            let gameItem = this.gameItems[i];    
            gameItem.setGameId(gameId);        
            gameItem.setState(state);                      
        }
    }

    /**
     * @param name 游戏名字
     * @returns 0-正常 1-有更新 2-没下载
     */
    checkGameState(name: string) {
        if (!Global.Ins.ChangeLog)
            return GameState.OK;
        if (!Global.Ins.ChangeLog[name])
            return GameState.OK;        
        let remoteVer = Global.Ins.ChangeLog[name].ver;
        let localVer = Tools.getLocalVersion(name);
        if (localVer == '')
            return GameState.UNINSTALL;        
        if (remoteVer == localVer)
            return GameState.OK;        
        if (Tools.versionCompare(remoteVer, localVer) > 0)
            return GameState.NEW_VERSION;        
    }
}

