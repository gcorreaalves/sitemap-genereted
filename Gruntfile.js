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
	    },
	    nodemon: {
		  	dev: {
			    options: {
			      file: 'app.js',
			      nodeArgs: ['--debug'],
			      env: {
			        PORT: '8282'
			      }
			    }
		  	}
		},
		concurrent: {
	        target: {
	            tasks: ['nodemon'],
	            options: {
	                logConcurrentOutput: true
	            }
	        }
	    }
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerTask('default', ['concurrent:target']);
	grunt.registerTask('development', ['less:dev']);

}