docker build -t node_puppeteer .

docker run -dit --shm-size=1gb --name tinder_automation --restart always -v //c/Dropbox/SimpleSoftwareStudioShare/Node_TinderAutomation/:/app node_puppeteer