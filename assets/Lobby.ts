import { _decorator, AssetManager, assetManager, Component, director, Label, Node, Prefab, Scene, SceneAsset } from 'cc';
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
        let bundleName = `game${id}`;
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
}

