# ptl-rpc

> Specification of data exchange protocol

> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
> NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
> "OPTIONAL" in this document are to be interpreted as described in
> [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

## 1. Common

Projectile messaging requires:

- a Projectile client sending requests;
- a Projectile server answering requests with responses;
- a message exchange channel that connects them;

Both Projectile server and client accept and output JSON objects. Message
exchange channel thus **MUST** support transfering this objects. Below this we
will assume that we are using JSON to encode the data and HTTP to transfer.

## 2. Messages Structure

### 2.1. Common

Both request and response **MUST** contain top-level properties named `"ptl"`.
This property **MUST** contain string representing information of protocol
version being used. For it **MUST** start with following prefixes:

- `"req@"` for requests;
- `"res@"` for responses.

After the prefix, protocol version is appended, e.g. `"req@1.0.0"`. Protocol
versions **SHOULD** follow
[Semantic Versioning 2.0.0 spec](https://semver.org/spec/v2.0.0.html).

Both request and response also **MAY** have top-level property `"ctx"` that
**MUST** be a hash. If it is not includes, it **MUST** be treated as an empty
hash (`{}`).

### 2.2. Request

#### 2.2.1. Action Structure

### 2.3. Response

#### 2.3.1. Result Structure

## 3. Behavior

### 3.1. Protocol Version Matching

### 3.2. Context handling
