pipeline {

    agent any

    environment {

        AWS_REGION = 'ap-south-1'

        DOCKER_USERNAME = 'YOUR_DOCKER_USERNAME'

        FRONTEND_IMAGE = "${DOCKER_USERNAME}/frontend"
        BACKEND_IMAGE  = "${DOCKER_USERNAME}/backend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        stage('Test') {
            steps {
                echo 'Running application tests...'

                // Add your actual tests here
                sh '''
                    echo "Tests passed"
                '''
            }
        }


        stage('Build Docker Images') {
            steps {

                sh '''
                    docker build \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        ./frontend

                    docker build \
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                        ./backend
                '''
            }
        }


        stage('Push to Docker Hub') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | \
                        docker login \
                        -u "$DOCKER_USER" \
                        --password-stdin

                        docker push \
                            ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                        docker push \
                            ${BACKEND_IMAGE}:${BUILD_NUMBER}

                        docker logout
                    '''
                }
            }
        }


        stage('Terraform Init') {
            steps {

                dir('terraform') {

                    sh '''
                        terraform init
                    '''
                }
            }
        }


        stage('Terraform Validate') {
            steps {

                dir('terraform') {

                    sh '''
                        terraform validate
                    '''
                }
            }
        }


        stage('Terraform Plan') {
            steps {

                dir('terraform') {

                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: 'aws-credentials']
                    ]) {

                        sh '''
                            terraform plan
                        '''
                    }
                }
            }
        }


        stage('Terraform Apply') {
            steps {

                dir('terraform') {

                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: 'aws-credentials']
                    ]) {

                        sh '''
                            terraform apply -auto-approve
                        '''
                    }
                }
            }
        }


        stage('Get EC2 IP') {
            steps {

                dir('terraform') {

                    script {

                        env.EC2_IP = sh(
                            script: 'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()

                        echo "EC2 Public IP: ${env.EC2_IP}"
                    }
                }
            }
        }


        stage('Deploy Application') {
            steps {

                sshagent(['ec2-ssh-key']) {

                    sh '''
                        echo "Copying docker-compose.yml..."

                        scp \
                            -o StrictHostKeyChecking=no \
                            docker-compose.yml \
                            ubuntu@${EC2_IP}:/home/ubuntu/


                        echo "Starting application..."

                        ssh \
                            -o StrictHostKeyChecking=no \
                            ubuntu@${EC2_IP} \
                            "cd /home/ubuntu && \
                             export IMAGE_TAG=${BUILD_NUMBER} && \
                             docker compose pull && \
                             docker compose up -d"
                    '''
                }
            }
        }


        stage('Verify Application') {
            steps {

                sshagent(['ec2-ssh-key']) {

                    sh '''
                        ssh \
                            -o StrictHostKeyChecking=no \
                            ubuntu@${EC2_IP} \
                            "docker ps"
                    '''
                }
            }
        }
    }


    post {

        success {
            echo "======================================"
            echo "DEPLOYMENT SUCCESSFUL"
            echo "EC2 IP: ${env.EC2_IP}"
            echo "======================================"
        }

        failure {
            echo "======================================"
            echo "PIPELINE FAILED"
            echo "======================================"
        }
    }
}
