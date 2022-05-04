module.exports = {
    runtimeCompiler: true,
    devServer: {
	disableHostCheck: true,
        public: 'dev.tnxqso.com',
	port: 8081,
	watchOptions: {
	    ignored: /static/
	}
    },
    pages: {
        index: {
            entry: 'src/main.js',
            template: 'src/html/index.html',
            filename: 'index.html'
        },
        station: {
            entry: 'src/station.js',
            template: 'src/html/station.html',
            filename: 'station.html'
        }
   }
}
