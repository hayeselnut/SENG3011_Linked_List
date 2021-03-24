Test by Postman/Newman.
=================================== 
for use newman,use this command for install newman (need node.js)
-----------------------------------------------------------------
###
npm install -g newman
###
for html
###
npm install newman-reporter-html
###
here is test url for Postman:
-----------------------------------
###
Unit ：https://www.getpostman.com/collections/1a5d1dae4538a1553d66
###
Load ：https://www.getpostman.com/collections/4b2958b34f3261e9cc7e
###
for unit test
--------------
###
newman run Seng3011-Api.postman_collection.json -r
###
for load test
--------------
###
newman run Load-Seng3011.postman_collection.json -r -n 60
###

