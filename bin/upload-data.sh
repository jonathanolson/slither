#!/bin/bash

git add ./data-sequences
git commit -m "data"
git pull --rebase
git push origin main
