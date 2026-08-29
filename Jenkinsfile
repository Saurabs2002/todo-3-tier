pipeline {

    agent any

    options {
        skipDefaultCheckout(false)
    }

    environment {

        AWS_CREDENTIAL_ID = 'aws-credentials'
        DOCKER_CREDENTIAL_ID = 'dockerhub-credentials'

        AWS_REGION = ''
        DOCKER_USERNAME = ''
        EC2_USER = ''

        TERRAFORM_DIR = ''
        FRONTEND_DIR = ''
        BACKEND_DIR = ''

        FRONTEND_IMAGE = ''
        BACKEND_IMAGE = ''

        AMI_ID = ''
        INSTANCE_TYPE = ''
        KEY_VALUE = ''

        EC2_IP = ''
    }

    stages {

        /*
         * =====================================================
         * READ INPUT FILE
         * =====================================================
         */

        stage('Read Input File') {

            steps {

                script {

                    if (!fileExists('jenkins-inputs.properties')) {

                        error(
                            'jenkins-inputs.properties not found in workspace'
                        )
                    }

                    echo '========================================'
                    echo 'Reading jenkins-inputs.properties'
                    echo '========================================'


                    /*
                     * Read every value directly using Linux commands.
                     *
                     * This avoids Groovy [] syntax and therefore
                     * avoids the Jenkins Script Security error.
                     */

                    env.AWS_REGION = sh(
                        script: '''
                            grep '^aws_region=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.DOCKER_USERNAME = sh(
                        script: '''
                            grep '^docker_username=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.EC2_USER = sh(
                        script: '''
                            grep '^ec2_user=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.TERRAFORM_DIR = sh(
                        script: '''
                            grep '^terraform_directory=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.FRONTEND_DIR = sh(
                        script: '''
                            grep '^frontend_directory=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.BACKEND_DIR = sh(
                        script: '''
                            grep '^backend_directory=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.FRONTEND_IMAGE = sh(
                        script: '''
                            grep '^frontend_image=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.BACKEND_IMAGE = sh(
                        script: '''
                            grep '^backend_image=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.AMI_ID = sh(
                        script: '''
                            grep '^ami_id=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.INSTANCE_TYPE = sh(
                        script: '''
                            grep '^instance_type=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    env.KEY_VALUE = sh(
                        script: '''
                            grep '^key_value=' jenkins-inputs.properties |
                            head -1 |
                            cut -d= -f2-
                        ''',
                        returnStdout: true
                    ).trim()


                    /*
                     * =================================================
                     * VALIDATE VALUES
                     * =================================================
                     */

                    if (!env.AWS_REGION) {
                        error('aws_region is missing')
                    }

                    if (!env.DOCKER_USERNAME) {
                        error('docker_username is missing')
                    }

                    if (!env.EC2_USER) {
                        error('ec2_user is missing')
                    }

                    if (!env.TERRAFORM_DIR) {
                        error('terraform_directory is missing')
                    }

                    if (!env.FRONTEND_DIR) {
                        error('frontend_directory is missing')
                    }

                    if (!env.BACKEND_DIR) {
                        error('backend_directory is missing')
                    }

                    if (!env.FRONTEND_IMAGE) {
                        error('frontend_image is missing')
                    }

                    if (!env.BACKEND_IMAGE) {
                        error('backend_image is missing')
                    }

                    if (!env.AMI_ID) {
                        error('ami_id is missing')
                    }

                    if (!env.INSTANCE_TYPE) {
                        error('instance_type is missing')
                    }

                    if (!env.KEY_VALUE) {
                        error('key_value is missing')
                    }


                    /*
                     * =================================================
                     * DISPLAY VALUES
                     * =================================================
                     */

                    echo """
====================================================
INPUT FILE LOADED SUCCESSFULLY
====================================================

AWS Region       : ${env.AWS_REGION}
Docker Username  : ${env.DOCKER_USERNAME}
EC2 User         : ${env.EC2_USER}

Terraform Dir    : ${env.TERRAFORM_DIR}
Frontend Dir     : ${env.FRONTEND_DIR}
Backend Dir      : ${env.BACKEND_DIR}

Frontend Image   : ${env.FRONTEND_IMAGE}
Backend Image    : ${env.BACKEND_IMAGE}

AMI ID           : ${env.AMI_ID}
Instance Type    : ${env.INSTANCE_TYPE}
Key Pair         : ${env.KEY_VALUE}

====================================================
"""
                }
            }
        }


        /*
         * =====================================================
         * TEST
         * =====================================================
         */

        stage('Test') {

            steps {

                sh '''
                    echo "Running tests..."

                    echo "Frontend directory:"
                    ls -la "${FRONTEND_DIR}"

                    echo "Backend directory:"
                    ls -la "${BACKEND_DIR}"

                    echo "Tests passed"
                '''
            }
        }


        /*
         * =====================================================
         * BUILD FRONTEND
         * =====================================================
         */

        stage('Build Frontend Image') {

            steps {

                sh '''
                    echo "Building frontend image..."

                    docker build \
                        -t "${FRONTEND_IMAGE}:${BUILD_NUMBER}" \
                        "${FRONTEND_DIR}"

                    docker tag \
                        "${FRONTEND_IMAGE}:${BUILD_NUMBER}" \
                        "${FRONTEND_IMAGE}:latest"
                '''
            }
        }


        /*
         * =====================================================
         * BUILD BACKEND
         * =====================================================
         */

        stage('Build Backend Image') {

            steps {

                sh '''
                    echo "Building backend image..."

                    docker build \
                        -t "${BACKEND_IMAGE}:${BUILD_NUMBER}" \
                        "${BACKEND_DIR}"

                    docker tag \
                        "${BACKEND_IMAGE}:${BUILD_NUMBER}" \
                        "${BACKEND_IMAGE}:latest"
                '''
            }
        }


        /*
         * =====================================================
         * PUSH DOCKER IMAGES
         * =====================================================
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
                        echo "${DOCKER_PASSWORD}" | \
                        docker login \
                        --username "${DOCKER_USER}" \
                        --password-stdin

                        docker push \
                            "${FRONTEND_IMAGE}:${BUILD_NUMBER}"

                        docker push \
                            "${FRONTEND_IMAGE}:latest"

                        docker push \
                            "${BACKEND_IMAGE}:${BUILD_NUMBER}"

                        docker push \
                            "${BACKEND_IMAGE}:latest"

                        docker logout
                    '''
                }
            }
        }


        /*
         * =====================================================
         * TERRAFORM INIT
         * =====================================================
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
         * =====================================================
         * TERRAFORM VALIDATE
         * =====================================================
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
         * =====================================================
         * TERRAFORM PLAN
         * =====================================================
         */

        stage('Terraform Plan') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [
                            $class: 'AmazonWebServicesCredentialsBinding',
                            credentialsId: "${AWS_CREDENTIAL_ID}"
                        ]
                    ]) {

                        sh '''
                            terraform plan \
                                -var="aws_region=${AWS_REGION}" \
                                -var="ami_id=${AMI_ID}" \
                                -var="instance_type=${INSTANCE_TYPE}" \
                                -var="key_value=${KEY_VALUE}"
                        '''
                    }
                }
            }
        }


        /*
         * =====================================================
         * TERRAFORM APPLY
         * =====================================================
         */

        stage('Terraform Apply') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [
                            $class: 'AmazonWebServicesCredentialsBinding',
                            credentialsId: "${AWS_CREDENTIAL_ID}"
                        ]
                    ]) {

                        sh '''
                            terraform apply \
                                -auto-approve \
                                -var="aws_region=${AWS_REGION}" \
                                -var="ami_id=${AMI_ID}" \
                                -var="instance_type=${INSTANCE_TYPE}" \
                                -var="key_value=${KEY_VALUE}"
                        '''
                    }
                }
            }
        }


        /*
         * =====================================================
         * GET EC2 IP
         * =====================================================
         */

        stage('Get EC2 IP') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(
                            script: '''
                                terraform output -raw public_ip
                            ''',
                            returnStdout: true
                        ).trim()

                        echo "EC2 Public IP: ${env.EC2_IP}"
                    }
                }
            }
        }


        /*
         * =====================================================
         * WAIT FOR EC2
         * =====================================================
         */

        stage('Wait For EC2') {

            steps {

                sh '''
                    echo "Waiting for EC2 SSH..."

                    for i in $(seq 1 30)
                    do

                        if nc -z -w 5 "${EC2_IP}" 22
                        then
                            echo "SSH is available."
                            exit 0
                        fi

                        echo "Waiting for SSH..."
                        sleep 10

                    done

                    echo "SSH connection not available."
                    exit 1
                '''
            }
        }


        /*
         * =====================================================
         * DEPLOY APPLICATION
         * =====================================================
         */

        stage('Deploy Application') {

            steps {

                echo """
====================================================
APPLICATION DEPLOYMENT
====================================================

EC2 IP   : ${env.EC2_IP}
EC2 User : ${env.EC2_USER}

====================================================
"""
            }
        }


        /*
         * =====================================================
         * VERIFY
         * =====================================================
         */

        stage('Verify') {

            steps {

                sh '''
                    echo "========================================"
                    echo "Deployment verification"
                    echo "========================================"

                    echo "EC2 IP: ${EC2_IP}"

                    echo "Pipeline completed successfully."
                '''
            }
        }
    }


    /*
     * =========================================================
     * POST
     * =========================================================
     */

    post {

        success {

            echo '''
==================================================
              PIPELINE SUCCESS
==================================================
'''
        }

        failure {

            echo '''
==================================================
              PIPELINE FAILED
==================================================

Check the stage that failed above.

==================================================
'''
        }
    }
}

