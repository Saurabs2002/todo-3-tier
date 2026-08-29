```groovy
pipeline {

    agent any

    environment {

        AWS_CREDENTIAL_ID = 'aws-credentials'
        DOCKER_CREDENTIAL_ID = 'dockerhub-credentials'
        EC2_SSH_CREDENTIAL_ID = 'ec2-ssh-key'

        AWS_REGION = ''
        AMI_ID = ''
        INSTANCE_TYPE = ''
        KEY_VALUE = ''

        DOCKER_USERNAME = ''

        TERRAFORM_DIR = ''
        FRONTEND_DIR = ''
        BACKEND_DIR = ''

        EC2_USER = ''
        EC2_IP = ''
    }

    stages {

        /*
         * ==========================================
         * 1. CHECKOUT
         * ==========================================
         */

        stage('Checkout') {

            steps {

                checkout scm

            }
        }


        /*
         * ==========================================
         * 2. READ INPUT FILE
         * ==========================================
         */

        stage('Read Input File') {

            steps {

                script {

                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )

                    env.AWS_REGION = props['aws_region']
                    env.AMI_ID = props['ami_id']
                    env.INSTANCE_TYPE = props['instance_type']
                    env.KEY_VALUE = props['key_value']

                    env.DOCKER_USERNAME = props['docker_username']

                    env.TERRAFORM_DIR = props['terraform_dir']
                    env.FRONTEND_DIR = props['frontend_dir']
                    env.BACKEND_DIR = props['backend_dir']

                    env.EC2_USER = props['ec2_user']


                    echo "========================================"
                    echo "INPUT FILE LOADED"
                    echo "========================================"

                    echo "AWS Region       : ${env.AWS_REGION}"
                    echo "AMI ID           : ${env.AMI_ID}"
                    echo "Instance Type    : ${env.INSTANCE_TYPE}"
                    echo "Key Name         : ${env.KEY_VALUE}"
                    echo "Docker Username  : ${env.DOCKER_USERNAME}"
                    echo "Terraform Dir    : ${env.TERRAFORM_DIR}"
                    echo "Frontend Dir     : ${env.FRONTEND_DIR}"
                    echo "Backend Dir      : ${env.BACKEND_DIR}"
                    echo "EC2 User         : ${env.EC2_USER}"

                    echo "========================================"
                }
            }
        }


        /*
         * ==========================================
         * 3. TEST
         * ==========================================
         */

        stage('Test') {

            steps {

                sh '''
                    echo "Running application tests..."

                    echo "Frontend test..."
                    test -d "$FRONTEND_DIR"

                    echo "Backend test..."
                    test -d "$BACKEND_DIR"

                    echo "Terraform directory test..."
                    test -d "$TERRAFORM_DIR"

                    echo "Tests passed"
                '''
            }
        }


        /*
         * ==========================================
         * 4. BUILD FRONTEND IMAGE
         * ==========================================
         */

        stage('Build Frontend Image') {

            steps {

                sh '''
                    docker build \
                    -t ${DOCKER_USERNAME}/frontend:${BUILD_NUMBER} \
                    ${FRONTEND_DIR}
                '''
            }
        }


        /*
         * ==========================================
         * 5. BUILD BACKEND IMAGE
         * ==========================================
         */

        stage('Build Backend Image') {

            steps {

                sh '''
                    docker build \
                    -t ${DOCKER_USERNAME}/backend:${BUILD_NUMBER} \
                    ${BACKEND_DIR}
                '''
            }
        }


        /*
         * ==========================================
         * 6. PUSH DOCKER IMAGES
         * ==========================================
         */

        stage('Push Docker Images') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIAL_ID}",
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
                        ${DOCKER_USERNAME}/frontend:${BUILD_NUMBER}

                        docker push \
                        ${DOCKER_USERNAME}/backend:${BUILD_NUMBER}

                        docker logout
                    '''
                }
            }
        }


        /*
         * ==========================================
         * 7. TERRAFORM INIT
         * ==========================================
         */

        stage('Terraform Init') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh '''
                        terraform init
                    '''
                }
            }
        }


        /*
         * ==========================================
         * 8. TERRAFORM VALIDATE
         * ==========================================
         */

        stage('Terraform Validate') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh '''
                        terraform validate
                    '''
                }
            }
        }


        /*
         * ==========================================
         * 9. TERRAFORM PLAN
         * ==========================================
         */

        stage('Terraform Plan') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: "${AWS_CREDENTIAL_ID}"]
                    ]) {

                        sh '''
                            terraform plan \
                            -var="aws_region=${AWS_REGION}" \
                            -var="ami_id=${AMI_ID}" \
                            -var="instance_type=${INSTANCE_TYPE}" \
                            -var="key_value=${KEY_VALUE}" \
                            -out=tfplan
                        '''
                    }
                }
            }
        }


        /*
         * ==========================================
         * 10. TERRAFORM APPLY
         * ==========================================
         */

        stage('Terraform Apply') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: "${AWS_CREDENTIAL_ID}"]
                    ]) {

                        sh '''
                            terraform apply \
                            -auto-approve \
                            tfplan
                        '''
                    }
                }
            }
        }


        /*
         * ==========================================
         * 11. GET EC2 PUBLIC IP
         * ==========================================
         */

        stage('Get EC2 IP') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(
                            script: 'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()

                        echo "========================================"
                        echo "EC2 PUBLIC IP: ${env.EC2_IP}"
                        echo "========================================"
                    }
                }
            }
        }


        /*
         * ==========================================
         * 12. WAIT FOR EC2
         * ==========================================
         */

        stage('Wait For EC2') {

            steps {

                sshagent(["${EC2_SSH_CREDENTIAL_ID}"]) {

                    sh '''
                        echo "Waiting for EC2 SSH..."

                        for i in $(seq 1 12)
                        do

                            if ssh \
                            -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=5 \
                            ${EC2_USER}@${EC2_IP} \
                            "echo SSH connection successful"
                            then

                                echo "EC2 is ready"
                                exit 0

                            fi

                            echo "EC2 not ready yet..."
                            sleep 10

                        done

                        echo "EC2 SSH connection failed"
                        exit 1
                    '''
                }
            }
        }


        /*
         * ==========================================
         * 13. DEPLOY APPLICATION
         * ==========================================
         */

        stage('Deploy Application') {

            steps {

                sshagent(["${EC2_SSH_CREDENTIAL_ID}"]) {

                    sh '''
                        echo "Copying docker-compose.yml..."

                        scp \
                        -o StrictHostKeyChecking=no \
                        docker-compose.yml \
                        ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/


                        echo "Deploying application..."

                        ssh \
                        -o StrictHostKeyChecking=no \
                        ${EC2_USER}@${EC2_IP} \
                        "export IMAGE_TAG=${BUILD_NUMBER} && \
                         export DOCKER_USERNAME=${DOCKER_USERNAME} && \
                         cd /home/${EC2_USER} && \
                         docker compose pull && \
                         docker compose up -d"
                    '''
                }
            }
        }


        /*
         * ==========================================
         * 14. VERIFY APPLICATION
         * ==========================================
         */

        stage('Verify') {

            steps {

                sshagent(["${EC2_SSH_CREDENTIAL_ID}"]) {

                    sh '''
                        echo "Checking Docker containers..."

                        ssh \
                        -o StrictHostKeyChecking=no \
                        ${EC2_USER}@${EC2_IP} \
                        "docker ps"

                        echo "Application deployment completed"
                    '''
                }
            }
        }
    }


    /*
     * ==========================================
     * POST ACTIONS
     * ==========================================
     */

    post {

        success {

            echo """
            ==========================================
                 DEPLOYMENT SUCCESSFUL
            ==========================================

            EC2 Public IP : ${env.EC2_IP}

            Frontend Image:
            ${env.DOCKER_USERNAME}/frontend:${BUILD_NUMBER}

            Backend Image:
            ${env.DOCKER_USERNAME}/backend:${BUILD_NUMBER}

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
```
