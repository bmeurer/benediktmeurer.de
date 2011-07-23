desc 'Delete generated _site files'
task :clean do
	system "rm -fR _site"
end

desc 'Clean temporary files and compile the site'
task :compile => [:clean] do
	system "jekyll --no-server"
end

desc 'Compress CSS & HTML'
task :compress => [:compile] do
	system "find _site -name '*.css' -print0 | xargs -0 java -jar _lib/yuicompressor-2.4.6.jar --charset --type css -o '.css$:.css'"
	system 'find _site -name "*.html" -exec java -jar _lib/htmlcompressor-1.4.jar --charset UTF-8 --type html --compress-css --compress-js "{}" -o "{}" ";"'
	system "find _site -name '*.js' -print0 | xargs -0 java -jar _lib/yuicompressor-2.4.6.jar --charset --type js -o '.js$:.js'"
	system 'find _site -name "*.xml" -exec java -jar _lib/htmlcompressor-1.4.jar --charset UTF-8 --type xml "{}" -o "{}" ";"'
end

desc 'Run the jekyll dev server'
task :server => [:compile] do
	system "jekyll --server --auto"
end

desc 'Notify Google of the new sitemap'
task :sitemap do
  require 'net/http'
  require 'uri'
  puts '* Pinging Google about the sitemap'
  Net::HTTP.get('www.google.com', '/webmasters/tools/ping?sitemap=' + URI.escape('http://benediktmeurer.de/sitemap.xml'))
end

task :default => [:server]

