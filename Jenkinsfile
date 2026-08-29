pipeline {

    agent any

    environment {
        // Jenkins credential containing EC2 private key
        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'
    }

    stages {

        // =====================================================
        // READ INPUT FILE
        // =====================================================

        stage('Read Input File') {
            steps {
                script {

                    echo "=========================================="
                    echo "Reading Jenkins Input File"
                    echo "=========================================="

                    if (!fileExists('jenkins-inputs.properties')) {
                        error "jenkins-inputs.properties file not found!"
                    }

                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )

                    env.AWS_REGION       = props.get('aws_region')
                    env.DOCKER_USERNAME  = props.get('docker_username')
                    env.EC2_USER         = props.get('ec2_user')

                    env.TERRAFORM_DIR    = props.get('terraform_directory')
                    env.FRONTEND_DIR     = props.get('frontend_directory')
                    env.BACKEND_DIR      = props.get('backend_directory')

                    env.FRONTEND_IMAGE   = props.get('frontend_image')
                    env.BACKEND_IMAGE    = props.get('backend_image')

                    env.AMI_ID           = props.get('ami_id')
                    env.INSTANCE_TYPE    = props.get('instance_type')

                    // IMPORTANT:
                    // This must be EC2 KEY PAIR NAME,
                    // NOT public-key contents.
                    env.KEY_NAME         = props.get('key_name')

                    def requiredValues = [
                        'AWS_REGION'      : env.AWS_REGION,
                        'DOCKER_USERNAME' : env.DOCKER_USERNAME,
                        'EC2_USER'        : env.EC2_USER,
                        'TERRAFORM_DIR'   : env.TERRAFORM_DIR,
                        'FRONTEND_DIR'    : env.FRONTEND_DIR,
                        'BACKEND_DIR'     : env.BACKEND_DIR,
                        'FRONTEND_IMAGE' : env.FRONTEND_IMAGE,
                        'BACKEND_IMAGE'  : env.BACKEND_IMAGE,
                        'AMI_ID'         : env.AMI_ID,
                        'INSTANCE_TYPE'  : env.INSTANCE_TYPE,
                        'KEY_NAME'       : env.KEY_NAME
                    ]

                    requiredValues.each { name, value ->
                        if (value == null || value.trim() == '') {
                            error "Required property '${name}' is missing or empty!"
                        }
                    }

                    echo "AWS Region      : ${env.AWS_REGION}"
                    echo "Docker Username : ${env.DOCKER_USERNAME}"
                    echo "EC2 User        : ${env.EC2_USER}"
                    echo "Terraform Dir   : ${env.TERRAFORM_DIR}"
                    echo "Frontend Dir    : ${env.FRONTEND_DIR}"
                    echo "Backend Dir     : ${env.BACKEND_DIR}"
                    echo "Frontend Image  : ${env.FRONTEND_IMAGE}"
                    echo "Backend Image   : ${env.BACKEND_IMAGE}"
                    echo "AMI ID          : ${env.AMI_ID}"
                    echo "Instance Type   : ${env.INSTANCE_TYPE}"
                    echo "Key Name        : ${env.KEY_NAME}"

                    echo "=========================================="
                }
            }
        }


        // =====================================================
        // TEST
        // =====================================================

        stage('Test') {
            steps {
                sh '''
                    set -e

                    echo "=========================================="
                    echo "Running Basic Tests"
                    echo "=========================================="

                    test -d "$FRONTEND_DIR"
                    test -d "$BACKEND_DIR"
                    test -d "$TERRAFORM_DIR"

                    test -f docker-compose.yml

                    echo "Frontend directory : OK"
                    echo "Backend directory  : OK"
                    echo "Terraform directory: OK"
                    echo "Docker Compose file: OK"

                    echo "All basic tests passed."
                '''
            }
        }


        // =====================================================
        // BUILD FRONTEND
        // =====================================================

        stage('Build Frontend Image') {
            steps {
                sh '''
                    set -e

                    echo "=========================================="
                    echo "Building Frontend Docker Image"
                    echo "=========================================="

                    docker build \
                        -t "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                        "$FRONTEND_DIR"

                    docker tag \
                        "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                        "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"

                    echo "Frontend image built successfully."
                '''
            }
        }


        // =====================================================
        // BUILD BACKEND
        // =====================================================

        stage('Build Backend Image') {
            steps {
                sh '''
                    set -e

                    echo "=========================================="
                    echo "Building Backend Docker Image"
                    echo "=========================================="

                    docker build \
                        -t "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                        "$BACKEND_DIR"

                    docker tag \
                        "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                        "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"

                    echo "Backend image built successfully."
                '''
            }
        }


        // =====================================================
        // PUSH DOCKER IMAGES
        // =====================================================

        stage('Push Docker Images') {
            steps {

                /*
                 * Replace dockerhub-credentials with the ID
                 * of your Jenkins Docker Hub username/password
                 * credential.
                 */

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_TOKEN'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Logging into Docker Hub"
                        echo "=========================================="

                        echo "$DH_TOKEN" | docker login \
                            -u "$DH_USER" \
                            --password-stdin

                        echo "=========================================="
                        echo "Pushing Frontend Image"
                        echo "=========================================="

                        docker push \
                            "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER"

                        docker push \
                            "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"

                        echo "=========================================="
                        echo "Pushing Backend Image"
                        echo "=========================================="

                        docker push \
                            "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER"

                        docker push \
                            "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"

                        docker logout

                        echo "Docker images pushed successfully."
                    '''
                }
            }
        }


        // =====================================================
        // TERRAFORM INIT
        // =====================================================

        stage('Terraform Init') {
            steps {
                dir("${env.TERRAFORM_DIR}") {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Terraform Init"
                        echo "=========================================="

                        terraform init
                    '''
                }
            }
        }


        // =====================================================
        // TERRAFORM VALIDATE
        // =====================================================

        stage('Terraform Validate') {
            steps {
                dir("${env.TERRAFORM_DIR}") {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Terraform Validate"
                        echo "=========================================="

                        terraform validate
                    '''
                }
            }
        }


        // =====================================================
        // TERRAFORM PLAN
        // =====================================================

        stage('Terraform Plan') {
            steps {
                dir("${env.TERRAFORM_DIR}") {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Terraform Plan"
                        echo "=========================================="

                        terraform plan \
                            -var="aws_region=$AWS_REGION" \
                            -var="ami_id=$AMI_ID" \
                            -var="instance_type=$INSTANCE_TYPE" \
                            -var="key_name=$KEY_NAME"
                    '''
                }
            }
        }


        // =====================================================
        // TERRAFORM APPLY
        // =====================================================

        stage('Terraform Apply') {
            steps {
                dir("${env.TERRAFORM_DIR}") {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Terraform Apply"
                        echo "=========================================="

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


        // =====================================================
        // GET EC2 IP
        // =====================================================

        stage('Get EC2 IP') {
            steps {
                dir("${env.TERRAFORM_DIR}") {

                    script {

                        def ip = sh(
                            script: 'terraform output -raw public_ip',
                            returnStdout: true
                        ).trim()

                        if (!ip) {
                            error "Terraform did not return public_ip!"
                        }

                        env.EC2_IP = ip

                        echo "=========================================="
                        echo "EC2 Public IP"
                        echo "=========================================="

                        echo "EC2 IP: ${env.EC2_IP}"
                    }
                }
            }
        }


        // =====================================================
        // WAIT FOR EC2
        // =====================================================

        stage('Wait For EC2') {
            steps {

                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${env.EC2_SSH_CREDENTIAL}",
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Waiting For EC2 SSH"
                        echo "=========================================="

                        chmod 600 "$SSH_KEY"

                        for i in $(seq 1 12)
                        do
                            echo "Attempt $i: Connecting to EC2..."

                            if ssh \
                                -i "$SSH_KEY" \
                                -o StrictHostKeyChecking=no \
                                -o ConnectTimeout=10 \
                                "$EC2_USER@$EC2_IP" "echo SSH connection successful"
                            then
                                echo "EC2 SSH is ready."
                                exit 0
                            fi

                            echo "EC2 not ready. Waiting 10 seconds..."
                            sleep 10
                        done

                        echo "EC2 SSH connection failed."
                        exit 1
                    '''
                }
            }
        }


        // =====================================================
        // DEPLOY APPLICATION
        // =====================================================

        stage('Deploy Application') {
            steps {

                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${env.EC2_SSH_CREDENTIAL}",
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Deploy Application"
                        echo "=========================================="

                        echo "EC2 IP     : $EC2_IP"
                        echo "EC2 User   : $EC2_USER"
                        echo "Frontend   : $DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
                        echo "Backend    : $DOCKER_USERNAME/$BACKEND_IMAGE:latest"

                        chmod 600 "$SSH_KEY"


                        # -------------------------------------------------
                        # INSTALL DOCKER
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Installing Docker"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                set -e

                                if ! command -v docker >/dev/null 2>&1
                                then
                                    echo "Installing Docker..."

                                    sudo apt-get update

                                    sudo apt-get install -y \
                                        docker.io \
                                        docker-compose-plugin
                                else
                                    echo "Docker already installed."
                                fi

                                sudo systemctl enable docker
                                sudo systemctl start docker

                                echo "Docker version:"
                                sudo docker --version

                                echo "Docker Compose version:"
                                sudo docker compose version
                            '


                        # -------------------------------------------------
                        # CREATE APPLICATION DIRECTORY
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Creating Application Directory"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                mkdir -p ~/todo-app
                            '


                        # -------------------------------------------------
                        # COPY DOCKER COMPOSE
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Copying Docker Compose File"
                        echo "=========================================="

                        scp \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            docker-compose.yml \
                            "$EC2_USER@$EC2_IP:~/todo-app/docker-compose.yml"


                        # -------------------------------------------------
                        # CREATE .ENV FILE
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Creating Environment File"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" "
                                cat > ~/todo-app/.env <<EOF
DOCKER_USERNAME=$DOCKER_USERNAME
FRONTEND_IMAGE=$FRONTEND_IMAGE
BACKEND_IMAGE=$BACKEND_IMAGE
EOF
                            "


                        # -------------------------------------------------
                        # PULL IMAGES
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Pulling Docker Images"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                cd ~/todo-app

                                sudo docker compose pull
                            '


                        # -------------------------------------------------
                        # STOP OLD APPLICATION
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Stopping Existing Application"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                cd ~/todo-app

                                sudo docker compose down || true
                            '


                        # -------------------------------------------------
                        # START APPLICATION
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Starting Application"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                cd ~/todo-app

                                sudo docker compose up -d
                            '


                        # -------------------------------------------------
                        # SHOW STATUS
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Docker Compose Status"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                cd ~/todo-app

                                sudo docker compose ps
                            '

                        echo "Application deployment completed."
                    '''
                }
            }
        }


        // =====================================================
        // VERIFY APPLICATION
        // =====================================================

        stage('Verify Application') {
            steps {

                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${env.EC2_SSH_CREDENTIAL}",
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Application Verification"
                        echo "=========================================="

                        chmod 600 "$SSH_KEY"


                        # -------------------------------------------------
                        # CHECK CONTAINERS
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Checking Docker Containers"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                cd ~/todo-app

                                sudo docker compose ps
                            '


                        # -------------------------------------------------
                        # CHECK RUNNING CONTAINERS
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Checking Running Containers"
                        echo "=========================================="

                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            "$EC2_USER@$EC2_IP" '
                                set -e

                                RUNNING=$(sudo docker compose ps --services --filter status=running)

                                echo "$RUNNING"

                                echo "$RUNNING" | grep -q frontend
                                echo "$RUNNING" | grep -q backend

                                echo "Frontend and Backend containers are running."
                            '


                        # -------------------------------------------------
                        # FRONTEND HTTP CHECK
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Testing Frontend HTTP"
                        echo "=========================================="

                        curl \
                            --fail \
                            --silent \
                            --show-error \
                            --max-time 15 \
                            "http://$EC2_IP"

                        echo ""
                        echo "Frontend HTTP check passed."


                        # -------------------------------------------------
                        # BACKEND HTTP CHECK
                        # -------------------------------------------------

                        echo "=========================================="
                        echo "Testing Backend HTTP"
                        echo "=========================================="

                        curl \
                            --fail \
                            --silent \
                            --show-error \
                            --max-time 15 \
                            "http://$EC2_IP:3000"

                        echo ""
                        echo "Backend HTTP check passed."


                        echo "=========================================="
                        echo "APPLICATION VERIFICATION PASSED"
                        echo "=========================================="
                    '''
                }
            }
        }
    }


    // =====================================================
    // POST ACTIONS
    // =====================================================

    post {

        success {

            echo """
==================================================
             PIPELINE SUCCESS
==================================================

Todo 3-Tier application deployed successfully.

EC2 IP:
${env.EC2_IP}

Frontend:
http://${env.EC2_IP}

Backend:
http://${env.EC2_IP}:3000

==================================================
"""
        }

        failure {

            echo """
==================================================
             PIPELINE FAILED
==================================================

Application deployment or verification failed.

Check the failed stage in the Jenkins console.

==================================================
"""
        }

        always {

            echo "=========================================="
            echo "Build Number : ${env.BUILD_NUMBER}"
            echo "EC2 IP       : ${env.EC2_IP}"
            echo "=========================================="
        }
    }
}

