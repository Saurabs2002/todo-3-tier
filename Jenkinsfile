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

                    def props = readProperties(file: 'jenkins-inputs.properties')

                    env.AWS_REGION      = props.get('aws_region')
                    env.DOCKER_USERNAME = props.get('docker_username')
                    env.EC2_USER        = props.get('ec2_user')
                    env.TERRAFORM_DIR   = props.get('terraform_directory')
                    env.FRONTEND_DIR    = props.get('frontend_directory')
                    env.BACKEND_DIR     = props.get('backend_directory')
                    env.FRONTEND_IMAGE  = props.get('frontend_image')
                    env.BACKEND_IMAGE   = props.get('backend_image')
                    env.AMI_ID          = props.get('ami_id')
                    env.INSTANCE_TYPE   = props.get('instance_type')
                    env.KEY_NAME        = props.get('key_name')

                    echo "Input file loaded successfully"
                    echo "AWS Region      : ${env.AWS_REGION}"
                    echo "Docker Username : ${env.DOCKER_USERNAME}"
                    echo "Frontend Image  : ${env.FRONTEND_IMAGE}"
                    echo "Backend Image   : ${env.BACKEND_IMAGE}"
                }
            }
        }

        // ============================================================
        // BUILD FRONTEND IMAGE
        // ============================================================
        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build -t "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" "$FRONTEND_DIR"
                    docker tag "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
                '''
            }
        }

        // ============================================================
        // BUILD BACKEND IMAGE
        // ============================================================
        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build -t "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" "$BACKEND_DIR"
                    docker tag "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
                '''
            }
        }

        // ============================================================
        // PUSH DOCKER IMAGES
        // ============================================================
        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
                    sh '''
                        echo "$DH_TOKEN" | docker login --username "$DH_USER" --password-stdin
                        docker push "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER"
                        docker push "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
                        docker push "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER"
                        docker push "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
                        docker logout
                    '''
                }
            }
        }

        // ============================================================
        // TERRAFORM INIT / VALIDATE / PLAN / APPLY
        // ============================================================
        stage('Terraform Init') {
            steps { dir("${env.TERRAFORM_DIR}") { sh 'terraform init' } }
        }

        stage('Terraform Validate') {
            steps { dir("${env.TERRAFORM_DIR}") { sh 'terraform validate' } }
        }

        stage('Terraform Plan') {
            steps {
                dir("${env.TERRAFORM_DIR}") {
                    sh '''
                        terraform plan \
                            -var="aws_region=$AWS_REGION" \
                            -var="ami_id=$AMI_ID" \
                            -var="instance_type=$INSTANCE_TYPE" \
                            -var="key_name=$KEY_NAME"
                    '''
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir("${env.TERRAFORM_DIR}") {
                    sh '''
                        terraform apply -auto-approve \
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
                dir("${env.TERRAFORM_DIR}") {
                    script {
                        env.EC2_IP = sh(script: 'terraform output -raw public_ip', returnStdout: true).trim()
                        echo "EC2 Public IP: ${env.EC2_IP}"
                    }
                }
            }
        }

        // ============================================================
        // DEPLOY APPLICATION
        // ============================================================
        stage('Deploy Application') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: "${env.EC2_SSH_CREDENTIAL}", keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        chmod 600 "$SSH_KEY"

                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" '
                            set -e
                            sudo apt-get update
                            sudo apt-get install -y docker.io docker-compose-v2
                            sudo systemctl enable docker
                            sudo systemctl start docker
                        '

                        scp -i "$SSH_KEY" -o StrictHostKeyChecking=no docker-compose.yml "$EC2_USER@$EC2_IP:~/todo-app/docker-compose.yml"

                        printf "%s\\n" \
                            "DOCKER_USERNAME=$DOCKER_USERNAME" \
                            "FRONTEND_IMAGE=$FRONTEND_IMAGE" \
                            "BACKEND_IMAGE=$BACKEND_IMAGE" \
                        | ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" "cat > ~/todo-app/.env"

                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" '
                            cd ~/todo-app
                            sudo docker compose pull
                            sudo docker compose down || true
                            sudo docker compose up -d
                            sudo docker compose ps
                        '
                    '''
                }
            }
        }

        // ============================================================
        // VERIFY APPLICATION
        // ============================================================
        stage('Verify Application') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: "${env.EC2_SSH_CREDENTIAL}", keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" "
                            curl -f http://localhost:8080 || exit 1
                            curl -f http://localhost:3000/health || exit 1
                        "
                    '''
                }
            }
        }
    }
}
