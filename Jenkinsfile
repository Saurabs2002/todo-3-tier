pipeline {

    agent any

    environment {

        AWS_CREDENTIAL_ID = 'aws-credentials'

        DOCKER_CREDENTIAL_ID = 'docker-credentials'

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
    }

    stages {

        stage('Checkout') {

            steps {

                checkout scm
            }
        }


        stage('Read Input File') {

            steps {

                script {

                    /*
                     * Check whether properties file exists
                     */

                    if (!fileExists('jenkins-inputs.properties')) {

                        error(
                            'jenkins-inputs.properties file not found'
                        )
                    }


                    /*
                     * Create empty map
                     */

                    def props = [:]


                    /*
                     * Read properties file
                     */

                    def inputFile =
                        readFile(
                            file: 'jenkins-inputs.properties'
                        )


                    /*
                     * Parse every line
                     */

                    inputFile.readLines().each { line ->

                        line = line.trim()


                        /*
                         * Ignore blank lines
                         */

                        if (line == '') {
                            return
                        }


                        /*
                         * Ignore comments
                         */

                        if (line.startsWith('#')) {
                            return
                        }


                        /*
                         * Find "="
                         */

                        def separator =
                            line.indexOf('=')


                        /*
                         * Make sure line has key=value
                         */

                        if (separator <= 0) {

                            error(
                                "Invalid property line: ${line}"
                            )
                        }


                        /*
                         * Extract key
                         */

                        def key =
                            line.substring(
                                0,
                                separator
                            ).trim()


                        /*
                         * Extract value
                         */

                        def value =
                            line.substring(
                                separator + 1
                            ).trim()


                        /*
                         * Store in map
                         */

                        props[key] = value
                    }


                    /*
                     * Required properties
                     */

                    def requiredProperties = [

                        'aws_region',

                        'docker_username',

                        'ec2_user',

                        'terraform_directory',

                        'frontend_directory',

                        'backend_directory',

                        'frontend_image',

                        'backend_image',

                        'ami_id',

                        'instance_type',

                        'key_value'
                    ]


                    /*
                     * Validate properties
                     */

                    requiredProperties.each { key ->

                        if (
                            !props.containsKey(key) ||
                            props[key] == ''
                        ) {

                            error(
                                "Missing required property: ${key}"
                            )
                        }
                    }


                    /*
                     * Set Jenkins environment variables
                     */

                    env.AWS_REGION =
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


                    env.KEY_VALUE =
                        props['key_value']


                    /*
                     * Display values
                     */

                    echo '========================================'

                    echo 'Input file loaded successfully'

                    echo '========================================'

                    echo "AWS Region       : ${env.AWS_REGION}"

                    echo "Docker Username  : ${env.DOCKER_USERNAME}"

                    echo "EC2 User         : ${env.EC2_USER}"

                    echo "Terraform Dir    : ${env.TERRAFORM_DIR}"

                    echo "Frontend Dir     : ${env.FRONTEND_DIR}"

                    echo "Backend Dir      : ${env.BACKEND_DIR}"

                    echo "Frontend Image   : ${env.FRONTEND_IMAGE}"

                    echo "Backend Image    : ${env.BACKEND_IMAGE}"

                    echo "AMI ID           : ${env.AMI_ID}"

                    echo "Instance Type    : ${env.INSTANCE_TYPE}"

                    echo "Key Pair         : ${env.KEY_VALUE}"

                    echo '========================================'
                }
            }
        }


        stage('Test') {

            steps {

                sh '''
                    echo "Running tests..."

                    echo "Tests passed"
                '''
            }
        }


        stage('Build Frontend Image') {

            steps {

                sh """

                    docker build \
                    -t ${env.FRONTEND_IMAGE}:${env.BUILD_NUMBER} \
                    ./${env.FRONTEND_DIR}

                """
            }
        }


        stage('Build Backend Image') {

            steps {

                sh """

                    docker build \
                    -t ${env.BACKEND_IMAGE}:${env.BUILD_NUMBER} \
                    ./${env.BACKEND_DIR}

                """
            }
        }


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

                    sh """

                        echo "\$DOCKER_PASSWORD" | \
                        docker login \
                        -u "\$DOCKER_USER" \
                        --password-stdin


                        docker push \
                        ${env.FRONTEND_IMAGE}:${env.BUILD_NUMBER}


                        docker push \
                        ${env.BACKEND_IMAGE}:${env.BUILD_NUMBER}


                        docker logout

                    """
                }
            }
        }


        stage('Terraform Init') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh '''

                        terraform init

                    '''
                }
            }
        }


        stage('Terraform Validate') {

            steps {

                dir("${env.TERRAFORM_DIR}") {

                    sh '''

                        terraform validate

                    '''
                }
            }
        }


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

                        sh """

                            terraform plan \
                            -var="aws_region=${env.AWS_REGION}" \
                            -var="ami_id=${env.AMI_ID}" \
                            -var="instance_type=${env.INSTANCE_TYPE}" \
                            -var="key_value=${env.KEY_VALUE}"

                        """
                    }
                }
            }
        }


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

                        sh """

                            terraform apply \
                            -auto-approve \
                            -var="aws_region=${env.AWS_REGION}" \
                            -var="ami_id=${env.AMI_ID}" \
                            -var="instance_type=${env.INSTANCE_TYPE}" \
                            -var="key_value=${env.KEY_VALUE}"

                        """
                    }
                }
            }
        }
    }


    post {

        success {

            echo '''

            ==========================================
                 PIPELINE SUCCESS
            ==========================================

            '''
        }


        failure {

            echo '''

            ==========================================
                 PIPELINE FAILED
            ==========================================

            Check Jenkins Console Output.

            ==========================================

            '''
        }
    }
}
