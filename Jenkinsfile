pipeline {

    agent any

    environment {

        // =====================================================
        // Jenkins Credentials
        // =====================================================

        DOCKER_CREDENTIALS = 'dockerhub-credentials'
        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'


        // =====================================================
        // SonarQube Jenkins Server Name
        // =====================================================

        SONARQUBE_SERVER = 'SonarQube'
    }


    stages {


        // =====================================================
        // 1. READ INPUT FILE
        // =====================================================

        stage('Read Input File') {

            steps {

                script {

                    echo "=========================================="
                    echo "Reading jenkins-inputs.properties"
                    echo "=========================================="


                    if (!fileExists('jenkins-inputs.properties')) {

                        error(
                            'jenkins-inputs.properties file not found!'
                        )
                    }


                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )


                    // -------------------------------------------------
                    // Read properties from file
                    // -------------------------------------------------

                    env.AWS_REGION_VALUE =
                        props['aws_region']

                    env.DOCKER_USERNAME =
                        props['docker_username']

                    env.EC2_USER =
                        props['ec2_user']

                    env.TERRAFORM_DIR =
                        props['terraform_directory']

                    env.FRONTEND_DIR =
                        props['frontend_directory']

                    env.BACKEND_DIR =
                        props['backend_directory']

                    env.FRONTEND_IMAGE =
                        props['frontend_image']

                    env.BACKEND_IMAGE =
                        props['backend_image']

                    env.AMI_ID =
                        props['ami_id']

                    env.INSTANCE_TYPE =
                        props['instance_type']

                    env.EC2_KEY_NAME =
                        props['key_value']


                    // -------------------------------------------------
                    // Display configuration
                    // -------------------------------------------------

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


                    // -------------------------------------------------
                    // Validate properties
                    // -------------------------------------------------

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
                                "${variableName} is missing in " +
                                "jenkins-inputs.properties"
                            )
                        }
                    }


                    echo "=========================================="
                    echo "Input file loaded successfully"
                    echo "=========================================="
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


                    test -d "$FRONTEND_DIR"

                    echo "Frontend directory : OK"


                    test -d "$BACKEND_DIR"

                    echo "Backend directory  : OK"


                    test -d "$TERRAFORM_DIR"

                    echo "Terraform directory : OK"


                    test -f docker-compose.yml

                    echo "Docker Compose : OK"


                    echo ""
                    echo "All basic tests passed."
                '''
            }
        }


        // =====================================================
        // 3. CHECK OWASP
        // =====================================================

        stage('Check OWASP Dependency Check') {

            steps {

                sh '''
                    set -e

                    echo "=========================================="
                    echo "Checking OWASP Dependency Check"
                    echo "=========================================="


                    if command -v dependency-check.sh >/dev/null 2>&1
                    then

                        echo "dependency-check.sh found."

                        dependency-check.sh --version

                    else

                        echo "ERROR:"
                        echo "dependency-check.sh is not installed."
                        echo ""
                        echo "Install OWASP Dependency-Check CLI"
                        echo "on the Jenkins agent or configure"
                        echo "the Jenkins Dependency-Check tool."

                        exit 1

                    fi
                '''
            }
        }


        // =====================================================
        // 4. OWASP DEPENDENCY CHECK
        // =====================================================

        stage('OWASP Dependency Check') {

            steps {

                echo "=========================================="
                echo "OWASP Dependency Check"
                echo "=========================================="


                sh '''
                    set -e


                    dependency-check.sh \
                        --scan . \
                        --format XML \
                        --format HTML \
                        --out dependency-check-report


                    echo ""
                    echo "OWASP scan completed."
                '''


                dependencyCheckPublisher(

                    pattern:
                        'dependency-check-report/dependency-check-report.xml'
                )
            }
        }


        // =====================================================
        // 5. SONARQUBE ANALYSIS
        // =====================================================

        stage('SonarQube Analysis') {

            steps {

                echo "=========================================="
                echo "SonarQube Analysis"
                echo "=========================================="


                withSonarQubeEnv("${SONARQUBE_SERVER}") {

                    sh '''
                        set -e


                        if ! command -v sonar-scanner >/dev/null 2>&1
                        then

                            echo "ERROR: sonar-scanner is not installed."

                            exit 1

                        fi


                        sonar-scanner \
                            -Dsonar.projectKey=todo-3-tier \
                            -Dsonar.projectName=todo-3-tier \
                            -Dsonar.sources=.
                    '''
                }
            }
        }


        // =====================================================
        // 6. SONARQUBE QUALITY GATE
        // =====================================================

        stage('SonarQube Quality Gate') {

            steps {

                echo "=========================================="
                echo "SonarQube Quality Gate"
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
        // 7. CHECK DOCKER
        // =====================================================

        stage('Check Docker') {

            steps {

                sh '''
                    set -e


                    echo "=========================================="
                    echo "Checking Docker"
                    echo "=========================================="


                    docker --version


                    docker info >/dev/null


                    echo "Docker is working successfully."
                '''
            }
        }


        // =====================================================
        // 8. BUILD FRONTEND IMAGE
        // =====================================================

        stage('Build Frontend Image') {

            steps {

                sh '''
                    set -e


                    echo "=========================================="
                    echo "Building Frontend Image"
                    echo "=========================================="


                    docker build \
                        -t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest \
                        ${FRONTEND_DIR}


                    echo "Frontend image created successfully."
                '''
            }
        }


        // =====================================================
        // 9. BUILD BACKEND IMAGE
        // =====================================================

        stage('Build Backend Image') {

            steps {

                sh '''
                    set -e


                    echo "=========================================="
                    echo "Building Backend Image"
                    echo "=========================================="


                    docker build \
                        -t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest \
                        ${BACKEND_DIR}


                    echo "Backend image created successfully."
                '''
            }
        }


        // =====================================================
        // 10. CHECK TRIVY
        // =====================================================

        stage('Check Trivy') {

            steps {

                sh '''
                    set -e


                    echo "=========================================="
                    echo "Checking Trivy"
                    echo "=========================================="


                    if ! command -v trivy >/dev/null 2>&1
                    then

                        echo "ERROR: Trivy is not installed."

                        exit 1

                    fi


                    trivy --version


                    echo "Trivy is available."
                '''
            }
        }


        // =====================================================
        // 11. TRIVY FRONTEND SCAN
        // =====================================================

        stage('Trivy Frontend Scan') {

            steps {

                sh '''
                    set -e


                    echo "=========================================="
                    echo "Scanning Frontend Image"
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
        // 12. TRIVY BACKEND SCAN
        // =====================================================

        stage('Trivy Backend Scan') {

            steps {

                sh '''
                    set -e


                    echo "=========================================="
                    echo "Scanning Backend Image"
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
        // 13. DOCKER HUB PUSH
        // =====================================================

        stage('Push Docker Images') {

            steps {

                withCredentials([

                    usernamePassword(

                        credentialsId:
                            'dockerhub-credentials',

                        usernameVariable:
                            'DOCKER_USER',

                        passwordVariable:
                            'DOCKER_PASSWORD'

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
        // 14. TERRAFORM INIT
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
        // 15. TERRAFORM VALIDATE
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
        // 16. TERRAFORM PLAN
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
        // 17. TERRAFORM APPLY
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
        // 18. GET EC2 IP
        // =====================================================

        stage('Get EC2 IP') {

            steps {

                dir("${TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(

                            script:
                                'terraform output -raw public_ip',

                            returnStdout:
                                true

                        ).trim()


                        if (!env.EC2_IP) {

                            error(
                                'Terraform did not return public_ip'
                            )
                        }


                        echo "=========================================="
                        echo "EC2 Public IP: ${env.EC2_IP}"
                        echo "=========================================="
                    }
                }
            }
        }


        // =====================================================
        // 19. WAIT FOR EC2
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

                                credentialsId:
                                    "${EC2_SSH_CREDENTIAL}",

                                keyFileVariable:
                                    'SSH_KEY'

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
        // 20. DEPLOY APPLICATION
        // =====================================================

        stage('Deploy Application') {

            steps {

                withCredentials([

                    sshUserPrivateKey(

                        credentialsId:
                            "${EC2_SSH_CREDENTIAL}",

                        keyFileVariable:
                            'SSH_KEY'

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


                        echo "Docker version:"

                        docker --version


                        echo "Docker Compose version:"

                        docker compose version


                        echo "Pulling frontend image..."


                        docker pull \
                            ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest


                        echo "Pulling backend image..."


                        docker pull \
                            ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest


                        echo "Stopping existing application..."


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
        // 21. VERIFY APPLICATION
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

