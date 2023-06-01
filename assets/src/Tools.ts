import { native, sys } from "cc";

export class Tools {
    static getLocalVersion(name: string): string {
        if (!sys.isNative)
            return "";

        let localManifestUrl = `assets/${name}/project.manifest`; // 本地manifest文件url
        let cacheManifestUrl = `${native.fileUtils.getWritablePath()}${name}/project.manifest`; // 缓存manifest文件url

        let localVersion = ''; // 本地版本
        let cacheVersion = ''; // 缓存版本
        if (native.fileUtils.isFileExist(localManifestUrl)) {
            let manifest = native.fileUtils.getStringFromFile(localManifestUrl);
            let json = JSON.parse(manifest);
            localVersion = json.version;
        }

        if (native.fileUtils.isFileExist(cacheManifestUrl)) {
            let manifest = native.fileUtils.getStringFromFile(cacheManifestUrl);
            let json = JSON.parse(manifest);
            cacheVersion = json.version;
        }

        if (cacheVersion != '') {            
            // 读取缓存版本
            return cacheVersion;
        }

        if (localVersion != '') {
            // 读取内置版本
            return localVersion;
        }
    }
}

