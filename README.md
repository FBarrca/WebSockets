# WSS with Mutual authentication

## Credentials


To create self-signed certificates for mutual authentication using OpenSSL, follow these steps:
1. Create a private key and a self-signed certificate for the server:

``` bash
openssl req -x509 -newkey rsa:2048 -keyout server-key.pem -out server-cert.pem -days 365 -nodes
```
This will create a private key server-key.pem and a self-signed certificate server-cert.pem that is valid for 365 days.

2. Create a private key and a certificate signing request (CSR) for the client:
   
```bash
openssl req -newkey rsa:2048 -keyout client-key.pem -out client.csr
```	

This will create a private key client-key.pem and a CSR file client.csr.

The client's private key client-key.pem is **encrypted with a passphrase**. 

3. Use the server's private key and self-signed certificate to sign the client's CSR and create a client certificate:

```bash	
openssl x509 -req -in client.csr -CA server-cert.pem -CAkey server-key.pem -CAcreateserial -out client-cert.pem -days 365
```

This will create a client certificate client-cert.pem that is signed by the server's self-signed certificate and is valid for 365 days.


**You can now use these certificates for mutual authentication between the client and server.**

## Server

When creating the server it is important to set the WSS options:
- `key` is the server's private key.
- `cert` is the server's self-signed certificate.
- `rejectUnauthorized` is set to false to accept the self-signed certificate. It accepts all certificates but it still keeps the connection encrypted.

## Client

When creating the client it is important to set the WSS options:

- `key` is the server's private key.
- `cert` is the server's self-signed certificate.
- `rejectUnauthorized` is set to false to accept the self-signed certificate. It accepts all certificates but it still keeps the connection encrypted.
- `passphrase` is the passphrase for the client's private key. If the client's private key is not encrypted, this option is not needed. (See step 2.)