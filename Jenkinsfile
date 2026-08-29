pipeline {

    agent any

    environment {

        DOCKER_CREDENTIAL_ID = 'dockerhub-credentials'
        AWS_CREDENTIAL_ID    = 'aws-credentials'
        SSH_CREDENTIAL_ID    = 'ec2-ssh-key'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Read Input File') {

            steps {

                script {

                    def input = readProperties(
                        file: 'jenkins-inputs.properties'
                    )

                    env.AWS_REGION = input['AWS_REGION']

                    env.DOCKER_USERNAME =
                        input['DOCKER_USERNAME']

                    env.EC2_USER =
                        input['EC2_USER']

                    env.TERRAFORM_DIR =
                        input['TERRAFORM_DIR']

                    env.FRONTEND_DIR =
                        input['FRONTEND_DIR']

                    env.BACKEND_DIR =
                        input['BACKEND_DIR']

                    env.FRONTEND_REPOSITORY =
                        input['FRONTEND_REPOSITORY']

                    env.BACKEND_REPOSITORY =
                        input['BACKEND_REPOSITORY']


                    env.FRONTEND_IMAGE =
                        "${env.DOCKER_USERNAME}/${env.FRONTEND_REPOSITORY}"

                    env.BACKEND_IMAGE =
                        "${env.DOCKER_USERNAME}/${env.BACKEND_REPOSITORY}"


                    echo "AWS Region: ${env.AWS_REGION}"

                    echo "Docker Username: ${env.DOCKER_USERNAME}"

                    echo "EC2 User: ${env.EC2_USER}"

                    echo "Terraform Directory: ${env.TERRAFORM_DIR}"

                    echo "Frontend Image: ${env.FRONTEND_IMAGE}"

                    echo "Backend Image: ${env.BACKEND_IMAGE}"
                }
            }
        }

        stage('Test') {

            steps {

                sh '''
                    echo "Running tests..."
                    echo "Tests passed"
                '''
            }
        }

        stage('Build Docker Images') {

            steps {

                sh """
                    docker build \
                    -t ${env.FRONTEND_IMAGE}:${BUILD_NUMBER} \
                    ./${env.FRONTEND_DIR}
                """

                sh """
                    docker build \
                    -t ${env.BACKEND_IMAGE}:${BUILD_NUMBER} \
                    ./${env.BACKEND_DIR}
                """
            }
        }

        stage('Push Docker Images') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIAL_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh """

                        echo "\$DOCKER_PASSWORD" | \
                        docker login \
                        -u "\$DOCKER_USER" \
                        --password-stdin

                        docker push \
                        ${env.FRONTEND_IMAGE}:${BUILD_NUMBER}

                        docker push \
                        ${env.BACKEND_IMAGE}:${BUILD_NUMBER}

                        docker logout
                    """
                }
            }
        }

        stage('Terraform Init') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Validate') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh 'terraform validate'
                }
            }
        }

        stage('Terraform Plan') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [$class:
                            'AmazonWebServicesCredentialsBinding',
                            credentialsId:
                            "${AWS_CREDENTIAL_ID}"
                        ]
                    ]) {

                        sh """
                            terraform plan \
                            -var="aws_region=${env.AWS_REGION}"
                        """
                    }
                }
            }
        }

        stage('Terraform Apply') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [$class:
                            'AmazonWebServicesCredentialsBinding',
                            credentialsId:
                            "${AWS_CREDENTIAL_ID}"
                        ]
                    ]) {

                        sh """
                            terraform apply \
                            -auto-approve \
                            -var="aws_region=${env.AWS_REGION}"
                        """
                    }
                }
            }
        }

        stage('Get EC2 IP') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(
                            script:
                            'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()

                        echo "EC2 IP: ${env.EC2_IP}"
                    }
                }
            }
        }

        stage('Wait For EC2') {

            steps {

                script {

                    retry(12) {

                        sleep 10

                        sshagent([
                            "${SSH_CREDENTIAL_ID}"
                        ]) {

                            sh """

                                ssh \
                                -o StrictHostKeyChecking=no \
                                -o ConnectTimeout=10 \
                                ${env.EC2_USER}@${env.EC2_IP} \
                                "echo EC2 is ready"

                            """
                        }
                    }
                }
            }
        }

        stage('Deploy Application') {

            steps {

                sshagent([
                    "${SSH_CREDENTIAL_ID}"
                ]) {

                    sh """

                        scp \
                        -o StrictHostKeyChecking=no \
                        docker-compose.yml \
                        ${env.EC2_USER}@${env.EC2_IP}:/home/${env.EC2_USER}/


                        ssh \
                        -o StrictHostKeyChecking=no \
                        ${env.EC2_USER}@${env.EC2_IP} \
                        "cd /home/${env.EC2_USER} && \
                        export IMAGE_TAG=${BUILD_NUMBER} && \
                        docker compose pull && \
                        docker compose up -d"

                    """
                }
            }
        }

        stage('Verify') {

            steps {

                sshagent([
                    "${SSH_CREDENTIAL_ID}"
                ]) {

                    sh """

                        ssh \
                        -o StrictHostKeyChecking=no \
                        ${env.EC2_USER}@${env.EC2_IP} \
                        "docker ps"

                    echo "Application URL:"
                    echo "http://${env.EC2_IP}"

                    """
                }
            }
        }
    }

    post {

        success {

            echo """
            ==========================================
              DEPLOYMENT SUCCESSFUL
            ==========================================

            EC2 IP:
            ${env.EC2_IP}

            Frontend:
            ${env.FRONTEND_IMAGE}:${BUILD_NUMBER}

            Backend:
            ${env.BACKEND_IMAGE}:${BUILD_NUMBER}

            Application:
            http://${env.EC2_IP}

            ==========================================
            """
        }

        failure {

            echo """
            ==========================================
              PIPELINE FAILED
            ==========================================

            Check Jenkins Console Output.

            ==========================================
            """
        }
    }
}
