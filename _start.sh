docker build -t node_puppeteer .

docker run -ti --shm-size=1gb --rm --name tinder_automation -e DISPLAY=192.168.178.58:0.0 -v //c/Dropbox/SimpleSoftwareStudioShare/Node_TinderAutomation/:/app node_puppeteer
