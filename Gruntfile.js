module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less:{
			dev:{
				file: {
					'public/stylesheets/style.css' : 'public/stylesheets/style.less'
				}
			}
		},
	    watch: {
	        src: {
	          files: ['public/stylesheets/*.less'],
	          tasks: ['development']
	        }
	    }
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('development', ['less:dev']);

}