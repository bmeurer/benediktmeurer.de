# Monkey patching Jekyll :D
# Adds support for tag/tagname/index.html
# Original Source: https://github.com/mikewest/jekyll/blob/f57f950346d934ce74d5df8a4eb26f66013e8238/lib/jekyll/site.rb
module Jekyll
	class TagPage < Page
		def initialize(site, base, tag)
			@site = site
			@base = base
			@dir = File.join('tag', tag)
			@name = 'index.html'
			self.process(@name)
			self.read_yaml(File.join(base, '_layouts'), 'tag.html')
			self.data['title'] = tag.capitalize
			self.data['tag'] = tag
		end
	end
	class Site
		alias_method :write_old, :write
		def write_tag
			write_old
			
			if self.layouts.key? 'tag'
				self.tags.keys.each do |tag|
					tagpage = TagPage.new(self, self.source, tag)
					tagpage.render(self.layouts, site_payload)
					tagpage.write(self.dest)
				end
			end
		end
		alias_method :write, :write_tag
	end
end
