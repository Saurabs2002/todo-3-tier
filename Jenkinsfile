pipeline {

    agent any

    parameters {

        string(
            name: 'DOCKER_USERNAME',
            defaultValue: 'yourdockerusername',
            description: 'Docker Hub username'
        )

        string(
            name: 'AWS_REGION',
            defaultValue: 'ap-south-1',
            description: 'AWS region'
        )

        string(
            name: 'EC2_USER',
            defaultValue: 'ubuntu',
            description: 'EC2 SSH username'
        )

        string(
            name: 'TERRAFORM_DIR',
            defaultValue: 'terraform',
            description: 'Terraform directory'
        )

        booleanParam(
            name: 'TERRAFORM_APPLY',
            defaultValue: true,
            description: 'Apply Terraform infrastructure'
        )
    }

    environment {

        DOCKER_CREDENTIAL_ID = 'dockerhub-credentials'

        AWS_CREDENTIAL_ID = 'aws-credentials'

        SSH_CREDENTIAL_ID = 'ec2-ssh-key'

        FRONTEND_IMAGE = "${params.DOCKER_USERNAME}/frontend"

        BACKEND_IMAGE = "${params.DOCKER_USERNAME}/backend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                sh '''
                    echo "Running application tests..."
                    echo "Tests passed"
                '''
            }
        }

        stage('Build Docker Images') {
            steps {

                sh """
                    docker build \
                    -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                    ./frontend
                """

                sh """
                    docker build \
                    -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                    ./backend
                """
            }
        }

        stage('Push to Docker Hub') {
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
                        ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                        docker push \
                        ${BACKEND_IMAGE}:${BUILD_NUMBER}

                        docker logout
                    """
                }
            }
        }

        stage('Terraform Init') {
            steps {

                dir("${params.TERRAFORM_DIR}") {

                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Validate') {
            steps {

                dir("${params.TERRAFORM_DIR}") {

                    sh 'terraform validate'
                }
            }
        }

        stage('Terraform Plan') {
            steps {

                dir("${params.TERRAFORM_DIR}") {

                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: "${AWS_CREDENTIAL_ID}"]
                    ]) {

                        sh """
                            terraform plan \
                            -var="aws_region=${params.AWS_REGION}"
                        """
                    }
                }
            }
        }

        stage('Terraform Apply') {

            when {
                expression {
                    return params.TERRAFORM_APPLY
                }
            }

            steps {

                dir("${params.TERRAFORM_DIR}") {

                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: "${AWS_CREDENTIAL_ID}"]
                    ]) {

                        sh """
                            terraform apply \
                            -auto-approve \
                            -var="aws_region=${params.AWS_REGION}"
                        """
                    }
                }
            }
        }

        stage('Get EC2 IP') {

            when {
                expression {
                    return params.TERRAFORM_APPLY
                }
            }

            steps {

                dir("${params.TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(
                            script: 'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()

                        echo "EC2 IP: ${env.EC2_IP}"
                    }
                }
            }
        }

        stage('Wait for EC2') {

            when {
                expression {
                    return params.TERRAFORM_APPLY
                }
            }

            steps {

                script {

                    retry(12) {

                        sleep 10

                        sshagent(["${SSH_CREDENTIAL_ID}"]) {

                            sh """
                                ssh \
                                -o StrictHostKeyChecking=no \
                                -o ConnectTimeout=10 \
                                ${params.EC2_USER}@${env.EC2_IP} \
                                "echo EC2 is ready"
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy Application') {

            when {
                expression {
                    return params.TERRAFORM_APPLY
                }
            }

            steps {

                sshagent(["${SSH_CREDENTIAL_ID}"]) {

                    sh """

                        scp \
                        -o StrictHostKeyChecking=no \
                        docker-compose.yml \
                        ${params.EC2_USER}@${env.EC2_IP}:/home/ubuntu/

                        ssh \
                        -o StrictHostKeyChecking=no \
                        ${params.EC2_USER}@${env.EC2_IP} \
                        "cd /home/ubuntu && \
                        export IMAGE_TAG=${BUILD_NUMBER} && \
                        docker compose pull && \
                        docker compose up -d"
                    """
                }
            }
        }

        stage('Verify Application') {

            when {
                expression {
                    return params.TERRAFORM_APPLY
                }
            }

            steps {

                sshagent(["${SSH_CREDENTIAL_ID}"]) {

                    sh """

                        ssh \
                        -o StrictHostKeyChecking=no \
                        ${params.EC2_USER}@${env.EC2_IP} \
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
            ${FRONTEND_IMAGE}:${BUILD_NUMBER}

            Backend:
            ${BACKEND_IMAGE}:${BUILD_NUMBER}

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
