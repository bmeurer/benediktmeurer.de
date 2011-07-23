# .htaccess Generator is a Jekyll plugin that generates a .htaccess file by
# inspecting the available 40x error pages.
#
# How To Use:
#   1.) Copy source file into your _plugins folder within your Jekyll project.
#   2.) Run Jekyll: jekyll --no-server to re-generate your site.
#   3.) A .htaccess should be included in your _site folder.
#
# Author: Benedikt Meurer
# Site: http://benediktmeurer.de
# Distributed Under A Creative Commons License
#   - http://creativecommons.org/licenses/by/3.0/

module Jekyll

  # Supported HTTP status codes
  HTTP_STATUS_CODES = [ "400", "401", "403", "404" ]

  # Recover from strange exception when starting server without --auto
  class HtaccessFile < StaticFile
    def write(dest)
      begin
        super(dest)
      rescue
      end
      true
    end
  end

  class HtaccessGenerator < Generator
    safe true
    priority :low

    def generate(site)
      FileUtils.mkdir_p(site.dest)
      file = File.new(File.join(site.dest, ".htaccess"), "w")
      file << "# Custom ErrorDocument settings\n"
      site.pages.each do |page|
        HTTP_STATUS_CODES.each do |code|
          if page.name == "#{code}.html"
            file << "ErrorDocument #{code} /#{code}/\n"
            break
          end
        end
      end
      file.close

      # Keep the .htaccess file from being cleaned by Jekyll
      site.static_files << Jekyll::HtaccessFile.new(site, site.dest, "/", ".htaccess")
    end

  end

end
