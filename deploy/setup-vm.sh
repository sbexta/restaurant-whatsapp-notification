#!/bin/bash
# One-time setup for a fresh e2-micro (1GB RAM) Ubuntu VM.
# Run once via SSH: bash setup-vm.sh
set -euo pipefail

echo "== Creating 2GB swap file (required on a 1GB RAM VM) =="
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi
free -h

echo "== Installing Docker =="
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi
docker --version

echo "== Done. Log out and back in for the docker group to take effect, =="
echo "== then clone the repo and run deploy.sh from the deploy/ folder. =="
