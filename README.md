[![Build Status](https://travis-ci.org/lycophron/lycophron.svg)](https://travis-ci.org/lycophron/lycophron)

### lycophron application

```bash
# Service registration
sudo cp lycophron/lycophron.service /etc/systemd/system/lycophron.service
sudo systemctl enable lycophron.service
sudo systemctl start lycophron.service 
journalctl -f -u lycophron.service

# Use this line if you change the service
sudo systemctl daemon-reload
```
