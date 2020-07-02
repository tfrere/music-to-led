#!/bin/bash

# conda activate env
echo "conda activate env"
eval "$(conda shell.bash hook)"
conda activate audio-2-led

echo "cleaning old build files"
rm -Rf build; rm -Rf dist; rm ../electron/state-builder/music2led
# find . | grep -E \"(__pycache__|.pyc|.pyo)\"| xargs rm -rf
echo "building new one"
pyinstaller --icon='resources/icon.icns' --onefile --windowed music2led.spec;
cp ./dist/music2led ../electron/state-builder/
cp ./LOCAL_CONFIG.yml ../electron/state-builder/
