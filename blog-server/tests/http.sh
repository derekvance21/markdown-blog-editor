#!/bin/bash

passed=1

test() {
  local method=$1
  local path=$2
  local expected=$3
  local options=$4
  local cmd="curl -s -o /dev/null -w %{http_code} -X $method 'http://localhost:3000$path' $options"
  
  local code=`eval $cmd`
  if [[ code -ne $expected ]]; then
    echo "Failed: $code, expected: $expected -- $method $path $options"
    passed=0
  fi
}

result() {
  rm -f $cookie
  if [[ $1 -eq 1 ]]; then
    echo "All tests passed!"
    exit 0
  else
    echo "Failed to pass all tests"
    exit 1
  fi
}

# blog
test GET /blog/posts 404
test GET /blog/cs144 200
test GET /blog/cs144/1 200
test GET /blog/cs144/209 404
test GET /blog/cs143 404
test GET /blog/cs143/1 404
test GET /blog/user2?start=5 200
test GET /blog/user2?start=7 404

# login
test GET /login 200
test POST /login 200 "-d username=cs144 -d password=password"
test POST /login?redirect=/login 200 "-d username=cs144 -d password=password" # redirect is in query, not body
test POST /login 302 "-d redirect=/login -d username=cs144 -d password=password"
test POST /login 401 "-d username=cs144 -d password=passwordd"
test POST /login 401 "-d username=cs143 -d password=password"
test POST /login 401 "-d username=cs144"
test POST /login 401 "-d password=password"
test POST /login 401 ""

# api
cookie=`mktemp` || result 0

# get cookie
test POST /login 200 "-d username=user2 -d password=blogserver -c $cookie"

# GET
test GET /api/posts?username=cs144 401 "-b $cookie"
test GET /api/posts?username=user2 200 "-b $cookie"
test GET "/api/posts?username=user2&postid=6" 200 "-b $cookie"
test GET "/api/posts?username=user2&postid=six" 400 "-b $cookie"
test GET "/api/posts?username=user2&postid=7" 404 "-b $cookie"

# POST
test POST /api/posts 400 "-b $cookie -d username=user2 -d postid=0 -d title=CurlTitle"
test POST /api/posts 400 "-b $cookie -d username=user2 -d postid=zero -d title=CurlTitle -d body=CurlBody"
test POST /api/posts 201 "-b $cookie -d username=user2 -d postid=0 -d title=CurlTitle -d body=CurlBody"
test GET "/api/posts?username=user2&postid=7" 200 "-b $cookie"
test POST /api/posts 404 "-b $cookie -d username=user2 -d postid=8 -d title=CurlTitle_ -d body=CurlBody_"
test POST /api/posts 200 "-b $cookie -d username=user2 -d postid=7 -d title=CurlTitle_ -d body=CurlBody_"

# DELETE
test DELETE "/api/posts?username=user2&postid=7" 401
test DELETE "/api/posts?username=user2&postid=8" 404 "-b $cookie"
test DELETE "/api/posts?username=user2" 400 "-b $cookie"
test DELETE "/api/posts?username=user2&postid=7" 204 "-b $cookie"

result passed