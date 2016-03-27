module.exports = function (grunt) {

    grunt.initConfig({
        concat: {
            basic: {
                src: [
                    'webapp/app/app.js',
                    'webapp/app/**/*.js'
                ],
                dest: 'webapp/dist/app.js'
            },
            libs: {
                src: [
                    'webapp/js/**/jquery-2.2.1.min.js',
                    'webapp/js/**/angular.min.js',
                    'webapp/js/**/*.js'
                ],
                dest: 'webapp/dist/libs.js'
            }
        },
        uglify: {
            options:{
                mangle: false,
            },
            app: {
                files: {
                    'webapp/dist/app.min.js': ['webapp/dist/app.js']
                }
            },
            libs: {
                files: {
                    'webapp/dist/libs.min.js': ['webapp/dist/libs.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat','uglify']);

};