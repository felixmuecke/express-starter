This repo is heavily inspired by https://github.com/hagopj13/node-express-boilerplate and in parts straight up copied.
The goal of this repo is twofold. I want to have a production ready express boilerplate that I have written myself and
therefore understand every bit of it, for if (when) it needs to be adapted at some point.
Second, I want to use this README to collect lessons learned, notes, explaining how things work and why.
This might not be complete and grow over time when lessons learned from real world projects enter this starter project.

# Logging

Using winston and morgan.
Winston is the actual logger, writing messages to console, file etc.
When configuring winston you specify the targets of logging, which levels to log in which environments etc.

Morgan is a middleware that just simplifies request, response logging for you and produces log messages in a sensible format. Without morgan you'd have to compose these messages yourself.

# Models

## Mongoose

- When defining Schema.statics, `this` points to the schema itself.
- When defining Schema.methods, `this` points to the document.

- TIL: when sending back docs with express via res.send(doc) internally this calls doc.toJSON().
  That's the reason plugins that define a transform function for toJSON() work and are applied when sending back mongoose docs.
  See https://mongoosejs.com/docs/api.html#document_Document-toJSON.

# Layers

What are the roles and responsibilities of the different layers that are part of an express application.

## Service

This is the business logic and database interaction layer. A route should never directly call a service.
In an ideal world, the service layer should not assume it's part of a (REST) Api. In practice that is
cumbersome to enforce. For example it is just very convenient to throw ApiErrors directly in the service layer. Services can call other services.

## Controller

Uses services to perform the given task. Ideally does not contain any additional business logic, that is not covered by the services. Controllers can not call other controllers.
This is also the top level of executed logic in the applications. Controller functions are all wrapped in
catchAsync. This gives the developer the convenience to just throw errors in deeper levels (services, mongoose static/methods). These errors can then be handled by global error handlers.

## Route

Translate a request to the appropriate controller. This is also the place to call the right validator for incoming payloads, define if a route needs authentication or not and call any additional route specific middleware.

## Middleware

Functions with an express specific signature that can be applied to all or specific routes. They are called before the controller executes. An exception to this are errorHandlers which are called last and have a different signature.

# Authentication

# Validation

The way the validation schemas are constructed here allows me to specify where I expect my data to be (params, body, query).

# Testing
