pipeline {

    agent any

    stages {

        // =====================================================
        // CHECKOUT
        // =====================================================

        stage('Read Input File') {
            steps {
                script {

                    echo "=========================================="
                    echo "Checking input properties file"
                    echo "=========================================="

                    if (!fileExists('jenkins-inputs.properties')) {
                        error "jenkins-inputs.properties file not found in workspace!"
                    }

                    // Pipeline Utility Steps plugin
                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )

                    // IMPORTANT:
                    // Use get() instead of props['key']
                    // to avoid Jenkins Script Security getAt error.

                    env.AWS_REGION = props.get('aws_region')
                    env.DOCKER_USERNAME = props.get('docker_username')
                    env.EC2_USER = props.get('ec2_user')

                    env.TERRAFORM_DIR = props.get('terraform_directory')
                    env.FRONTEND_DIR = props.get('frontend_directory')
                    env.BACKEND_DIR = props.get('backend_directory')

                    env.FRONTEND_IMAGE = props.get('frontend_image')
                    env.BACKEND_IMAGE = props.get('backend_image')

                    env.AMI_ID = props.get('ami_id')
                    env.INSTANCE_TYPE = props.get('instance_type')
                    env.KEY_VALUE = props.get('key_value')

                    // Validate required values

                    def requiredValues = [
                        'AWS_REGION': env.AWS_REGION,
                        'DOCKER_USERNAME': env.DOCKER_USERNAME,
                        'EC2_USER': env.EC2_USER,
                        'TERRAFORM_DIR': env.TERRAFORM_DIR,
                        'FRONTEND_DIR': env.FRONTEND_DIR,
                        'BACKEND_DIR': env.BACKEND_DIR,
                        'FRONTEND_IMAGE': env.FRONTEND_IMAGE,
                        'BACKEND_IMAGE': env.BACKEND_IMAGE,
                        'AMI_ID': env.AMI_ID,
                        'INSTANCE_TYPE': env.INSTANCE_TYPE,
                        'KEY_VALUE': env.KEY_VALUE
                    ]

                    requiredValues.each { name, value ->
                        if (value == null || value.trim() == '') {
                            error "Required property '${name}' is missing or empty!"
                        }
                    }

                    echo "=========================================="
                    echo "Input file loaded successfully"
                    echo "=========================================="

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
                    echo "Key Pair        : ${env.KEY_VALUE}"

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
                    echo "=========================================="
                    echo "Running tests"
                    echo "=========================================="

                    echo "Testing frontend directory..."
                    test -d "$FRONTEND_DIR"

                    echo "Testing backend directory..."
                    test -d "$BACKEND_DIR"

                    echo "Testing terraform directory..."
                    test -d "$TERRAFORM_DIR"

                    echo "All basic tests passed"
                '''
            }
        }


        // =====================================================
        // BUILD FRONTEND IMAGE
        // =====================================================

        stage('Build Frontend Image') {
            steps {
                sh '''
                    echo "=========================================="
                    echo "Building Frontend Docker Image"
                    echo "=========================================="

                    docker build \
                        -t "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                        "$FRONTEND_DIR"

                    docker tag \
                        "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                        "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
                '''
            }
        }


        // =====================================================
        // BUILD BACKEND IMAGE
        // =====================================================

        stage('Build Backend Image') {
            steps {
                sh '''
                    echo "=========================================="
                    echo "Building Backend Docker Image"
                    echo "=========================================="

                    docker build \
                        -t "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                        "$BACKEND_DIR"

                    docker tag \
                        "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                        "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
                '''
            }
        }


        // =====================================================
        // PUSH DOCKER IMAGES
        // =====================================================

        stage('Push Docker Images') {
            steps {
                sh '''
                    echo "=========================================="
                    echo "Pushing Docker Images"
                    echo "=========================================="

                    echo "Frontend Image:"
                    echo "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER"

                    echo "Backend Image:"
                    echo "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER"

                    echo "Docker push requires Docker Hub authentication."
                    echo "Configure Jenkins Docker credentials before enabling push."

                    # Uncomment after configuring Docker credentials:
                    #
                    # docker push "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER"
                    # docker push "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
                    #
                    # docker push "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER"
                    # docker push "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
                '''
            }
        }


        // =====================================================
        // TERRAFORM INIT
        // =====================================================

        stage('Terraform Init') {
            steps {
                dir("${env.TERRAFORM_DIR}") {
                    sh '''
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
                        echo "=========================================="
                        echo "Terraform Plan"
                        echo "=========================================="

                        terraform plan \
                            -var="aws_region=$AWS_REGION" \
                            -var="ami_id=$AMI_ID" \
                            -var="instance_type=$INSTANCE_TYPE" \
                            -var="key_name=$KEY_VALUE"
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
                        echo "=========================================="
                        echo "Terraform Apply"
                        echo "=========================================="

                        terraform apply \
                            -auto-approve \
                            -var="aws_region=$AWS_REGION" \
                            -var="ami_id=$AMI_ID" \
                            -var="instance_type=$INSTANCE_TYPE" \
                            -var="key_name=$KEY_VALUE"
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
                            error "Terraform did not return public_ip"
                        }

                        env.EC2_IP = ip

                        echo "=========================================="
                        echo "EC2 Public IP"
                        echo "=========================================="
                        echo "${env.EC2_IP}"
                    }
                }
            }
        }


        // =====================================================
        // WAIT FOR EC2
        // =====================================================

        stage('Wait For EC2') {
            steps {
                sh '''
                    echo "=========================================="
                    echo "Waiting for EC2 SSH"
                    echo "=========================================="

                    sleep 30

                    echo "EC2 IP: $EC2_IP"
                    echo "EC2 User: $EC2_USER"
                '''
            }
        }


       // =====================================================
// DEPLOY APPLICATION
// =====================================================

stage('Deploy Application') {
    steps {
        sh '''
            echo "=========================================="
            echo "Deploy Application"
            echo "=========================================="

            echo "EC2 IP      : $EC2_IP"
            echo "EC2 User    : $EC2_USER"
            echo "Frontend    : $DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
            echo "Backend     : $DOCKER_USERNAME/$BACKEND_IMAGE:latest"

            echo "=========================================="
            echo "Installing Docker on EC2"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                sudo apt-get update &&
                sudo apt-get install -y docker.io docker-compose-plugin &&
                sudo systemctl enable docker &&
                sudo systemctl start docker
            "

            echo "=========================================="
            echo "Checking Docker"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                sudo docker --version
                sudo docker compose version
            "

            echo "=========================================="
            echo "Creating Application Directory"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                mkdir -p ~/todo-app
            "

            echo "=========================================="
            echo "Copying Docker Compose File"
            echo "=========================================="

            scp -o StrictHostKeyChecking=no \
                docker-compose.yml \
                $EC2_USER@$EC2_IP:~/todo-app/docker-compose.yml

            echo "=========================================="
            echo "Docker Compose File Copied"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                cd ~/todo-app
                cat docker-compose.yml
            "

            echo "=========================================="
            echo "Pulling Docker Images"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                cd ~/todo-app &&
                sudo docker compose pull
            "

            echo "=========================================="
            echo "Stopping Existing Containers"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                cd ~/todo-app &&
                sudo docker compose down || true
            "

            echo "=========================================="
            echo "Starting Application"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                cd ~/todo-app &&
                sudo docker compose up -d
            "

            echo "=========================================="
            echo "Application Started"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                cd ~/todo-app &&
                sudo docker compose ps
            "
        '''
    }
}


// =====================================================
// VERIFY APPLICATION
// =====================================================

stage('Verify Application') {
    steps {
        sh '''
            echo "=========================================="
            echo "Application Verification"
            echo "=========================================="

            echo "EC2 IP : $EC2_IP"

            echo "=========================================="
            echo "Checking Docker Containers"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                cd ~/todo-app &&
                sudo docker compose ps
            "

            echo "=========================================="
            echo "Checking Frontend Container"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                sudo docker ps \
                --filter name=todo-frontend \
                --filter status=running \
                | grep todo-frontend
            "

            echo "Frontend container is running."


            echo "=========================================="
            echo "Checking Backend Container"
            echo "=========================================="

            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP "
                sudo docker ps \
                --filter name=todo-backend \
                --filter status=running \
                | grep todo-backend
            "

            echo "Backend container is running."


            echo "=========================================="
            echo "Testing Frontend HTTP"
            echo "=========================================="

            curl -f http://$EC2_IP

            echo ""
            echo "Frontend HTTP check passed."


            echo "=========================================="
            echo "Testing Backend HTTP"
            echo "=========================================="

            curl -f http://$EC2_IP:3000

            echo ""
            echo "Backend HTTP check passed."


            echo "=========================================="
            echo "APPLICATION VERIFICATION PASSED"
            echo "=========================================="
        '''
    }
}


// =====================================================
// POST ACTIONS
// =====================================================

post {

    success {
        echo '''
==================================================
             PIPELINE SUCCESS
==================================================

Todo 3-Tier application deployed successfully.

Frontend:
http://${EC2_IP}

Backend:
http://${EC2_IP}:3000

==================================================
'''
    }

    failure {
        echo '''
==================================================
             PIPELINE FAILED
==================================================

Application deployment or verification failed.

Please check the failed stage above.

==================================================
'''
    }

    always {
        echo "Build Number: ${env.BUILD_NUMBER}"
        echo "EC2 IP: ${env.EC2_IP}"
    }

}

