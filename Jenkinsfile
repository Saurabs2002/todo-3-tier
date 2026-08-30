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
                        error "jenkins-inputs.properties file not found"
                    }


                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )


                    env.AWS_REGION      = props.aws_region
                    env.DOCKER_USERNAME = props.docker_username

                    env.FRONTEND_IMAGE  = props.frontend_image
                    env.BACKEND_IMAGE   = props.backend_image


                    env.FRONTEND_DIR    = props.frontend_directory
                    env.BACKEND_DIR     = props.backend_directory


                    env.PROMETHEUS_DIR  = props.prometheus_directory

                    env.TERRAFORM_DIR   = props.terraform_directory


                    env.AMI_ID          = props.ami_id
                    env.INSTANCE_TYPE   = props.instance_type
                    env.KEY_NAME        = props.key_name

                    env.EC2_USER        = props.ec2_user


                    echo """
                    =============================
                    Configuration Loaded
                    =============================
                    Region       : ${AWS_REGION}
                    Frontend     : ${FRONTEND_IMAGE}
                    Backend      : ${BACKEND_IMAGE}
                    Terraform    : ${TERRAFORM_DIR}
                    =============================
                    """

                }

            }

        }



        stage('Build Frontend Image') {

            steps {

                sh """

                docker build \
                -t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                ${FRONTEND_DIR}


                docker tag \
                ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest

                """

            }

        }



        stage('Build Backend Image') {


            steps {


                sh """

                docker build \
                -t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER} \
                ${BACKEND_DIR}



                docker tag \
                ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER} \
                ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest


                """

            }

        }



        stage('Push Docker Images') {


            steps {


                withCredentials([

                    usernamePassword(
                        credentialsId:'dockerhub-credentials',
                        usernameVariable:'USERNAME',
                        passwordVariable:'TOKEN'
                    )

                ]){


                    sh """

                    echo \$TOKEN | docker login \
                    -u \$USERNAME \
                    --password-stdin



                    docker push ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER}

                    docker push ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest


                    docker push ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER}

                    docker push ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest



                    docker logout


                    """

                }

            }

        }




        stage('Terraform Apply') {


            steps {


                dir("${TERRAFORM_DIR}") {


                    sh """

                    terraform init


                    terraform apply \
                    -auto-approve \
                    -var aws_region=${AWS_REGION} \
                    -var ami_id=${AMI_ID} \
                    -var instance_type=${INSTANCE_TYPE} \
                    -var key_name=${KEY_NAME}

                    """

                }

            }

        }




        stage('Get EC2 IP') {


            steps {


                dir("${TERRAFORM_DIR}") {


                    script {


                        env.EC2_IP = sh(

                            script:"terraform output -raw public_ip",

                            returnStdout:true

                        ).trim()


                        echo "EC2 IP : ${EC2_IP}"


                    }

                }

            }

        }




        stage('Wait For SSH') {


            steps {


                withCredentials([

                    sshUserPrivateKey(

                        credentialsId:'ec2-ssh-key',

                        keyFileVariable:'SSH_KEY'

                    )

                ]){


                    sh '''

                    chmod 600 $SSH_KEY


                    for i in {1..20}
                    do

                    ssh \
                    -o StrictHostKeyChecking=no \
                    -o ConnectTimeout=10 \
                    -i $SSH_KEY \
                    ubuntu@$EC2_IP "echo READY" && exit 0


                    echo "Waiting SSH $i/20"

                    sleep 15


                    done


                    exit 1

                    '''

                }

            }

        }




        stage('Deploy Todo Stack') {


            steps {


                withCredentials([

                    sshUserPrivateKey(

                        credentialsId:'ec2-ssh-key',

                        keyFileVariable:'SSH_KEY'

                    )

                ]){


                    sh """


                    chmod 600 \$SSH_KEY



                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i \$SSH_KEY \
                    ${EC2_USER}@${EC2_IP} <<'REMOTE'


sudo apt update

sudo apt install -y docker.io docker-compose-v2



sudo systemctl enable docker

sudo systemctl start docker



# FIX DOCKER PERMISSION ISSUE

sudo usermod -aG docker ubuntu



mkdir -p ~/todo-app/${PROMETHEUS_DIR}


REMOTE



                    scp \
                    -o StrictHostKeyChecking=no \
                    -i \$SSH_KEY \
                    docker-compose.yml \
                    ${EC2_USER}@${EC2_IP}:~/todo-app/



                    scp \
                    -o StrictHostKeyChecking=no \
                    -i \$SSH_KEY \
                    ${PROMETHEUS_DIR}/prometheus.yml \
                    ${EC2_USER}@${EC2_IP}:~/todo-app/${PROMETHEUS_DIR}/




                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i \$SSH_KEY \
                    ${EC2_USER}@${EC2_IP} <<'REMOTE2'


cd ~/todo-app



cat > .env <<EOF

DOCKER_USERNAME=${DOCKER_USERNAME}

FRONTEND_IMAGE=${FRONTEND_IMAGE}

BACKEND_IMAGE=${BACKEND_IMAGE}

EOF



# refresh docker group permission

newgrp docker <<EOF2


docker compose down --remove-orphans || true


docker compose pull


docker compose up -d


docker compose ps


EOF2


REMOTE2


"""

                }

            }

        }





        stage('Verify Deployment') {


            steps {


                withCredentials([

                    sshUserPrivateKey(

                        credentialsId:'ec2-ssh-key',

                        keyFileVariable:'SSH_KEY'

                    )

                ]){


                    sh """


                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i \$SSH_KEY \
                    ${EC2_USER}@${EC2_IP} "

                    sudo docker ps

                    "


                    """

                }

            }

        }



    }



    post {


        success {

            echo "Todo 3 Tier Application Deployed Successfully"

        }


        failure {

            echo "Deployment Failed"

        }


    }


}
