pipeline {

    agent any


    environment {

        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'

    }



    stages {


        //=================================================
        // READ VARIABLES
        //=================================================

        stage('Read Input File') {

            steps {

                script {


                    def props = readProperties(
                        file:'jenkins-inputs.properties'
                    )


                    env.DOCKER_USERNAME = props.docker_username

                    env.FRONTEND_IMAGE = props.frontend_image

                    env.BACKEND_IMAGE = props.backend_image


                    env.TERRAFORM_DIR = props.terraform_directory

                    env.AWS_REGION = props.aws_region

                    env.AMI_ID = props.ami_id

                    env.INSTANCE_TYPE = props.instance_type

                    env.KEY_NAME = props.key_name

                    env.EC2_USER = props.ec2_user


                }

            }

        }




        //=================================================
        // BUILD FRONTEND
        //=================================================

        stage('Build Frontend Image') {


            steps {


                sh '''

                docker build \
                -t $DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER \
                frontend


                docker tag \
                $DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER \
                $DOCKER_USERNAME/$FRONTEND_IMAGE:latest


                '''

            }

        }






        //=================================================
        // BUILD BACKEND
        //=================================================

        stage('Build Backend Image') {


            steps {


                sh '''

                docker build \
                -t $DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER \
                backend


                docker tag \
                $DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER \
                $DOCKER_USERNAME/$BACKEND_IMAGE:latest


                '''

            }

        }








        //=================================================
        // PUSH IMAGES
        //=================================================

        stage('Push Docker Images') {


            steps {


                withCredentials([

                    usernamePassword(
                        credentialsId:'dockerhub-credentials',
                        usernameVariable:'USER',
                        passwordVariable:'TOKEN'
                    )

                ]){


                    sh '''

                    echo $TOKEN | docker login \
                    -u $USER \
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







        //=================================================
        // TERRAFORM
        //=================================================

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






        //=================================================
        // GET EC2 IP
        //=================================================

        stage('Get EC2 IP') {


            steps {


                dir("${TERRAFORM_DIR}") {


                    script {


                        env.EC2_IP = sh(

                        script:
                        "terraform output -raw public_ip",

                        returnStdout:true

                        ).trim()


                        echo "EC2 IP ${EC2_IP}"

                    }


                }

            }

        }








        //=================================================
        // WAIT SSH
        //=================================================

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



                    for i in {1..15}
                    do


                    ssh \
                    -o StrictHostKeyChecking=no \
                    -o ConnectTimeout=10 \
                    -i $SSH_KEY \
                    $EC2_USER@$EC2_IP "echo READY"


                    if [ $? -eq 0 ]
                    then

                    break

                    fi


                    echo "Waiting SSH..."

                    sleep 20


                    done

                    '''

                }


            }

        }









        //=================================================
        // DEPLOY DOCKER COMPOSE STACK
        //=================================================

        stage('Deploy Todo Stack') {


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
$EC2_USER@$EC2_IP <<EOF


sudo apt update


sudo apt install -y docker.io docker-compose-v2


sudo systemctl enable docker

sudo systemctl start docker



mkdir -p ~/todo-app



exit

EOF




scp \
-o StrictHostKeyChecking=no \
-i $SSH_KEY \
docker-compose.yml \
$EC2_USER@$EC2_IP:~/todo-app/





ssh \
-o StrictHostKeyChecking=no \
-i $SSH_KEY \
$EC2_USER@$EC2_IP <<EOF



cd ~/todo-app



cat > .env <<ENV


DOCKER_USERNAME=$DOCKER_USERNAME

FRONTEND_IMAGE=$FRONTEND_IMAGE

BACKEND_IMAGE=$BACKEND_IMAGE


ENV





sudo docker compose pull



sudo docker compose down || true



sudo docker compose up -d



EOF


'''

                }

            }

        }








        //=================================================
        // VERIFY CONTAINERS
        //=================================================

        stage('Verify Deployment') {


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


sudo docker ps


"


'''

                }

            }

        }


    }



    post {


        success {

            echo "Todo 3 Tier + Monitoring Stack deployed successfully"

        }


        failure {

            echo "Deployment failed"

        }


    }


}
