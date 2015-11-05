/// <binding BeforeBuild='riot:pages' ProjectOpened='watch:riottags' />
module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        // read in the project settings from the package.json file into the pkg property
        pkg: grunt.file.readJSON('package.json')
    });

    //Load grunt tasks automatically.
    require('load-grunt-tasks')(grunt);
    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist',
        pub: 'public'
    };
    grunt.initConfig({
        config: config,
        riot: {
            options: {
                concat: true
            },
            compile: {
                src: 'app/tags/**/*.tag',
                dest: 'app/js/tags.js'
            },
        },
        sass_globbing: {
            your_target: {
                files: {
                    'app/scss/_tags.scss': 'app/tags/**/*.scss'
                },
                options: {
                    useSingleQuotes: false
                }
            }
        },
        sass:{
            options: {
                sourceMap: false,
                outputStyle: 'compressed'
            },
            dist:{
                files:{
                    "www/css/styles.css": "app/scss/styles.scss"
                }
            }
        },
        postcss: {
            options: {
                map: true, // inline sourcemaps

                processors: [
                    require('pixrem')(), // add fallbacks for rem units
                    require('autoprefixer')({browsers: 'last 3 versions'}), // add vendor prefixes
                    require('cssnano')() // minify the result
                ]
            },
            dist: {
                src: 'www/css/styles.css'
            }
        },
        uglify: {
            my_target: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'www/js/script.min.map'
                },                
                files: {
                    'www/js/script.min.js': ['app/js/3rdparty/*.js','app/js/lib/*.js','app/js/stores/*.js', 'app/js/tags.js']
                }
            }
        },
        htmlmin: {                                     // Task
            dist: {                                      // Target
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {                                   // Dictionary of files
                    'www/index.html': 'app/index.html'
                }
            }
        },
        copy:{
            images:{
                files: [{ 
                    expand: true,
                    cwd: 'app/img/', 
                    src: ['**/*.{png,jpg,svg}'], 
                    dest:'www/img/' 
                }]                
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    open:true,
                    livereload:true,
                    base: 'www'
                }
            }
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
            images: {
                files: ['app/img/**/*.{jpg,png,gif,svg}'],
                tasks: ['riot', 'uglify'],
                options: {}
            },

            htmlminify:{
                files: ['app/index.html'],
                tasks: ['htmlmin:dist']               
            },
            makeugly:{
                files: ['app/js/3rdparty/*.js','app/js/lib/*.js','app/stores/*.js'],
                tasks: ['uglify']               
            },
            riottags: {
                files: ['app/tags/**/*.tag'],
                tasks: ['riot', 'uglify'],
                options: {}
            },
            sass: {
                files: ['app/scss/styles.scss', 'app/tags/**/*.scss'],
                tasks: ['sass_globbing','sass:dist','postcss']
            },
            livereload: {
                files: ['www/**/*.{html,js,css}','www/img/**/*.{png,jpg,jpeg,gif,webp,svg}'],
                options: {
                    livereload: true
                }
            }            
        },

    });
grunt.registerTask('serve', ['sass_globbing','sass:dist','riot','postcss:dist','uglify', 'htmlmin:dist','copy:images','connect:server','watch']);
grunt.registerTask('pcss', ['postcss']);
};