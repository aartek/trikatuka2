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
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', ['concat']);

};