#!/bin/bash

# conda activate env
echo "conda activate env"
eval "$(conda shell.bash hook)"
conda activate audio-2-led

echo "cleaning old build files"
rm -Rf build; rm -Rf dist;
rm -Rf **/*.pyc
# find . | grep -E \"(__pycache__|.pyc|.pyo)\"| xargs rm -rf
echo "building new one"
pyinstaller --icon='resources/icon.icns' --onedirectory --windowed music2led.spec;
