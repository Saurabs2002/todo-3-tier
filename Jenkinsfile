pipeline {

    agent any

    environment {

        // ============================================================
        // JENKINS CREDENTIALS / TOOLS
        // ============================================================

        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'

        // Name configured in:
        // Manage Jenkins → System → SonarQube servers
        SONARQUBE_SERVER = 'SonarQube'

        // Name configured in:
        // Manage Jenkins → Tools → SonarQube Scanner
        SONAR_SCANNER = 'SonarScanner'

        // Name configured in:
        // Manage Jenkins → Tools → Dependency-Check
        OWASP_INSTALLATION = 'OWASP-Dependency-Check'
    }


    stages {

        // ============================================================
        // READ INPUT FILE
        // ============================================================

        stage('Read Input File') {

            steps {

                script {

                    echo "=========================================="
                    echo "Checking input properties file"
                    echo "=========================================="


                    if (!fileExists('jenkins-inputs.properties')) {

                        error "jenkins-inputs.properties file not found!"
                    }


                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )


                    // ------------------------------------------------
                    // Read properties
                    // ------------------------------------------------

                    env.AWS_REGION =
                        props.get('aws_region')?.toString()

                    env.DOCKER_USERNAME =
                        props.get('docker_username')?.toString()

                    env.EC2_USER =
                        props.get('ec2_user')?.toString()

                    env.TERRAFORM_DIR =
                        props.get('terraform_directory')?.toString()

                    env.FRONTEND_DIR =
                        props.get('frontend_directory')?.toString()

                    env.BACKEND_DIR =
                        props.get('backend_directory')?.toString()

                    env.FRONTEND_IMAGE =
                        props.get('frontend_image')?.toString()

                    env.BACKEND_IMAGE =
                        props.get('backend_image')?.toString()

                    env.AMI_ID =
                        props.get('ami_id')?.toString()

                    env.INSTANCE_TYPE =
                        props.get('instance_type')?.toString()

                    env.KEY_NAME =
                        props.get('key_name')?.toString()


                    // ------------------------------------------------
                    // Validate required properties
                    // ------------------------------------------------

                    def requiredValues = [

                        'AWS_REGION'      : env.AWS_REGION,
                        'DOCKER_USERNAME' : env.DOCKER_USERNAME,
                        'EC2_USER'        : env.EC2_USER,
                        'TERRAFORM_DIR'   : env.TERRAFORM_DIR,
                        'FRONTEND_DIR'    : env.FRONTEND_DIR,
                        'BACKEND_DIR'     : env.BACKEND_DIR,
                        'FRONTEND_IMAGE'  : env.FRONTEND_IMAGE,
                        'BACKEND_IMAGE'   : env.BACKEND_IMAGE,
                        'AMI_ID'          : env.AMI_ID,
                        'INSTANCE_TYPE'   : env.INSTANCE_TYPE,
                        'KEY_NAME'        : env.KEY_NAME
                    ]


                    requiredValues.each { name, value ->

                        if (
                            value == null ||
                            value.trim() == ''
                        ) {

                            error(
                                "Required property '${name}' is missing or empty!"
                            )
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
                    echo "EC2 Key Name    : ${env.KEY_NAME}"

                    echo "=========================================="
                }
            }
        }


        // ============================================================
        // BASIC TEST
        // ============================================================

        stage('Test') {

            steps {

                sh '''

                    set -e

                    echo "=========================================="
                    echo "Running Basic Tests"
                    echo "=========================================="


                    echo "Checking frontend directory..."

                    test -d "$FRONTEND_DIR"


                    echo "Checking backend directory..."

                    test -d "$BACKEND_DIR"


                    echo "Checking Terraform directory..."

                    test -d "$TERRAFORM_DIR"


                    echo "Checking Docker Compose file..."

                    test -f docker-compose.yml


                    echo "Frontend directory  : OK"
                    echo "Backend directory   : OK"
                    echo "Terraform directory : OK"
                    echo "Docker Compose file : OK"


                    echo "All basic tests passed."

                '''
            }
        }


        // ============================================================
        // OWASP DEPENDENCY CHECK
        // ============================================================

        stage('OWASP Dependency Check') {

            steps {

                echo "=========================================="
                echo "OWASP Dependency Check"
                echo "=========================================="


                dependencyCheck(

                    odcInstallation:
                    "${OWASP_INSTALLATION}",

                    additionalArguments:
                    '''
                        --project "Todo Application"
                        --scan .
                        --format HTML
                        --format XML
                        --format JSON
                        --out dependency-check-report
                    '''
                )


                dependencyCheckPublisher(

                    pattern:
                    'dependency-check-report/dependency-check-report.xml'
                )


                echo "OWASP Dependency Check completed."
            }
        }


        // ============================================================
        // SONARQUBE ANALYSIS
        // ============================================================

        stage('SonarQube Analysis') {

            steps {

                echo "=========================================="
                echo "SonarQube Code Analysis"
                echo "=========================================="


                withSonarQubeEnv("${SONARQUBE_SERVER}") {

                    sh '''

                        set -e


                        echo "Checking SonarScanner..."

                        sonar-scanner --version


                        echo "Starting SonarQube analysis..."


                        sonar-scanner \
                            -Dsonar.projectKey=todo-application \
                            -Dsonar.projectName="Todo Application" \
                            -Dsonar.sources=frontend,backend \
                            -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/build/**,**/coverage/**" \
                            -Dsonar.sourceEncoding=UTF-8


                        echo "SonarQube analysis completed."

                    '''
                }
            }
        }


        // ============================================================
        // SONARQUBE QUALITY GATE
        // ============================================================

        stage('SonarQube Quality Gate') {

            steps {

                echo "=========================================="
                echo "Waiting for SonarQube Quality Gate"
                echo "=========================================="


                timeout(
                    time: 5,
                    unit: 'MINUTES'
                ) {

                    waitForQualityGate(
                        abortPipeline: true
                    )
                }


                echo "SonarQube Quality Gate PASSED."
            }
        }


        // ============================================================
        // BUILD FRONTEND IMAGE
        // ============================================================

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


                    docker images |
                        grep "$FRONTEND_IMAGE" || true

                '''
            }
        }


        // ============================================================
        // BUILD BACKEND IMAGE
        // ============================================================

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


                    docker images |
                        grep "$BACKEND_IMAGE" || true

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

                        credentialsId:
                        'dockerhub-credentials',

                        usernameVariable:
                        'DH_USER',

                        passwordVariable:
                        'DH_TOKEN'
                    )

                ]) {

                    sh '''

                        set -e


                        echo "=========================================="
                        echo "Docker Hub Login"
                        echo "=========================================="


                        echo "$DH_TOKEN" |
                            docker login \
                            --username "$DH_USER" \
                            --password-stdin


                        echo "Docker Hub login successful."


                        echo "=========================================="
                        echo "Pushing Frontend Images"
                        echo "=========================================="


                        docker push \
                            "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER"


                        docker push \
                            "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"


                        echo "Frontend images pushed successfully."


                        echo "=========================================="
                        echo "Pushing Backend Images"
                        echo "=========================================="


                        docker push \
                            "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER"


                        docker push \
                            "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"


                        echo "Backend images pushed successfully."


                        docker logout


                        echo "=========================================="
                        echo "Docker images pushed successfully."
                        echo "=========================================="

                    '''
                }
            }
        }


        // ============================================================
        // TERRAFORM INIT
        // ============================================================

        stage('Terraform Init') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh '''

                        set -e


                        echo "=========================================="
                        echo "Terraform Init"
                        echo "=========================================="


                        terraform init


                        echo "Terraform init completed successfully."

                    '''
                }
            }
        }


        // ============================================================
        // TERRAFORM VALIDATE
        // ============================================================

        stage('Terraform Validate') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh '''

                        set -e


                        echo "=========================================="
                        echo "Terraform Validate"
                        echo "=========================================="


                        terraform validate


                        echo "Terraform validation successful."

                    '''
                }
            }
        }


        // ============================================================
        // TERRAFORM PLAN
        // ============================================================

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


                        echo "Terraform plan completed successfully."

                    '''
                }
            }
        }


        // ============================================================
        // TERRAFORM APPLY
        // ============================================================

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


                        echo "Terraform apply completed successfully."

                    '''
                }
            }
        }


        // ============================================================
        // GET EC2 PUBLIC IP
        // ============================================================

        stage('Get EC2 IP') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    script {

                        echo "=========================================="
                        echo "Getting EC2 Public IP"
                        echo "=========================================="


                        def ip = sh(

                            script:
                            'terraform output -raw public_ip',

                            returnStdout:
                            true

                        ).trim()


                        if (!ip) {

                            error(
                                "Terraform did not return public_ip!"
                            )
                        }


                        env.EC2_IP = ip


                        echo "EC2 Public IP: ${env.EC2_IP}"
                    }
                }
            }
        }


        // ============================================================
        // WAIT FOR EC2 SSH
        // ============================================================

        stage('Wait For EC2') {

            steps {

                withCredentials([

                    sshUserPrivateKey(

                        credentialsId:
                        "${env.EC2_SSH_CREDENTIAL}",

                        keyFileVariable:
                        'SSH_KEY'
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

                            echo "SSH attempt $i..."


                            if ssh \
                                -i "$SSH_KEY" \
                                -o StrictHostKeyChecking=no \
                                -o UserKnownHostsFile=/dev/null \
                                -o ConnectTimeout=10 \
                                "$EC2_USER@$EC2_IP" \
                                "echo SSH connection successful"
                            then

                                echo "EC2 SSH is ready."

                                exit 0

                            fi


                            echo "EC2 not ready."

                            echo "Waiting 10 seconds..."

                            sleep 10

                        done


                        echo "Unable to connect to EC2 using SSH."

                        exit 1

                    '''
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

                        credentialsId:
                        "${env.EC2_SSH_CREDENTIAL}",

                        keyFileVariable:
                        'SSH_KEY'
                    )

                ]) {

                    sh '''

                        set -e


                        echo "=========================================="
                        echo "Deploy Application"
                        echo "=========================================="


                        echo "EC2 IP   : $EC2_IP"
                        echo "EC2 User : $EC2_USER"


                        chmod 600 "$SSH_KEY"


                        # =================================================
                        # CHECK / INSTALL DOCKER
                        # =================================================

                        echo "=========================================="
                        echo "Checking Docker"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" '

                                set -e


                                if ! command -v docker >/dev/null 2>&1
                                then

                                    echo "Docker is not installed."

                                    echo "Installing Docker..."


                                    sudo apt-get update

                                    sudo apt-get install -y docker.io

                                    sudo systemctl enable docker

                                    sudo systemctl start docker

                                else

                                    echo "Docker already installed."

                                fi


                                sudo docker --version

                            '


                        # =================================================
                        # CHECK DOCKER COMPOSE
                        # =================================================

                        echo "=========================================="
                        echo "Checking Docker Compose"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" '

                                set -e


                                if ! sudo docker compose version >/dev/null 2>&1
                                then

                                    echo "Docker Compose plugin not found."

                                    sudo apt-get update


                                    if apt-cache show docker-compose-v2 >/dev/null 2>&1
                                    then

                                        sudo apt-get install -y docker-compose-v2

                                    elif apt-cache show docker-compose-plugin >/dev/null 2>&1
                                    then

                                        sudo apt-get install -y docker-compose-plugin

                                    else

                                        echo "Docker Compose package not available."

                                        exit 1

                                    fi

                                else

                                    echo "Docker Compose already installed."

                                fi


                                sudo docker compose version

                            '


                        # =================================================
                        # CREATE APPLICATION DIRECTORY
                        # =================================================

                        echo "=========================================="
                        echo "Creating Application Directory"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" \
                            "mkdir -p ~/todo-app"


                        # =================================================
                        # COPY DOCKER COMPOSE
                        # =================================================

                        echo "=========================================="
                        echo "Copying Docker Compose File"
                        echo "=========================================="


                        scp \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            docker-compose.yml \
                            "$EC2_USER@$EC2_IP:~/todo-app/docker-compose.yml"


                        # =================================================
                        # CREATE .ENV
                        # =================================================

                        echo "=========================================="
                        echo "Creating .env File"
                        echo "=========================================="


                        printf '%s\\n' \
                            "DOCKER_USERNAME=$DOCKER_USERNAME" \
                            "FRONTEND_IMAGE=$FRONTEND_IMAGE" \
                            "BACKEND_IMAGE=$BACKEND_IMAGE" \
                        | ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" \
                            "cat > ~/todo-app/.env"


                        # =================================================
                        # VALIDATE COMPOSE
                        # =================================================

                        echo "=========================================="
                        echo "Validating Docker Compose"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" '

                                set -e

                                cd ~/todo-app

                                sudo docker compose config

                            '


                        # =================================================
                        # PULL IMAGES
                        # =================================================

                        echo "=========================================="
                        echo "Pulling Docker Images"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" '

                                set -e

                                cd ~/todo-app

                                sudo docker compose pull

                            '


                        # =================================================
                        # STOP OLD CONTAINERS
                        # =================================================

                        echo "=========================================="
                        echo "Stopping Existing Containers"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" '

                                cd ~/todo-app

                                sudo docker compose down || true

                            '


                        # =================================================
                        # START APPLICATION
                        # =================================================

                        echo "=========================================="
                        echo "Starting Application"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" '

                                set -e

                                cd ~/todo-app

                                sudo docker compose up -d

                            '


                        # =================================================
                        # SHOW STATUS
                        # =================================================

                        echo "=========================================="
                        echo "Application Status"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" '

                                cd ~/todo-app

                                sudo docker compose ps

                            '


                        echo "=========================================="
                        echo "Application Deployment Completed"
                        echo "=========================================="

                    '''
                }
            }
        }


        // ============================================================
        // VERIFY APPLICATION
        // ============================================================

        stage('Verify Application') {

            steps {

                withCredentials([

                    sshUserPrivateKey(

                        credentialsId:
                        "${env.EC2_SSH_CREDENTIAL}",

                        keyFileVariable:
                        'SSH_KEY'
                    )

                ]) {

                    sh '''

                        set -e


                        echo "=========================================="
                        echo "Application Verification"
                        echo "=========================================="


                        chmod 600 "$SSH_KEY"


                        # =================================================
                        # DOCKER COMPOSE STATUS
                        # =================================================

                        echo "=========================================="
                        echo "Docker Compose Status"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" \
                            "cd ~/todo-app && sudo docker compose ps"


                        # =================================================
                        # CHECK FRONTEND
                        # =================================================

                        echo "=========================================="
                        echo "Checking Frontend"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" \
                            "

                            cd ~/todo-app

                            sudo docker compose ps \
                                --services \
                                --filter status=running \
                            | grep -q '^frontend$'

                            "


                        echo "Frontend service is running."


                        # =================================================
                        # CHECK BACKEND
                        # =================================================

                        echo "=========================================="
                        echo "Checking Backend"
                        echo "=========================================="


                        ssh \
                            -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            "$EC2_USER@$EC2_IP" \
                            "

                            cd ~/todo-app

                            sudo docker compose ps \
                                --services \
                                --filter status=running \
                            | grep -q '^backend$'

                            "


                        echo "Backend service is running."


                        # =================================================
                        # CHECK FRONTEND HTTP
                        # =================================================

                        echo "=========================================="
                        echo "Testing Frontend"
                        echo "=========================================="


                        curl \
                            --fail \
                            --silent \
                            --show-error \
                            --max-time 15 \
                            "http://${EC2_IP}:8080"


                        echo "Frontend is responding successfully."


                        # =================================================
                        # CHECK BACKEND HEALTH
                        # =================================================

                        echo "=========================================="
                        echo "Testing Backend"
                        echo "=========================================="


                        curl \
                            --fail \
                            --silent \
                            --show-error \
                            --max-time 15 \
                            "http://${EC2_IP}:3000/health"


                        echo "Backend is responding successfully."


                        echo "=========================================="
                        echo "APPLICATION VERIFICATION SUCCESSFUL"
                        echo "=========================================="

                    '''
                }
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================

    post {

        success {

            echo """
==================================================
              PIPELINE SUCCESS
==================================================

Todo application deployed successfully.

Security / Quality checks:

- OWASP Dependency Check : PASSED
- SonarQube Analysis     : PASSED
- SonarQube Quality Gate : PASSED

Docker:

- Frontend image built   : SUCCESS
- Backend image built    : SUCCESS
- Docker Hub push        : SUCCESS

Infrastructure:

- Terraform              : SUCCESS
- EC2 deployment         : SUCCESS

Application:

- Frontend               : SUCCESS
- Backend                : SUCCESS

EC2 IP:
${env.EC2_IP}

Frontend:
http://${env.EC2_IP}:8080

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

One or more stages failed.

Check the failed stage in the Jenkins console.

Possible failure areas:

- OWASP Dependency Check
- SonarQube Analysis
- SonarQube Quality Gate
- Docker Build
- Docker Hub Push
- Terraform
- EC2 SSH
- Docker Compose
- Application Verification

==================================================
"""
        }


        always {

            echo """
==================================================
              BUILD INFORMATION
==================================================

Build Number:
${env.BUILD_NUMBER}

EC2 IP:
${env.EC2_IP}

==================================================
"""
        }
    }
}
