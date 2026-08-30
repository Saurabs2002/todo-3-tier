pipeline {

    agent any

    environment {

        // =====================================================
        // Jenkins Credentials
        // =====================================================

        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'
        DOCKER_CREDENTIALS = 'dockerhub-credentials'

        // =====================================================
        // Jenkins Tools
        // =====================================================

        OWASP_INSTALLATION = 'dependency-check'
        SONARQUBE_SERVER   = 'SonarQube'
    }


    stages {

        // =====================================================
        // 1. READ INPUT FILE
        // =====================================================

        stage('Read Input File') {

            steps {

                script {

                    echo "=========================================="
                    echo "Reading input.properties"
                    echo "=========================================="

                    if (!fileExists('input.properties')) {
                        error "input.properties file not found!"
                    }

                    def props = readProperties file: 'input.properties'

                    env.AWS_REGION_VALUE = props['AWS_REGION']
                    env.DOCKER_USERNAME  = props['DOCKER_USERNAME']

                    env.EC2_USER         = props['EC2_USER']

                    env.TERRAFORM_DIR    = props['TERRAFORM_DIR']

                    env.FRONTEND_DIR     = props['FRONTEND_DIR']
                    env.BACKEND_DIR      = props['BACKEND_DIR']

                    env.FRONTEND_IMAGE   = props['FRONTEND_IMAGE']
                    env.BACKEND_IMAGE    = props['BACKEND_IMAGE']

                    env.AMI_ID           = props['AMI_ID']
                    env.INSTANCE_TYPE   = props['INSTANCE_TYPE']
                    env.EC2_KEY_NAME    = props['EC2_KEY_NAME']


                    echo "=========================================="
                    echo "Input Configuration"
                    echo "=========================================="

                    echo "AWS Region      : ${env.AWS_REGION_VALUE}"
                    echo "Docker Username : ${env.DOCKER_USERNAME}"
                    echo "EC2 User        : ${env.EC2_USER}"
                    echo "Terraform Dir   : ${env.TERRAFORM_DIR}"
                    echo "Frontend Dir    : ${env.FRONTEND_DIR}"
                    echo "Backend Dir     : ${env.BACKEND_DIR}"
                    echo "Frontend Image  : ${env.FRONTEND_IMAGE}"
                    echo "Backend Image   : ${env.BACKEND_IMAGE}"
                    echo "AMI ID          : ${env.AMI_ID}"
                    echo "Instance Type   : ${env.INSTANCE_TYPE}"
                    echo "EC2 Key Name    : ${env.EC2_KEY_NAME}"


                    // =================================================
                    // Validate required properties
                    // =================================================

                    def requiredProperties = [
                        'AWS_REGION_VALUE',
                        'DOCKER_USERNAME',
                        'EC2_USER',
                        'TERRAFORM_DIR',
                        'FRONTEND_DIR',
                        'BACKEND_DIR',
                        'FRONTEND_IMAGE',
                        'BACKEND_IMAGE',
                        'AMI_ID',
                        'INSTANCE_TYPE',
                        'EC2_KEY_NAME'
                    ]


                    requiredProperties.each { variableName ->

                        def value = env."${variableName}"

                        if (!value ||
                            value == 'null' ||
                            value.trim() == '') {

                            error(
                                "Required property ${variableName} " +
                                "is missing in input.properties"
                            )
                        }
                    }
                }
            }
        }


        // =====================================================
        // 2. BASIC TESTS
        // =====================================================

        stage('Basic Tests') {

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

                    echo "Checking docker-compose.yml..."
                    test -f docker-compose.yml

                    echo "Frontend directory   : OK"
                    echo "Backend directory    : OK"
                    echo "Terraform directory  : OK"
                    echo "Docker Compose       : OK"

                    echo "All basic tests passed."
                '''
            }
        }


        // =====================================================
        // 3. OWASP DEPENDENCY CHECK
        // =====================================================

        stage('OWASP Dependency Check') {

            steps {

                echo "=========================================="
                echo "OWASP Dependency Check"
                echo "=========================================="

                dependencyCheck(
                    odcInstallation: 'dependency-check',
                    additionalArguments:
                        '--scan . --format XML --format HTML'
                )

                dependencyCheckPublisher(
                    pattern: '**/dependency-check-report.xml'
                )
            }
        }


        // =====================================================
        // 4. SONARQUBE ANALYSIS
        // =====================================================

        stage('SonarQube Analysis') {

            steps {

                echo "=========================================="
                echo "SonarQube Analysis"
                echo "=========================================="

                withSonarQubeEnv('SonarQube') {

                    sh '''
                        set -e

                        sonar-scanner \
                          -Dsonar.projectKey=todo-3-tier \
                          -Dsonar.projectName=todo-3-tier \
                          -Dsonar.sources=.
                    '''
                }
            }
        }


        // =====================================================
        // 5. SONARQUBE QUALITY GATE
        // =====================================================

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
            }
        }


        // =====================================================
        // 6. CHECK DOCKER
        // =====================================================

        stage('Check Docker') {

            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo "Checking Docker"
                    echo "=========================================="

                    docker --version

                    docker info > /dev/null

                    echo "Docker is working."
                '''
            }
        }


        // =====================================================
        // 7. BUILD FRONTEND IMAGE
        // =====================================================

        stage('Build Frontend Image') {

            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo "Building Frontend Docker Image"
                    echo "=========================================="

                    docker build \
                      -t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest \
                      ${FRONTEND_DIR}

                    echo "Frontend image built successfully."

                    docker images | grep "${FRONTEND_IMAGE}"
                '''
            }
        }


        // =====================================================
        // 8. BUILD BACKEND IMAGE
        // =====================================================

        stage('Build Backend Image') {

            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo "Building Backend Docker Image"
                    echo "=========================================="

                    docker build \
                      -t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest \
                      ${BACKEND_DIR}

                    echo "Backend image built successfully."

                    docker images | grep "${BACKEND_IMAGE}"
                '''
            }
        }


        // =====================================================
        // 9. CHECK TRIVY
        // =====================================================

        stage('Check Trivy') {

            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo "Checking Trivy"
                    echo "=========================================="

                    trivy --version

                    echo "Trivy is available."
                '''
            }
        }


        // =====================================================
        // 10. TRIVY FRONTEND SCAN
        // =====================================================

        stage('Trivy Frontend Scan') {

            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo "Trivy Frontend Image Scan"
                    echo "=========================================="

                    trivy image \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest

                    echo "Frontend security scan passed."
                '''
            }
        }


        // =====================================================
        // 11. TRIVY BACKEND SCAN
        // =====================================================

        stage('Trivy Backend Scan') {

            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo "Trivy Backend Image Scan"
                    echo "=========================================="

                    trivy image \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest

                    echo "Backend security scan passed."
                '''
            }
        }


        // =====================================================
        // 12. PUSH DOCKER IMAGES
        // =====================================================

        stage('Push Docker Images') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Docker Hub Login"
                        echo "=========================================="

                        echo "$DOCKER_PASSWORD" | \
                          docker login \
                          --username "$DOCKER_USER" \
                          --password-stdin


                        echo "Pushing frontend image..."

                        docker push \
                          ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest


                        echo "Pushing backend image..."

                        docker push \
                          ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest


                        docker logout

                        echo "Docker images pushed successfully."
                    '''
                }
            }
        }


        // =====================================================
        // 13. TERRAFORM INIT
        // =====================================================

        stage('Terraform Init') {

            steps {

                dir("${TERRAFORM_DIR}") {

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
        // 14. TERRAFORM VALIDATE
        // =====================================================

        stage('Terraform Validate') {

            steps {

                dir("${TERRAFORM_DIR}") {

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
        // 15. TERRAFORM PLAN
        // =====================================================

        stage('Terraform Plan') {

            steps {

                dir("${TERRAFORM_DIR}") {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Terraform Plan"
                        echo "=========================================="

                        terraform plan \
                          -out=tfplan
                    '''
                }
            }
        }


        // =====================================================
        // 16. TERRAFORM APPLY
        // =====================================================

        stage('Terraform Apply') {

            steps {

                dir("${TERRAFORM_DIR}") {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Terraform Apply"
                        echo "=========================================="

                        terraform apply \
                          -auto-approve \
                          tfplan
                    '''
                }
            }
        }


        // =====================================================
        // 17. GET EC2 IP
        // =====================================================

        stage('Get EC2 IP') {

            steps {

                dir("${TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(
                            script: 'terraform output -raw public_ip',
                            returnStdout: true
                        ).trim()

                        if (!env.EC2_IP) {
                            error "EC2 public IP was not returned by Terraform."
                        }

                        echo "=========================================="
                        echo "EC2 Information"
                        echo "=========================================="

                        echo "EC2 Public IP : ${env.EC2_IP}"
                    }
                }
            }
        }


        // =====================================================
        // 18. WAIT FOR EC2 SSH
        // =====================================================

        stage('Wait For EC2') {

            steps {

                script {

                    echo "=========================================="
                    echo "Waiting for EC2 SSH"
                    echo "=========================================="

                    retry(10) {

                        sleep 15

                        withCredentials([
                            sshUserPrivateKey(
                                credentialsId: 'ec2-ssh-key',
                                keyFileVariable: 'SSH_KEY'
                            )
                        ]) {

                            sh '''
                                chmod 600 "$SSH_KEY"

                                ssh \
                                  -o StrictHostKeyChecking=no \
                                  -o ConnectTimeout=10 \
                                  -i "$SSH_KEY" \
                                  ${EC2_USER}@${EC2_IP} \
                                  "echo SSH connection successful"
                            '''
                        }
                    }
                }
            }
        }


        // =====================================================
        // 19. DEPLOY APPLICATION
        // =====================================================

        stage('Deploy Application') {

            steps {

                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo "Deploying Application"
                        echo "=========================================="

                        chmod 600 "$SSH_KEY"


                        echo "Copying docker-compose.yml..."

                        scp \
                          -o StrictHostKeyChecking=no \
                          -i "$SSH_KEY" \
                          docker-compose.yml \
                          ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/


                        echo "Connecting to EC2..."

                        ssh \
                          -o StrictHostKeyChecking=no \
                          -i "$SSH_KEY" \
                          ${EC2_USER}@${EC2_IP} << EOF

                        set -e

                        echo "Installing Docker Compose if required..."

                        docker --version
                        docker compose version


                        echo "Pulling frontend image..."

                        docker pull \
                          ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest


                        echo "Pulling backend image..."

                        docker pull \
                          ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest


                        echo "Stopping old containers..."

                        docker compose down || true


                        echo "Starting application..."

                        docker compose up -d


                        echo "Running containers:"

                        docker ps

                        EOF
                    '''
                }
            }
        }


        // =====================================================
        // 20. VERIFY APPLICATION
        // =====================================================

        stage('Verify Application') {

            steps {

                script {

                    echo "=========================================="
                    echo "Verifying Application"
                    echo "=========================================="

                    sleep 20

                    sh '''
                        set -e

                        echo "Testing application..."

                        curl \
                          --fail \
                          --connect-timeout 10 \
                          http://${EC2_IP}

                        echo ""
                        echo "Application verification successful."
                    '''
                }
            }
        }
    }


    // =========================================================
    // POST ACTIONS
    // =========================================================

    post {

        success {

            echo """
==================================================
              PIPELINE SUCCESSFUL
==================================================

Build Number : ${BUILD_NUMBER}
EC2 IP       : ${env.EC2_IP}

==================================================
"""
        }


        failure {

            echo """
==================================================
              PIPELINE FAILED
==================================================

Build Number : ${BUILD_NUMBER}
EC2 IP       : ${env.EC2_IP}

Check the failed stage in the Jenkins console.

==================================================
"""
        }


        always {

            echo "Pipeline execution completed."
        }
    }
}
