const path = require('path');
const fs = require('fs');
const jsonFormat = require('json-format');
const crypto = require('crypto');

// 获取环境变量
function getEnv() {
	const configUrl = path.join(__dirname, ".config");	
	const config = JSON.parse(fs.readFileSync(configUrl, 'utf8'));
	return config;
}

/**
 * 生成Manifest
 * @param projectRoot 项目路径
 * @param platform 发布平台
 * @param hotUpdateUrl 热更新地址 http://127.0.0.1
 */
function generateManifest(projectRoot, platform, hotUpdateUrl) {
    // 版本文件
    const ChangeLogPath = path.join(projectRoot, "/changeLog.json");    
    const ChangeLog = JSON.parse(fs.readFileSync(ChangeLogPath, 'utf8'));

    // 热更新地址
    var HOT_UPDATE_URL = hotUpdateUrl;    

	console.log("[生成] 开始生成manifest配置文件...");

    let manifest = {
        version: ChangeLog.main.ver,
        packageUrl: HOT_UPDATE_URL,
        remoteManifestUrl: "",
        remoteVersionUrl: "",
        assets: {},
        searchPaths: [],
    };

    manifest.remoteManifestUrl = HOT_UPDATE_URL + "/assets/main/project.manifest";
    manifest.remoteVersionUrl = HOT_UPDATE_URL + "/assets/main/version.manifest";

    // 发布资源路径
    let source = path.join(projectRoot, `/build/${platform}/assets`);

    // 大厅的资源
    _readDir(path.join(source, "src"), manifest.assets, source);
    _readDir(path.join(source, "jsb-adapter"), manifest.assets, source);
    _readDir(path.join(source, "assets/main"), manifest.assets, source);
    _readDir(path.join(source, "assets/internal"), manifest.assets, source);
    _readDir(path.join(source, "assets/resources"), manifest.assets, source);

    // manifest写入路径
    let targetProjectManifest = path.join(source, "assets/main", "project.manifest");
    let targetVersionManifest = path.join(source, "assets/main", "version.manifest");

    // 生成project.manifest
    fs.writeFileSync(targetProjectManifest, JSON.stringify(manifest));
    console.log(`[生成] ${targetProjectManifest} 成功 ${manifest.version}`);

    // 删除字段assets和searchPaths
    delete manifest.assets;
    delete manifest.searchPaths;

    // 生成version.manifest
    fs.writeFileSync(targetVersionManifest, JSON.stringify(manifest));
    console.log(`[生成] ${targetVersionManifest} 成功 ${manifest.version}`);

    // 子游戏打包
    for (var key in ChangeLog) {
        if (key == 'main') 
        	continue;

        var subgamePath = path.join(source, `assets/${key}`);
        if (!fs.existsSync(subgamePath))
        	continue;
        
        let submanifest = {
            version: ChangeLog[key].ver,
            packageUrl: HOT_UPDATE_URL,
            remoteManifestUrl: "",
            remoteVersionUrl: "",
            assets: {},
            searchPaths: []
        };

        submanifest.remoteManifestUrl = HOT_UPDATE_URL + `/assets/${key}/project.manifest`;
        submanifest.remoteVersionUrl = HOT_UPDATE_URL + `/assets/${key}/version.manifest`;

        _readDir(subgamePath, submanifest.assets, source);      

        let targetSubgameManifest = path.join(subgamePath, `project.manifest`);
        fs.writeFileSync(targetSubgameManifest, JSON.stringify(submanifest));
        console.log(`[生成] ${targetSubgameManifest} 成功 ${submanifest.version}`);

        delete submanifest.assets;
        delete submanifest.searchPaths;

        let targetSubgameVersionManifest = path.join(subgamePath, `version.manifest`);
        fs.writeFileSync(targetSubgameVersionManifest, JSON.stringify(submanifest));
        console.log(`[生成] ${targetSubgameVersionManifest} 成功 ${submanifest.version}`);
    }
}

/**
 * 递归遍历文件夹输出文件的size和md5信息到obj
 * @param dir 目录路径
 * @param obj 输出
 * @param source 原路径，输出相对路径
 */
function _readDir(dir, obj, source) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir),
        subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; i++) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            _readDir(subpath, obj, source);
        } 
        else if (stat.isFile()) {
            size = stat['size']; // Size in Bytes
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(source, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);

            obj[relative] = {
                'size': size,
                'md5': md5
            };

            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

module.exports = {
    getEnv,
    generateManifest
}