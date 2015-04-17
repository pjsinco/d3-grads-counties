module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-watch");


  grunt.initConfig({

    watch: {
      
      js: {
        files: ['js/**/*.js'],
        options: {
          livereload: true
        },
      },

    } // watch
  }); // initConfig
  
  grunt.registerTask('default', ['watch']);

}; // exports

