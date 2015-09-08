var gulp = require('gulp');
var styleguide = require('sc5-styleguide');
var less = require('gulp-less');
var outputPath = 'styleguide';
var concat = require("gulp-concat");

gulp.task('styleguide:generate', function() {
  return gulp.src('less/**/*.less')
    .pipe(styleguide.generate({
        title: 'Styleguide for neonion',
        server: true,
        rootPath: outputPath,
        overviewPath: 'less/styleguide.md',
        commonClass: 'myfont',
        extraHead: [
          '<script src="/js/jquery.min.js"></script>',
          '<script src="/js/bootstrap.min.js"></script>'
        ],
        disableEncapsulation: true
      }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src([
    'less/my-bootstrap-theme.less',
    'utils/additional.less'
    ])
    .pipe(concat('all.less'))
    .pipe(less({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide:static', function() {
  gulp.src('fonts/**')
    .pipe(gulp.dest(outputPath + '/fonts'));
  gulp.src('js/jquery.min.js')
    .pipe(gulp.dest(outputPath + '/js'));
  gulp.src('js/bootstrap.min.js')
    .pipe(gulp.dest(outputPath + '/js')); 
});

gulp.task('watch', function() {
  // Start watching changes and update styleguide whenever changes are detected
  // Styleguide automatically detects existing server instance
  gulp.watch(['less/**/*.less'], ['styleguide']);
});

gulp.task('styleguide', [
  'styleguide:static',
  'styleguide:generate',
  'styleguide:applystyles'
]);