# ptl-rpc

> Specification of data exchange protocol

> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
> NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
> "OPTIONAL" in this document are to be interpreted as described in
> [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

This document describes protocol version `0.0.1`.

## 1. Common

Projectile messaging requires:

- a Projectile client sending requests;
- a Projectile server answering requests with responses;
- a message exchange channel that connects them;

Both Projectile server and client accept and output JSON objects. Message
exchange channel thus **MUST** support transfering this objects. Below this we
will assume that we are using JSON to encode the data and HTTP to transfer.

## 2. Abstractions

This section describes terms used in text below an abstractions that they
refer to.

### 2.1. Layers and Properties

*Layer* is an entity that has a *name* and contains *properties*. A *property*
has its *name* too and also has its *value*. *Property* *name* **MUST** be
unique for the *layer* that contain it. In addition. *properties* have
following attributes:

- ability to be read (enabled/disabled);
- ability to be written (enabled/disabled);
- visibility from outside (visible/hidden);
- allowed value types.

Property value can be obtained if the property can be read, and can be replaced
by another value if the property can be written and another value's type is
allowed for the property.

### 2.2. Variables

### 2.3. Context

### 2.4. Methods

### 2.5. Actions

## 3. Messages Structure

### 3.1. Common

Both request and response **MUST** contain top-level properties named `"ptl"`.
This property **MUST** contain string representing information of protocol
version being used. For it **MUST** start with following prefixes:

- `"req@"` for requests;
- `"res@"` for responses.

After the prefix, protocol version is appended, e.g. `"req@1.0.0"`. Protocol
versions **SHOULD** follow
[Semantic Versioning 2.0.0 spec](https://semver.org/spec/v2.0.0.html).

Both request and response also **MAY** have top-level property `"ctx"` that
**MUST** be a hash. If it is not included, it **MUST** be treated as an empty
hash (`{}`).

### 3.2. Request

In addition to above fields, request **MUST** include property `"do"`. Its
value **MUST** be an array of objects, each representing a Projectile action.
Structure of these objects is described below.

#### 3.2.1. Action Structure

A Projectile action represents a command that server should run. Every action
**MUST** have `"name"` property. Action name is a string that identifies
some command at this server. It **MUST** be on of the following:

- name of a layer, followed by property name, with slash `/` between them;
- just name of a layer;
- literally `"*"` string (without quotes).

An action description **MAY** have `"action"` property. It can contain one of
these strings:

- `"call"`;
- `"get"`;
- `"set"`;
- `"sync"`.

If action description does not have this property, the server should behave as
it has `"call"` value.

An action description **MAY** have `"args"` property. Its value **MUST** be an
array. Kind of items in `"args"` array is not limited (until it can be
serialized with JSON). If action description lacks this property, the server
**MUST** behave as it was an empty array.

Not all combinations of `"name"`, `"args"` and `"action"` are considered valid.
The way a server must treat them is described in next sections.

### 3.3. Response

Beside common properties, response object can contain the following ones:

- `"result"`: **REQUIRED** property. Can either be null or an array of action
  results. **SHOULD** be null if general request processing error have occured
  (see appropriate section). If not null, **MUST** have as many items as
  appropriate request's `"do"` array has. Action result structure is described
  in section below.

- `"errors"`: **REQUIRED** property if there was at least one general request
  processing errors. Its value **MUST** be an array of occured error
  descriptions. Each error description **MUST** have string property
  `"message"` and **MAY** have any other properties. If no general request
  processing errors occured, this property **MUST** either have empty array
  value `[]` or be excluded from response object.

- `"patch"`: **OPTIONAL** property. If presented, **MUST** be an object. Every
  key of this object should be a name of some layer on the server. Appropriate
  values **MUST** also be objects.

#### 3.3.1. Action Result Structure

An action result represents either the result of successful action processing
or an error occured while processing. An action result **MUST** have `"data"`
property. Its value represents successful processing result. If there occured
an error while processing action, `"data"` property **MUST** have `null` value,
and action result description **MUST** include `"error"` property, which value
**MUST** have property `"message"` that is a `string`  describing error
details. Also `"error"` property **MAY** include any other properties.

## 4. Behavior

### 4.1. Protocol Version Matching

### 4.2. Context handling

### 4.3. Actions handling

### 4.3. Error handling

## 5. Examples

**Request**:

```json
{
    "ptl": "req@1.0.0",
    "ctx": { "token": "123" },
    "do": [
        {
            "name": "api/echo",
            "args": ["Hello", "ptl"]
        }
    ]
}
```

**Response**:

```json
{
    "ptl": "res@1.0.0",
    "result": [
        {
            "data": "Hello ptl"
        }
    ]
}
```
