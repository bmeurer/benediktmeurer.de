desc 'Delete generated _site files'
task :clean do
	system "rm -fR _site"
end

desc 'Clean temporary files and compile the site'
task :compile => [:clean] do
	system "git rm -rf tag"
	system "jekyll --no-server"
	system "cp _site/gh404/index.html 404.html"
	system "cp -rp _site/tag ."
	system "git add tag"
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

