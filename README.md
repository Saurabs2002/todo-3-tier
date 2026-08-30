# Todo 3-Tier Application - DevOps Automation Project

## Project Overview

This project demonstrates an end-to-end DevOps implementation of a 3-tier Todo application using modern cloud-native and automation tools.

The application is containerized using Docker and deployed on an AWS EC2 instance using Jenkins CI/CD automation.

The complete deployment process includes:

* Source code checkout
* Docker image creation
* Docker image publishing
* Infrastructure provisioning using Terraform
* EC2 instance creation
* Automated application deployment
* Database deployment
* Monitoring setup using Prometheus and Grafana

---

# Architecture Overview

```
                    Developer
                        |
                        |
                    Git Repository
                        |
                        |
                    Jenkins Pipeline
                        |
        --------------------------------
        |              |               |
     Docker        Terraform        Deployment
     Build         Provisioning       Script
        |              |               |
        |              |               |
 Docker Hub        AWS EC2        SSH Deployment
                                    |
                                    |
                            Docker Compose
                                    |
        ------------------------------------------------
        |              |              |                 |
    Frontend       Backend       PostgreSQL       Monitoring
    Nginx          API           Database        Stack
                                                 |
                                      -----------------------
                                      |                     |
                                Prometheus             Grafana

```

---

# Technology Stack

## Cloud

* AWS EC2
* AWS IAM
* AWS VPC

## Infrastructure as Code

* Terraform

## CI/CD

* Jenkins
* Git

## Containerization

* Docker
* Docker Compose

## Application

Frontend:

* React / Nginx

Backend:

* Node.js API

Database:

* PostgreSQL

## Monitoring

* Prometheus
* Grafana

---

# Project Directory Structure

```
Todo-3-tier
|
├── Jenkinsfile
|
├── scripts
│
│   ├── config.groovy
│   ├── docker.groovy
│   ├── terraform.groovy
│   ├── ec2.groovy
│   ├── deploy.groovy
│   └── verify.groovy
|
├── frontend
│   └── Dockerfile
|
├── backend
│   └── Dockerfile
|
├── terraform
│
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
|
├── monitoring
│
│   └── prometheus
│       └── prometheus.yml
|
├── docker-compose.yml
|
└── jenkins-inputs.properties

```

---

# Jenkins Pipeline Architecture

The Jenkins pipeline is modularized into multiple Groovy files for better maintenance.

## Jenkinsfile

The main Jenkinsfile controls only the pipeline execution flow.

Pipeline stages:

```
Load Configuration
        |
        |
Build Docker Images
        |
        |
Push Docker Images
        |
        |
Terraform Infrastructure
        |
        |
Get EC2 IP
        |
        |
Wait For SSH
        |
        |
Deploy Application
        |
        |
Verify Deployment

```

---

# Jenkins Groovy Modules

## config.groovy

Responsible for:

* Reading `jenkins-inputs.properties`
* Loading environment variables
* Setting application configuration

Example:

```
AWS_REGION
DOCKER_USERNAME
FRONTEND_IMAGE
BACKEND_IMAGE
TERRAFORM_DIR
EC2_USER

```

---

## docker.groovy

Responsible for:

* Building frontend Docker image
* Building backend Docker image
* Tagging images
* Pushing images to Docker Hub

Flow:

```
Dockerfile
    |
Docker Build
    |
Docker Tag
    |
Docker Push
```

---

## terraform.groovy

Responsible for:

* Terraform initialization
* Infrastructure provisioning
* Creating EC2 instance

Commands:

```
terraform init

terraform apply

```

---

## ec2.groovy

Responsible for:

* Fetching EC2 public IP
* Checking SSH availability
* Waiting until EC2 is ready

SSH retry mechanism:

```
Retry 20 times
Wait 15 seconds
Connect again

```

---

## deploy.groovy

Responsible for application deployment.

Steps:

1. Connect to EC2
2. Install Docker
3. Install Docker Compose
4. Create application directory
5. Copy docker-compose file
6. Copy Prometheus configuration
7. Create environment file
8. Pull Docker images
9. Start containers

---

## verify.groovy

Responsible for deployment validation.

Checks:

```
docker ps

docker compose ps

container status

```

---

# Jenkins Setup

## Install Jenkins

Install Java:

```bash
sudo apt update

sudo apt install openjdk-17-jdk -y

```

Install Jenkins:

```bash
sudo apt install jenkins -y


sudo systemctl start jenkins


sudo systemctl enable jenkins

```

Access Jenkins:

```
http://<jenkins-server-ip>:8080

```

---

# Required Jenkins Plugins

Install following plugins:

## Pipeline Plugins

* Pipeline
* Pipeline Utility Steps

## Git Plugins

* Git Plugin
* GitHub Integration Plugin

## Docker Plugins

* Docker Pipeline Plugin
* Docker Commons Plugin

## Credential Plugins

* Credentials Binding Plugin
* SSH Agent Plugin

---

# Jenkins Credentials

## Docker Hub Credential

Type:

```
Username with password

```

Credential ID:

```
dockerhub-credentials

```

Used for:

* Docker login
* Docker push

---

## EC2 SSH Credential

Type:

```
SSH Username with private key

```

Credential ID:

```
ec2-ssh-key

```

Used for:

* EC2 connection
* Remote deployment

---

# Application Deployment

## Docker Compose Services

The application runs using Docker Compose.

Services:

```
frontend

backend

postgres

prometheus

grafana

```

---

# Database Configuration

PostgreSQL container:

Environment:

```
POSTGRES_DB=todo

POSTGRES_USER=postgres

POSTGRES_PASSWORD=postgres

```

Database storage:

```
postgres-data volume

```

---

# Monitoring Setup

## Prometheus

Prometheus collects application and container metrics.

Configuration:

```
monitoring/prometheus/prometheus.yml

```

Access:

```
http://<EC2-IP>:9090

```

---

## Grafana

Grafana provides visualization dashboards.

Access:

```
http://<EC2-IP>:3001

```

Steps:

1. Login to Grafana

2. Add Prometheus datasource

URL:

```
http://prometheus:9090

```

3. Import dashboard

Recommended dashboards:

* Docker Container Monitoring
* Node Exporter Dashboard

---

# Running Project Manually

## Clone Repository

```
git clone <repository-url>

cd Todo-3-tier

```

---

## Build Images

Frontend:

```
docker build -t frontend ./frontend

```

Backend:

```
docker build -t backend ./backend

```

---

## Start Application

```
docker compose up -d

```

Check:

```
docker compose ps

```

---

# Common Issues Faced

## 1. Docker Permission Issue

Problem:

```
permission denied while connecting to docker daemon

```

Solution:

```
sudo usermod -aG docker ubuntu

newgrp docker

```

---

## 2. Terraform AWS Authentication Error

Problem:

```
InvalidClientTokenId

```

Solution:

* Configure AWS credentials
* Verify IAM permissions

---

## 3. SSH Connection Failure

Problem:

```
Connection timeout

```

Solution:

* Added SSH retry mechanism
* Waited until EC2 initialization completed

---

## 4. Backend Database Connection Issue

Problem:

Backend unable to connect with PostgreSQL.

Solution:

* Used Docker Compose service name
* Added database health check
* Configured dependency order

---

## 5. Prometheus Empty Query Result

Problem:

Query:

```
rate(container_cpu_usage_seconds_total[5m])

```

returned:

```
No data

```

Solution:

* Configure container metrics exporter
* Verify Prometheus targets
* Check scrape configuration


---

# Author

DevOps Engineer

Project: Todo 3-Tier Application Deployment Automation

Skills Demonstrated:

* Jenkins CI/CD
* Docker
* Terraform
* AWS
* Linux
* Monitoring
* Infrastructure Automation
