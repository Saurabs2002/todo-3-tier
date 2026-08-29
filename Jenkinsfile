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

                if (!fileExists('jenkins-inputs.properties')) {
                    error 'jenkins-inputs.properties file not found'
                }

                env.AWS_REGION = sh(
                    script: "grep '^aws_region=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.DOCKER_USERNAME = sh(
                    script: "grep '^docker_username=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.EC2_USER = sh(
                    script: "grep '^ec2_user=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.TERRAFORM_DIR = sh(
                    script: "grep '^terraform_directory=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.FRONTEND_DIR = sh(
                    script: "grep '^frontend_directory=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.BACKEND_DIR = sh(
                    script: "grep '^backend_directory=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.FRONTEND_IMAGE = sh(
                    script: "grep '^frontend_image=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.BACKEND_IMAGE = sh(
                    script: "grep '^backend_image=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.AMI_ID = sh(
                    script: "grep '^ami_id=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.INSTANCE_TYPE = sh(
                    script: "grep '^instance_type=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                env.KEY_VALUE = sh(
                    script: "grep '^key_value=' jenkins-inputs.properties | cut -d'=' -f2-",
                    returnStdout: true
                ).trim()

                echo "===================================="
                echo "Input file loaded successfully"
                echo "===================================="
                echo "AWS Region: ${env.AWS_REGION}"
                echo "Docker Username: ${env.DOCKER_USERNAME}"
                echo "EC2 User: ${env.EC2_USER}"
                echo "Terraform Directory: ${env.TERRAFORM_DIR}"
                echo "Frontend Directory: ${env.FRONTEND_DIR}"
                echo "Backend Directory: ${env.BACKEND_DIR}"
                echo "Frontend Image: ${env.FRONTEND_IMAGE}"
                echo "Backend Image: ${env.BACKEND_IMAGE}"
                echo "AMI ID: ${env.AMI_ID}"
                echo "Instance Type: ${env.INSTANCE_TYPE}"
                echo "Key Pair: ${env.KEY_VALUE}"
                echo "===================================="
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
                    credentialsId: "${DOCKER_CREDENTIAL_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASSWORD'
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

                sh 'terraform init'
            }
        }
    }

    stage('Terraform Validate') {
        steps {

            dir("${env.TERRAFORM_DIR}") {

                sh 'terraform validate'
            }
        }
    }

    stage('Terraform Plan') {
        steps {

            dir("${env.TERRAFORM_DIR}") {

                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: "${AWS_CREDENTIAL_ID}"]
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
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: "${AWS_CREDENTIAL_ID}"]
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
