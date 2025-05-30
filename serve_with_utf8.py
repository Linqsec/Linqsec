import http.server
import socketserver

class UTF8HTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add charset=utf-8 to text-based content types
        if self.path.endswith(('.html', '.css', '.js', '.json')):
            self.send_header('Content-Type', f'{self.guess_type(self.path)}; charset=utf-8')
        super().end_headers()

    def guess_type(self, path):
        # Use the default guess_type, but avoid double charset
        content_type = super().guess_type(path)
        if content_type and 'charset' in content_type:
            content_type = content_type.split(';')[0]
        return content_type

if __name__ == "__main__":
    PORT = 8000
    Handler = UTF8HTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()
