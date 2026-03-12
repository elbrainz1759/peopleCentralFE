#!/bin/bash
set -e

# ─── System update ───────────────────────────────────────────
apt-get update -y
apt-get upgrade -y

# ─── Install Docker ──────────────────────────────────────────
apt-get install -y ca-certificates curl gnupg lsb-release unzip

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# ─── Install AWS CLI v2 ──────────────────────────────────────
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./install
rm -rf awscliv2.zip aws/

# ─── Install CloudWatch Agent ────────────────────────────────
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# ─── CloudWatch Agent config ─────────────────────────────────
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'CWCONFIG'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/app/app.log",
            "log_group_name": "/aws/ec2/${app_name}",
            "log_stream_name": "{instance_id}/app",
            "timestamp_format": "%Y-%m-%dT%H:%M:%S"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/aws/ec2/${app_name}",
            "log_stream_name": "{instance_id}/nginx-access"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/aws/ec2/${app_name}",
            "log_stream_name": "{instance_id}/nginx-error"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "PeopleCentral/EC2",
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "resources": ["/"],
        "metrics_collection_interval": 60
      }
    }
  }
}
CWCONFIG

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

systemctl enable amazon-cloudwatch-agent

# ─── Install Nginx ───────────────────────────────────────────
apt-get install -y nginx

cat > /etc/nginx/sites-available/default << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Next.js App Router headers
        proxy_set_header Accept $http_accept;
        proxy_set_header RSC $http_rsc;
        proxy_set_header Next-Router-State-Tree $http_next_router_state_tree;
        proxy_set_header Next-Url $http_next_url;
    }
}
NGINX

systemctl enable nginx
systemctl restart nginx

# ─── Create log directory for app ────────────────────────────
mkdir -p /var/log/app
chown ubuntu:ubuntu /var/log/app

# ─── Pull and run Docker container ───────────────────────────
# This runs on first boot. CI/CD handles subsequent deploys.
AWS_REGION="${aws_region}"
ECR_URL="${ecr_repository_url}"

if [ -n "$ECR_URL" ]; then
  aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_URL

  docker pull $ECR_URL:latest || true

  docker run -d \
    --name people-central-fe \
    --restart unless-stopped \
    -p 3000:3000 \
    --log-driver awslogs \
    --log-opt awslogs-region=$AWS_REGION \
    --log-opt awslogs-group=/aws/ec2/${app_name} \
    --log-opt awslogs-stream=docker \
    $ECR_URL:latest
fi

echo "Bootstrap complete!"
