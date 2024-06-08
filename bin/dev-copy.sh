#!/bin/bash

rm -Rf ../jonathanolson.github.com/slitherlink-dev/*
cp -R ./dist/* ../jonathanolson.github.com/slitherlink-dev/

# the index.html
echo "---
layout: simple
title: How Slitherlink Should be Solved
categories: experiments
mathjax: false
hidecomments: true
---
" > ../jonathanolson.github.com/slitherlink-dev/index.html

cat ./dist/index.html >> ../jonathanolson.github.com/slitherlink-dev/index.html
