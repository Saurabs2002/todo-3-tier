# Todo 3-Tier Application - Docker, Jenkins, Terraform, AWS & Monitoring

## Project Overview

This project demonstrates the deployment of a **3-tier Todo application** using modern DevOps practices.

The application consists of:

- Frontend: React / Nginx based UI
- Backend: Node.js REST API
- Database: PostgreSQL
- Containerization: Docker & Docker Compose
- Infrastructure Provisioning: Terraform
- CI/CD Automation: Jenkins
- Cloud Platform: AWS EC2
- Monitoring: Prometheus + Grafana + cAdvisor

The complete workflow automates:

1. Docker image creation
2. Image publishing to Docker Hub
3. AWS EC2 infrastructure provisioning
4. Application deployment using Docker Compose
5. Container monitoring using Prometheus and Grafana


---

# Architecture

```
                 User
                  |
                  |
              AWS EC2
                  |
        ---------------------
        |                   |
     Frontend            Backend
     Nginx               Node.js
     Port 80             Port 3000
                            |
                            |
                       PostgreSQL
                       Port 5432


Monitoring:

        Docker Containers
                |
             cAdvisor
                |
           Prometheus
                |
             Grafana
             Port 3001
```


---

# Technology Stack

## Cloud

- AWS EC2
- AWS Security Groups
- AWS IAM


## Infrastructure as Code

- Terraform


## CI/CD

- Jenkins
- GitHub


## Containerization

- Docker
- Docker Compose


## Application

Frontend:

- React
- Nginx


Backend:

- Node.js
- Express API


Database:

- PostgreSQL


## Monitoring

- Prometheus
- Grafana
- cAdvisor


---

# Project Folder Structure

```
Todo-3-tier/

├── frontend/
│   ├── Dockerfile
│   └── React application


├── backend/
│   ├── Dockerfile
│   └── Node.js application


├── monitoring/
│   └── prometheus/
│       └── prometheus.yml


├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf


├── docker-compose.yml

├── Jenkinsfile

└── jenkins-inputs.properties

```


---

# Prerequisites

Install the following tools:

## Local Machine

- Git
- Docker
- Docker Compose
- Terraform


## AWS

Required:

- AWS Account
- IAM user with required permissions
- EC2 Key Pair


## Jenkins

Required plugins:

- Pipeline Plugin
- Docker Pipeline Plugin
- SSH Agent Plugin
- Credentials Binding Plugin


---

# Configuration

Create:

```
jenkins-inputs.properties
```


Example:

```properties
aws_region=ap-south-1

docker_username=<dockerhub_username>

frontend_image=todo-frontend

backend_image=todo-backend


frontend_directory=frontend

backend_directory=backend


prometheus_directory=monitoring/prometheus


terraform_directory=terraform


ami_id=<ami-id>

instance_type=t2.micro

key_name=<aws-key-name>

ec2_user=ubuntu
```


---

# Running Application Manually

## 1. Clone Repository

```bash
git clone <repository-url>

cd Todo-3-tier
```


---

## 2. Build Docker Images

Frontend:

```bash
docker build \
-t username/todo-frontend:latest \
./frontend
```


Backend:

```bash
docker build \
-t username/todo-backend:latest \
./backend
```


---

## 3. Push Images

Login:

```bash
docker login
```


Push:

```bash
docker push username/todo-frontend:latest

docker push username/todo-backend:latest
```


---

# Deploy Infrastructure using Terraform

Navigate:

```bash
cd terraform
```


Initialize:

```bash
terraform init
```


Validate:

```bash
terraform validate
```


Plan:

```bash
terraform plan
```


Create EC2:

```bash
terraform apply -auto-approve
```


Get EC2 IP:

```bash
terraform output public_ip
```


---

# Deploy Application using Docker Compose

SSH into EC2:

```bash
ssh -i key.pem ubuntu@<EC2-IP>
```


Install Docker:

```bash
sudo apt update

sudo apt install docker.io docker-compose-v2 -y
```


Clone project or copy compose file.


Start application:

```bash
docker compose up -d
```


Check containers:

```bash
docker ps
```


Expected containers:

```
todo-frontend
todo-backend
todo-postgres
prometheus
grafana
cadvisor
```


---

# CI/CD Pipeline Flow

Jenkins pipeline performs:

```
Developer Push Code
        |
        |
      GitHub
        |
        |
     Jenkins
        |
        |
 Build Docker Images
        |
        |
 Push Images
        |
        |
 Terraform Create EC2
        |
        |
 Deploy Docker Compose
        |
        |
 Application Running
```


---

# Monitoring Setup

## Prometheus

URL:

```
http://<EC2-IP>:9090
```


Prometheus collects:

- Container CPU usage
- Memory usage
- Network metrics


---

## Grafana

URL:

```
http://<EC2-IP>:3001
```


Add Prometheus datasource:

```
Connections
    |
Data Sources
    |
Prometheus
```


URL:

```
http://prometheus:9090
```


---

# Import Grafana Dashboard

Steps:

```
Grafana

Dashboard

New Dashboard

Import
```


Use dashboard ID:

```
10619
```


Select datasource:

```
Prometheus
```


Dashboard shows:

- Container CPU
- Container Memory
- Container Status
- Network Usage


---

# Common Issues Faced and Solutions


## 1. Docker Permission Denied

### Issue

```
permission denied while connecting to Docker daemon socket
```


### Solution

Add Jenkins user to Docker group:

```bash
sudo usermod -aG docker jenkins

sudo systemctl restart jenkins
```


---

## 2. Docker Login Failed

### Issue

```
unauthorized: authentication required
```


### Solution

Use Docker Hub access token instead of password.

Create Jenkins credential:

```
Username Password
```

Use in pipeline:

```
docker login --password-stdin
```


---

## 3. Terraform EC2 Creation Failed

### Issue

```
Invalid AWS credentials
```


### Solution

Configure AWS credentials:

```bash
aws configure
```


Verify:

```bash
aws sts get-caller-identity
```


---

## 4. SSH Connection Failed

### Issue

```
Connection timeout
```


### Solution:

Check:

- Security Group port 22
- Correct username
- Correct private key permission


Fix key permission:

```bash
chmod 400 key.pem
```


---

## 5. Prometheus Showing No Data

### Issue

Grafana panels show:

```
No data
```


### Solution:

Install cAdvisor.


Verify:

```bash
docker ps
```


Check metrics:

```bash
curl localhost:8080/metrics
```


Restart:

```bash
docker compose restart prometheus
```


---

## 6. Container CPU Metrics Missing

### Issue

Query:

```promql
rate(container_cpu_usage_seconds_total[5m])
```

returns:

```
Empty query result
```


### Solution:

Add cAdvisor service in docker-compose:

```
Docker Containers
        |
     cAdvisor
        |
   Prometheus
        |
    Grafana
```


---

# Useful Docker Commands

Check running containers:

```bash
docker ps
```


View logs:

```bash
docker logs <container-name>
```


Restart application:

```bash
docker compose restart
```


Stop application:

```bash
docker compose down
```


Check resources:

```bash
docker stats
```


---

# Author

Saurabh Singh

DevOps Engineer

Skills:

- AWS
- Docker
- Kubernetes
- Terraform
- Jenkins
- Prometheus
- Grafana
