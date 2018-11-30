---
layout: post
title: Gitweb and HTTP transport for public repositories
---

It took me some time to figure out how to get
[gitweb](https://git.wiki.kernel.org/index.php/Gitweb) and (readonly) HTTP
transport working for public Git repositories using the same URL. So here's my
Apache 2 configuration, it may save you some time. The configuration assumes
that your Git repositories are located under <code>/srv/git</code> and the
gitweb files are installed in <code>/usr/share/gitweb</code> with the
configuration file in <code>/etc/gitweb.conf</code>.

{% highlight conf %}
# Dumb transport clone URLs for public repositories
AliasMatch ^/git(/.*\.git)/HEAD$ /srv/git/$1/HEAD
AliasMatch ^/git(/.*\.git)/info(/.*)? /srv/git/$1/info$2
AliasMatch ^/git(/.*\.git)/objects(/.*)? /srv/git/$1/objects$2
AliasMatch ^/git(/.*\.git)/refs(/.*)? /srv/git/$1/refs$2
<Directory "/srv/git/*.git">
        AllowOverride None
        Options Indexes
        <Limit GET POST OPTIONS>
                Order allow,deny
                Allow from all
        </Limit>
        <LimitExcept GET POST OPTIONS>
                Order deny,allow
                Deny from all
        </LimitExcept>
</Directory>

# gitweb user interface
Alias /git /usr/share/gitweb
<Directory /usr/share/gitweb>
        SetEnv GITWEB_CONFIG /etc/gitweb.conf
        Options +ExecCGI
        AddHandler cgi-script .cgi
        DirectoryIndex gitweb.cgi

        RewriteEngine on
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^.* /git/gitweb.cgi/$0 [L,PT]
</Directory>
{% endhighlight %}
