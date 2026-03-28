#!/usr/bin/env python3
"""Simple HTTPS server for frontend"""

import http.server
import ssl

PORT = 8443

# Create server
server_address = ('', PORT)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# Add SSL
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('cert.pem', 'key.pem')
httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True)

print(f"🚀 HTTPS Frontend Server running on https://localhost:{PORT}")
print("🔒 Self-signed certificate - accept browser warning")
print("📂 Serving files from current directory")

httpd.serve_forever()
