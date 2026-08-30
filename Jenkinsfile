pipeline {

    agent any

    environment {
        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'
    }


    stages {


        // ============================================================
        // READ INPUT FILE
        // ============================================================

        stage('Read Input File') {

            steps {

                script {

                    if (!fileExists('jenkins-inputs.properties')) {
                        error "jenkins-inputs.properties file not found!"
                    }


                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )


                    env.AWS_REGION       = props['aws_region']

                    env.DOCKER_USERNAME  = props['docker_username']

                    env.EC2_USER         = props['ec2_user']


                    env.TERRAFORM_DIR    = props['terraform_directory']

                    env.FRONTEND_DIR     = props['frontend_directory']

                    env.BACKEND_DIR      = props['backend_directory']


                    env.FRONTEND_IMAGE   = props['frontend_image']

                    env.BACKEND_IMAGE    = props['backend_image']


                    env.PROMETHEUS_DIR   = props['prometheus_directory']


                    env.AMI_ID           = props['ami_id']

                    env.INSTANCE_TYPE    = props['instance_type']

                    env.KEY_NAME         = props['key_name']


                    echo """
                    ================================
                    Configuration Loaded
                    ================================
                    AWS Region       : ${AWS_REGION}
                    Frontend Image   : ${FRONTEND_IMAGE}
                    Backend Image    : ${BACKEND_IMAGE}
                    Prometheus Path  : ${PROMETHEUS_DIR}
                    Terraform Dir    : ${TERRAFORM_DIR}
                    ================================
                    """

                }

            }

        }



        // ============================================================
        // BUILD FRONTEND IMAGE
        // ============================================================

        stage('Build Frontend Image') {

            steps {

                sh '''
                    docker build \
                    -t "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                    "$FRONTEND_DIR"


                    docker tag \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
                '''

            }

        }



        // ============================================================
        // BUILD BACKEND IMAGE
        // ============================================================

        stage('Build Backend Image') {

            steps {

                sh '''
                    docker build \
                    -t "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                    "$BACKEND_DIR"


                    docker tag \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
                '''

            }

        }




        // ============================================================
        // PUSH DOCKER IMAGES
        // ============================================================

        stage('Push Docker Images') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'USERNAME',
                        passwordVariable: 'TOKEN'
                    )
                ]) {


                    sh '''

                    echo "$TOKEN" | docker login \
                    -u "$USERNAME" \
                    --password-stdin


                    docker push \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER"


                    docker push \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"


                    docker push \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER"


                    docker push \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"


                    docker logout

                    '''

                }

            }

        }




        // ============================================================
        // TERRAFORM APPLY
        // ============================================================

        stage('Terraform Apply') {

            steps {

                dir("${TERRAFORM_DIR}") {

                    sh '''

                    terraform init


                    terraform apply \
                    -auto-approve \
                    -var="aws_region=$AWS_REGION" \
                    -var="ami_id=$AMI_ID" \
                    -var="instance_type=$INSTANCE_TYPE" \
                    -var="key_name=$KEY_NAME"

                    '''

                }

            }

        }





        // ============================================================
        // GET EC2 IP
        // ============================================================

        stage('Get EC2 IP') {

            steps {

                dir("${TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(
                            script: 'terraform output -raw public_ip',
                            returnStdout: true
                        ).trim()


                        echo "EC2 IP : ${EC2_IP}"

                    }

                }

            }

        }





        // ============================================================
        // DEPLOY APPLICATION
        // ============================================================


        stage('Deploy Application') {

            steps {


                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${EC2_SSH_CREDENTIAL}",
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {


                    sh '''

                    chmod 600 "$SSH_KEY"



                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$EC2_USER@$EC2_IP" "

                    sudo apt-get update

                    sudo apt-get install -y docker.io docker-compose-v2

                    sudo systemctl enable docker

                    sudo systemctl start docker


                    mkdir -p ~/todo-app/$PROMETHEUS_DIR

                    "




                    # Copy docker compose

                    scp \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    docker-compose.yml \
                    "$EC2_USER@$EC2_IP:~/todo-app/"



                    # Copy prometheus configuration

                    scp \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$PROMETHEUS_DIR/prometheus.yml" \
                    "$EC2_USER@$EC2_IP:~/todo-app/$PROMETHEUS_DIR/"



                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$EC2_USER@$EC2_IP" "


                    cd ~/todo-app


                    docker compose down \
                    --remove-orphans || true


                    docker compose pull


                    docker compose up -d


                    docker compose ps

                    "


                    '''

                }

            }

        }





        // ============================================================
        // VERIFY
        // ============================================================

        stage('Verify Deployment') {

            steps {

                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${EC2_SSH_CREDENTIAL}",
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {


                    sh '''

                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$EC2_USER@$EC2_IP" "


                    docker ps


                    curl -f http://localhost:80


                    curl -f http://localhost:9090


                    curl -f http://localhost:3001


                    "

                    '''

                }

            }

        }


    }


    post {

        success {

            echo "Deployment completed successfully"

        }


        failure {

            echo "Deployment failed"

        }

    }

}
