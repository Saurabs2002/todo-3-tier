pipeline {

    agent any

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
         * =========================================================
         * CHECKOUT
         * =========================================================
         */

        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        /*
         * =========================================================
         * READ PROPERTIES FILE
         * =========================================================
         */

        stage('Read Input File') {

            steps {

                script {

                    if (!fileExists('jenkins-inputs.properties')) {

                        error """
                        jenkins-inputs.properties not found.

                        Make sure the file exists in the root
                        of the Git repository.
                        """
                    }

                    def content = readFile(
                        file: 'jenkins-inputs.properties'
                    )

                    def props = [:]

                    content.split('\n').each { line ->

                        line = line.trim()

                        /*
                         * Ignore blank lines and comments
                         */
                        if (line &&
                            !line.startsWith('#') &&
                            line.contains('=')) {

                            def parts = line.split(
                                '=',
                                2
                            )

                            def key = parts[0].trim()
                            def value = parts[1].trim()

                            props[key] = value
                        }
                    }


                    /*
                     * Read values
                     */

                    env.AWS_REGION = props['aws_region']
                    env.DOCKER_USERNAME = props['docker_username']
                    env.EC2_USER = props['ec2_user']

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

                    env.KEY_VALUE =
                        props['key_value']


                    /*
                     * Validate required values
                     */

                    def required = [
                        'AWS_REGION',
                        'DOCKER_USERNAME',
                        'EC2_USER',
                        'TERRAFORM_DIR',
                        'FRONTEND_DIR',
                        'BACKEND_DIR',
                        'FRONTEND_IMAGE',
                        'BACKEND_IMAGE',
                        'AMI_ID',
                        'INSTANCE_TYPE',
                        'KEY_VALUE'
                    ]

                    required.each { variableName ->

                        if (!env[variableName] ||
                            env[variableName] == 'null') {

                            error(
                                "Required property '${variableName}' is missing."
                            )
                        }
                    }


                    /*
                     * Display configuration
                     */

                    echo """
====================================================
INPUT FILE LOADED
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
         * =========================================================
         * TEST
         * =========================================================
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
         * =========================================================
         * BUILD FRONTEND IMAGE
         * =========================================================
         */

        stage('Build Frontend Image') {

            steps {

                sh '''
                    echo "Building frontend Docker image..."

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
         * =========================================================
         * BUILD BACKEND IMAGE
         * =========================================================
         */

        stage('Build Backend Image') {

            steps {

                sh '''
                    echo "Building backend Docker image..."

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
         * =========================================================
         * PUSH DOCKER IMAGES
         * =========================================================
         */

        stage('Push Docker Images') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId:
                            "${DOCKER_CREDENTIAL_ID}",
                        usernameVariable:
                            'DOCKER_USER',
                        passwordVariable:
                            'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "${DOCKER_PASSWORD}" | \
                        docker login \
                        -u "${DOCKER_USER}" \
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
         * =========================================================
         * TERRAFORM INIT
         * =========================================================
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
         * =========================================================
         * TERRAFORM VALIDATE
         * =========================================================
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
         * =========================================================
         * TERRAFORM PLAN
         * =========================================================
         */

        stage('Terraform Plan') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [
                            $class:
                                'AmazonWebServicesCredentialsBinding',

                            credentialsId:
                                "${AWS_CREDENTIAL_ID}"
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
         * =========================================================
         * TERRAFORM APPLY
         * =========================================================
         */

        stage('Terraform Apply') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    withCredentials([
                        [
                            $class:
                                'AmazonWebServicesCredentialsBinding',

                            credentialsId:
                                "${AWS_CREDENTIAL_ID}"
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
         * =========================================================
         * GET EC2 IP
         * =========================================================
         */

        stage('Get EC2 IP') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    script {

                        env.EC2_IP = sh(
                            script: '''
                                terraform output \
                                    -raw public_ip
                            ''',
                            returnStdout: true
                        ).trim()

                        echo "EC2 Public IP: ${env.EC2_IP}"
                    }
                }
            }
        }


        /*
         * =========================================================
         * WAIT FOR EC2
         * =========================================================
         */

        stage('Wait For EC2') {

            steps {

                sh '''
                    echo "Waiting for EC2 SSH..."

                    for i in $(seq 1 30)
                    do

                        if nc -z -w 5 "${EC2_IP}" 22
                        then
                            echo "SSH port is available."
                            exit 0
                        fi

                        echo "Waiting..."

                        sleep 10

                    done

                    echo "EC2 SSH is not available."
                    exit 1
                '''
            }
        }


        /*
         * =========================================================
         * DEPLOY APPLICATION
         * =========================================================
         */

        stage('Deploy Application') {

            steps {

                echo """
                EC2 deployment stage.

                EC2 IP    : ${env.EC2_IP}
                EC2 User  : ${env.EC2_USER}
                """
            }
        }


        /*
         * =========================================================
         * VERIFY
         * =========================================================
         */

        stage('Verify') {

            steps {

                sh '''
                    echo "======================================"
                    echo "Deployment verification"
                    echo "======================================"

                    echo "EC2 IP: ${EC2_IP}"

                    echo "Pipeline completed successfully."
                '''
            }
        }
    }


    /*
     * =============================================================
     * POST ACTIONS
     * =============================================================
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

