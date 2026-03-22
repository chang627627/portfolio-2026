require 'webrick'
server = WEBrick::HTTPServer.new(
  Port: (ENV['PORT'] || 8888).to_i,
  DocumentRoot: File.dirname(__FILE__)
)
trap('INT') { server.shutdown }
server.start
