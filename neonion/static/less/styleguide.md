This is a living styleguide, which is based upon [sc5 styleguide](https://github.com/SC5/sc5-styleguide). The styleguide is generated dynamically using [KSS](http://warpspire.com/kss/) notation within LESS files and is written with markdown.

neonion is build with [Bootstrap v3.3.5](http://getbootstrap.com). 

## Installing LESS and compiling to CSS

Bootstrap is build with [LESS](www.lesscss.de), that is why we use LESS and not SASS.

Install LESS with `npm` ([node package manager](https://www.npmjs.com/)).

          $ npm install -g less

For compiliation run the following:

          $ lessc neonion/static/less/my-bootstrap-theme.less neonion/static/main.css

If you want to compile automatically when LESS files are changed, here is a shell script. Name it whatever you like (e.g. `less2css.sh`) and make it executable with `chmod +x filename.sh`. It needs to be placed inside the `neonion-internal` folder (top folder).

          while inotifywait -r neonion/static/less/* &
          do
            lessc neonion/static/less/my-bootstrap-theme.less neonion/static/main.css
          done

You could also add a filewatcher to phycharm.


## Running the Styleguide locally as a server

Install [sc5 styleguide](https://github.com/SC5/sc5-styleguide) first:

          $ npm install sc5-styleguide --save-dev

You can run it as a command line tool but using gulp is better, because of ... a lot. Install gulp first:

          $ npm install gulp

Also install `gulp-less` and `gulp-concat` first:

          $ npm install gulp-less
          $ npm install gulp-concat


Here is the code for running the styleguide server. Save it as `gulpfile.js` in folder `neonion-internal/neonion/static`.

```javascript
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
        disableEncapsulation: true,
        customColors: 'utils/styleguide.scss'
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

gulp.task('watch', ['styleguide'], function() {
  // Start watching changes and update styleguide whenever changes are detected
  // Styleguide automatically detects existing server instance

  gulp.watch(['less/**/*.less'], ['styleguide']);
});

gulp.task('styleguide', [
  'styleguide:static',
  'styleguide:generate',
  'styleguide:applystyles'
]);
```

Run the styleguide from folder `neonion-internal/neonion/static` with:

          $ gulp watch


Browse to `http://localhost:3000/` and everything should be fine.

## Creating a static instance of the styleguide

To create a static styleguide to put on github (e.g. `neonion.org/styleguide`) you need to run the following script. Save it as `gulpfile.js` in folder `neonion-internal/neonion/static`. Run it with:

          $ gulp styleguide

Copy the folder `styleguide` to whatever place you like and push it to github. It is only working on github, but not locally!

```javascript
var gulp = require('gulp');
var styleguide = require('sc5-styleguide');
var less = require('gulp-less');
var outputPath = 'styleguide';
var concat = require("gulp-concat");

gulp.task('styleguide:generate', function() {
  return gulp.src('less/**/*.less')
    .pipe(styleguide.generate({
        title: 'Styleguide for neonion',
        rootPath: outputPath,
        appRoot: '/styleguide',
        overviewPath: 'less/styleguide.md',
        commonClass: 'myfont',
        extraHead: [
          '<script src="js/jquery.min.js"></script>',
          '<script src="js/bootstrap.min.js"></script>'
        ],
        disableEncapsulation: true,
        disableHtml5Mode: true,
        customColors: 'utils/styleguide.scss'
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

gulp.task('styleguide', [
  'styleguide:static',
  'styleguide:generate',
  'styleguide:applystyles'
]);
```

***

Send feedback regarding the install instructions to alexa.schlegel(at)gmail.com

***
