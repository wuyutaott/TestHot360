export let HOT_UPDATE_ADDR = 'http://127.0.0.1/assets';                   // 游戏热更新地址

export let Game_INFO = {
    1: {bundleName: 'game1'},
    2: {bundleName: 'game2'},
    3: {bundleName: 'game3'},
}

export enum GameState {
    OK,             // 正常
    NEW_VERSION,    // 有更新
    UNINSTALL,      // 未下载
}