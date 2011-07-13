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

task :default => [:server]

