import { game, native, sys } from "cc";
import { HOT_UPDATE_ADDR } from "./Define";
import { Tools } from "./Tools";

export default class HotUpdate extends EventTarget {

    private _am: native.AssetsManager = null;
    private _updating = false;
    private _retryCount = 0;
    private _retryCountMax = 10;                    // 重试次数
    private _name = '';                             // 模块名字    

    get am() {
        return this._am;
    }   

    private verifyCallback(path: string, asset: native.ManifestAsset): boolean {
        return true;
    }

    private cb: (name: string, event: native.EventAssetsManager) => void;

    /**
     * 构造函数
     * @param name 模块名字，大厅用'main'，子游戏用各自的bundle名称          
     * @param cb 事件回调     
     */
    constructor(name: string, cb: (name: string, event: native.EventAssetsManager) => void) {
        super();        
        if (!sys.isNative) {
            return;
        }    
        
        this._name = name;

        console.log('[Update] init: ' + name);

        // download缓存manifest的路径
        let storagePath = native.fileUtils.getWritablePath() + name;
        console.log('[Update] storage path = ' + storagePath);

        // 本地manifest的url，即apk包内部的url，assets/${name}/project.manifest
        let localManifestUrl = `assets/${name}/project.manifest`;
        console.log('[update] local manifest url = ' + localManifestUrl);
        
        // 缓存manifest的url
        let cacheManifestUrl = `${native.fileUtils.getWritablePath()}${name}/project.manifest`;
        console.log('[update] cache manifest url = ' + cacheManifestUrl);

        let content = '';
        if (native.fileUtils.isFileExist(cacheManifestUrl)) {
            console.log('read project.manifest from cache');
            content = native.fileUtils.getStringFromFile(cacheManifestUrl);
            native.fileUtils.writeStringToFile(content, cacheManifestUrl);
        }
        else if (native.fileUtils.isFileExist(localManifestUrl)) {
            content = native.fileUtils.getStringFromFile(localManifestUrl);
            native.fileUtils.createDirectory(`${native.fileUtils.getWritablePath()}${name}`);
            native.fileUtils.writeStringToFile(content, cacheManifestUrl);
        }
        else {
            console.log('[update] create empty project.manifest');
            let hot = `${HOT_UPDATE_ADDR}`; // 热更新地址
            content = JSON.stringify({
                "packageUrl": hot,
                "remoteManifestUrl": `${hot}/assets/${name}/project.manifest`,
                "remoteVersionUrl": `${hot}/assets/${name}/version.manifest`,
                "version": "0.0.0",
                "assets": {},
                "searchPaths": []
            });
        }

        // Init with empty manifest url for testing custom manifest        
        this._am = new native.AssetsManager(localManifestUrl, storagePath, Tools.versionCompare);

        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(this.verifyCallback);

        // 设置事件回调
        this._am.setEventCallback(this.eventCb.bind(this));

        let manifest = new native.Manifest(content, 'manifest');
        this._am.loadLocalManifest(manifest, '');

        let isLoaded = this._am.getLocalManifest().isLoaded();        
        console.log('[update] local manifest status = ' + isLoaded);
        
        if (isLoaded) {
            let manifest = this._am.getLocalManifest();
            console.log('[update] versionFileUrl = ', manifest.getVersionFileUrl());
            console.log('[update] manifestFileUrl = ', manifest.getManifestFileUrl());
            console.log('[update] packageUrl = ', manifest.getPackageUrl());
        }                    

        // 设置事件回调
        this.cb = cb;        
        console.log('[update] hotupdate is ready, please check-update or directly update!');
    }    

    /**
     * 事件回调
     */
    private eventCb(event: native.EventAssetsManager) {                
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
            case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
            case native.EventAssetsManager.ALREADY_UP_TO_DATE:
                failed = true;                
                this.cb(this._name, event);
                break;
            case native.EventAssetsManager.UPDATE_FINISHED:
                needRestart = true;
                this._updating = false;
                this.cb(this._name, event);
                break;
            case native.EventAssetsManager.NEW_VERSION_FOUND:
                this._updating = false;
                this.cb(this._name, event);
                break;
            case native.EventAssetsManager.UPDATE_PROGRESSION:
                // 更新进度
                this.cb(this._name, event);                
                break;
            case native.EventAssetsManager.ERROR_UPDATING:
                // 更新资源错误
                console.log(`[update] ERROR_UPDATING: ${event.getAssetId()}, ${event.getMessage()}`);
                break;
            case native.EventAssetsManager.ERROR_DECOMPRESS:
                // 解压缩错误
                console.log(`[update] ERROR_DECOMPRESS: ${event.getAssetId()}, ${event.getMessage()}`);
                break;
            case native.EventAssetsManager.UPDATE_FAILED:
                // 下载失败、解压失败、校验失败，最后都会触发 UPDATE_FAILED 事件。而所有下载失败的资源列表会被记录在热更新管理器中
                console.log(`[update] UPDATE_FAILED: ${this._retryCount + 1} ${event.getAssetId()}, ${event.getMessage()}`);
                if (this._retryCount < this._retryCountMax) {
                    this.retry();
                }
                else {
                    this._updating = false;
                    this.cb(this._name, event);
                }
                break;
        }

        if (failed) {
            this._am.setEventCallback(null!);
            this._updating = false;
        }

        if (needRestart) {
            this._am.setEventCallback(null!);
            
            // Prepend the manifest's search path
            var searchPaths = native.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            native.fileUtils.setSearchPaths(searchPaths);

            // restart game.
            if (this._name == 'main') {
                setTimeout(() => {
                    game.restart();                
                }, 1000)
            }            
        }
    }

    /**
     * 热更新
     */
    hotUpdate() {
        console.log('[update] start update');
        if (this._updating) {
            console.log('[update] in checking or updating skip!');
            return;
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            console.log('[update] hotUpdate: manifest not exist');
            return;
        }

        this._am.update();
        this._retryCount = 0;
        this._updating = true;
    }

    /**
     * 下载出错的资源文件
     */
    private retry() {
        this._retryCount++;
        this._am.downloadFailedAssets();
    }
}
