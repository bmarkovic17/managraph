# ManaGraph REST API service

## System requirements

---

In order to be able to run this app Node.js version greater or equal to 15.3.0 should be installed, since this app is written as an ES module and prior versions of Node had it as an experimental feature, therefore it is not officialy supported or tested on versions prior to 15.3.0.

## .env configuration

---

Configuration of this REST API service is possible via an .env file which should be put on the root folder of this project. These keys are supported:

1. EXPRESS_PORT - a numeric key which sets the port of the express app. In case of an invalid or missing value, port number 3000 will be used.
2. PRODUCTION - a boolean key which sets the app in production mode. Currently this setting is only relevant for error handling. In case of an invalid or missing value, app will run in development mode.
