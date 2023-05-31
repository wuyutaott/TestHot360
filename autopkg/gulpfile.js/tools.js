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

module.exports = {
    getEnv
}