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

// 资源部署 - nginx
gulp.task('copy2Nginx', function() {
  return gulp.src('D:/test/TestHot360/build/windows/assets/**')
    .pipe(gulp.dest('D:/htdoc/assets'));
});

// 拷贝changelog.json - nginx
gulp.task('copyChangeLog', function() {
  return gulp.src('D:/test/TestHot360/changelog.json')
    .pipe(gulp.dest('D:/htdoc/assets'));
});

// 资源部署 - win debug
gulp.task('copy2WinDebug', function() {
  return gulp.src('D:/test/TestHot360/build/windows/assets/**')
    .pipe(gulp.dest('D:/test/TestHot360/build/windows/proj/Debug/Resources'));
});

// 一键发布热更新
gulp.task('publishUpdate', gulp.series('publishWin32', 'genManifest', 'copy2Nginx', 'copyChangeLog'));

// 一键发布到Win Debug
gulp.task('win32', gulp.series('publishWin32', 'genManifest', 'copy2WinDebug'));




