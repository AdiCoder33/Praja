#!/usr/bin/env python3
"""Generate self-signed SSL certificate for localhost HTTPS"""

from OpenSSL import crypto
import os

def generate_self_signed_cert():
    # Create key pair
    k = crypto.PKey()
    k.generate_key(crypto.TYPE_RSA, 2048)

    # Create self-signed cert
    cert = crypto.X509()
    cert.get_subject().C = "IN"
    cert.get_subject().ST = "State"
    cert.get_subject().L = "City"
    cert.get_subject().O = "FIR Assistant"
    cert.get_subject().OU = "Dev"
    cert.get_subject().CN = "localhost"
    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(365*24*60*60)
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(k)
    cert.sign(k, 'sha256')

    # Save certificate
    with open("cert.pem", "wb") as f:
        f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))

    # Save private key
    with open("key.pem", "wb") as f:
        f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))

    print("✅ SSL Certificate generated!")
    print("   - cert.pem")
    print("   - key.pem")

if __name__ == "__main__":
    generate_self_signed_cert()
