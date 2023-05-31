const gulp = require('gulp');
const gutil = require('gulp-util');
const exec = require('child_process').exec;
const tools = require('./tools');

// 发布CocosCreator到win32平台
gulp.task('publishWin32', function(cb) {
	const env = tools.getEnv();  	
  const cmd = `"${env.COCOSCREATOR_EXE}" --project D:\\test\\TestHot360 --build "configPath=D:\\test\\TestHot360\\autopkg\\gulpfile.js\\buildConfig_windows.json;logDest=D:\\test\\TestHot360\\autopkg\\gulpfile.js\\publish.log"`
	exec(cmd).on('exit', function(code) {
		if (code == 36) {
			cb();
		}
		else {
		  	cb(new gutil.PluginError('test', 'Process exited with code ' + code));
		}
	});
});

// 生成manifest
gulp.task('genManifest', function(cb) {
	tools.generateManifest('D:\\test\\TestHot360', 'windows', 'http://127.0.0.1/assets');
	cb();
});

// 资源部署
gulp.task('copy', function() {
  return gulp.src('D:/test/TestHot360/build/windows/assets/**')
    .pipe(gulp.dest('D:/htdoc/assets'));
});

// 一键发布热更新
gulp.task('publishUpdate', gulp.series('publishWin32', 'genManifest', 'copy'));




