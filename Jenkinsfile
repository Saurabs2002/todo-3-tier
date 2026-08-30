pipeline {

    agent any

    environment {
        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'
    }

    stages {


        stage('Read Input File') {

            steps {

                script {

                    if (!fileExists('jenkins-inputs.properties')) {
                        error "jenkins-inputs.properties file missing"
                    }


                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )


                    env.AWS_REGION      = props.aws_region
                    env.DOCKER_USERNAME = props.docker_username
                    env.EC2_USER        = props.ec2_user
                    env.TERRAFORM_DIR   = props.terraform_directory
                    env.FRONTEND_DIR    = props.frontend_directory
                    env.BACKEND_DIR     = props.backend_directory

                    env.FRONTEND_IMAGE  = props.frontend_image
                    env.BACKEND_IMAGE   = props.backend_image

                    env.AMI_ID          = props.ami_id
                    env.INSTANCE_TYPE   = props.instance_type
                    env.KEY_NAME        = props.key_name


                    echo """
                    AWS Region : ${AWS_REGION}
                    Frontend   : ${FRONTEND_IMAGE}
                    Backend    : ${BACKEND_IMAGE}
                    AMI        : ${AMI_ID}
                    Key Name   : ${KEY_NAME}
                    """

                }
            }
        }



        stage('Build Frontend Image') {

            steps {

                sh '''
                docker build \
                -t $DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER \
                $FRONTEND_DIR


                docker tag \
                $DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER \
                $DOCKER_USERNAME/$FRONTEND_IMAGE:latest

                '''
            }
        }



        stage('Build Backend Image') {

            steps {

                sh '''
                docker build \
                -t $DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER \
                $BACKEND_DIR


                docker tag \
                $DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER \
                $DOCKER_USERNAME/$BACKEND_IMAGE:latest

                '''
            }
        }



        stage('Push Docker Images') {

            steps {


                withCredentials([
                    usernamePassword(
                        credentialsId:'dockerhub-credentials',
                        usernameVariable:'DH_USER',
                        passwordVariable:'DH_TOKEN'
                    )
                ]){


                    sh '''

                    echo $DH_TOKEN | docker login \
                    --username $DH_USER \
                    --password-stdin


                    docker push \
                    $DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER


                    docker push \
                    $DOCKER_USERNAME/$FRONTEND_IMAGE:latest


                    docker push \
                    $DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER


                    docker push \
                    $DOCKER_USERNAME/$BACKEND_IMAGE:latest


                    docker logout

                    '''

                }

            }
        }




        stage('Terraform Init') {

            steps {

                dir("${TERRAFORM_DIR}"){

                    sh "terraform init"

                }
            }
        }





        stage('Terraform Validate') {

            steps {

                dir("${TERRAFORM_DIR}"){

                    sh "terraform validate"

                }
            }
        }





        stage('Terraform Plan') {

            steps {

                dir("${TERRAFORM_DIR}"){


                    sh """

                    terraform plan \
                    -var='aws_region=${AWS_REGION}' \
                    -var='ami_id=${AMI_ID}' \
                    -var='instance_type=${INSTANCE_TYPE}' \
                    -var='key_name=${KEY_NAME}'

                    """

                }
            }
        }





        stage('Terraform Apply') {

            steps {

                dir("${TERRAFORM_DIR}"){


                    sh """

                    terraform apply \
                    -auto-approve \
                    -var='aws_region=${AWS_REGION}' \
                    -var='ami_id=${AMI_ID}' \
                    -var='instance_type=${INSTANCE_TYPE}' \
                    -var='key_name=${KEY_NAME}'

                    """

                }
            }
        }





        stage('Get EC2 IP') {


            steps {

                dir("${TERRAFORM_DIR}"){


                    script {


                        env.EC2_IP = sh(
                            script:
                            "terraform output -raw public_ip",
                            returnStdout:true
                        ).trim()



                        echo "EC2 IP = ${EC2_IP}"

                    }

                }
            }
        }






        stage('Wait For SSH') {


            steps {


                withCredentials([
                    sshUserPrivateKey(
                        credentialsId:"${EC2_SSH_CREDENTIAL}",
                        keyFileVariable:'SSH_KEY'
                    )
                ]){


                    sh '''

                    chmod 600 $SSH_KEY


                    echo "Waiting for SSH connection..."


                    for i in {1..15}
                    do

                    ssh \
                    -o StrictHostKeyChecking=no \
                    -o ConnectTimeout=10 \
                    -i $SSH_KEY \
                    $EC2_USER@$EC2_IP "echo SSH Ready" \
                    && break


                    echo "SSH not ready. Retrying..."
                    sleep 20


                    done


                    '''

                }

            }
        }







        stage('Deploy Application') {


            steps {


                withCredentials([
                    sshUserPrivateKey(
                        credentialsId:"${EC2_SSH_CREDENTIAL}",
                        keyFileVariable:'SSH_KEY'
                    )
                ]){


                    sh '''


                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i $SSH_KEY \
                    $EC2_USER@$EC2_IP "


                    set -e


                    sudo apt update


                    if ! command -v docker
                    then

                    sudo apt install -y docker.io docker-compose-v2

                    fi


                    sudo systemctl enable docker

                    sudo systemctl start docker


                    mkdir -p ~/todo-app


                    "





                    scp \
                    -o StrictHostKeyChecking=no \
                    -i $SSH_KEY \
                    docker-compose.yml \
                    $EC2_USER@$EC2_IP:~/todo-app/





                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i $SSH_KEY \
                    $EC2_USER@$EC2_IP "


                    cat > ~/todo-app/.env <<EOF

DOCKER_USERNAME=$DOCKER_USERNAME

FRONTEND_IMAGE=$FRONTEND_IMAGE

BACKEND_IMAGE=$BACKEND_IMAGE

EOF


                    cd ~/todo-app


                    sudo docker compose pull


                    sudo docker compose down || true


                    sudo docker compose up -d


                    sudo docker compose ps


                    "


                    '''

                }

            }
        }






        stage('Verify Application') {


            steps {


                withCredentials([
                    sshUserPrivateKey(
                        credentialsId:"${EC2_SSH_CREDENTIAL}",
                        keyFileVariable:'SSH_KEY'
                    )
                ]){


                    sh '''


                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i $SSH_KEY \
                    $EC2_USER@$EC2_IP "


                    curl -f http://localhost:8080


                    curl -f http://localhost:3000/health


                    "


                    '''

                }

            }
        }



    }


    post {


        success {

            echo "Deployment completed successfully"

        }


        failure {

            echo "Deployment failed. Check logs"

        }

    }

}
