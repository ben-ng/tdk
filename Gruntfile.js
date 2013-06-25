module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-qunit');

	grunt.initConfig({
		qunit: {
		  all: {
  		  options: {
          urls: ['http://localhost:8080']
        , inject: ""
  		  }
		  }
		}
	});

	grunt.registerTask('test', ['qunit']);
	grunt.registerTask('default', ['test']);
};
