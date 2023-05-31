const gulp = require('gulp');
const gutil = require('gulp-util');
const exec = require('child_process').exec;
const tools = require('./tools');

// 发布CocosCreator到win32平台
gulp.task('cocoscreatorPublishWin32', function(cb) {
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

gulp.task('task2', function(cb) {
	console.log('task2');
	cb();
});

gulp.task('win32', gulp.series('cocoscreatorPublishWin32', 'task2'));


