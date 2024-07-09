#!/bin/bash

rm -Rf ../jonathanolson.github.com/slitherlink/*
cp -R ./dist/* ../jonathanolson.github.com/slitherlink/
rm ../jonathanolson.github.com/slitherlink/index.html

# the index.html
echo "---
layout: default
title: How Slitherlink Should be Solved
lead: An opinionated guide on new techniques and strategies
permalink: /slitherlink/index.html
categories: article
header: slitherlink
importance: 7
thumbnail: /img/slitherlink-dark-pattern.png
description: >-
  An opinionated guide on new techniques and strategies for solving Slitherlink puzzles, with a web app to play with the concepts and a library of patterns.
---
" > ../jonathanolson.github.com/_posts/2024-05-24-slitherlink.html

cat ./dist/index.html >> ../jonathanolson.github.com/_posts/2024-05-24-slitherlink.html
