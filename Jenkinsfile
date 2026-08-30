pipeline {

    agent any


    environment {
<<<<<<< HEAD
        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'
    }


    stages {


        // ============================================================
        // READ INPUT FILE
        // ============================================================
=======

        EC2_SSH_CREDENTIAL = 'ec2-ssh-key'

    }



    stages {


        //=================================================
        // READ VARIABLES
        //=================================================
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

        stage('Read Input File') {

            steps {

                script {

<<<<<<< HEAD
                    if (!fileExists('jenkins-inputs.properties')) {
                        error "jenkins-inputs.properties file not found!"
                    }


                    def props = readProperties(
                        file: 'jenkins-inputs.properties'
                    )


                    env.AWS_REGION       = props['aws_region']

                    env.DOCKER_USERNAME  = props['docker_username']

                    env.EC2_USER         = props['ec2_user']


                    env.TERRAFORM_DIR    = props['terraform_directory']

                    env.FRONTEND_DIR     = props['frontend_directory']

                    env.BACKEND_DIR      = props['backend_directory']


                    env.FRONTEND_IMAGE   = props['frontend_image']

                    env.BACKEND_IMAGE    = props['backend_image']


                    env.PROMETHEUS_DIR   = props['prometheus_directory']


                    env.AMI_ID           = props['ami_id']

                    env.INSTANCE_TYPE    = props['instance_type']

                    env.KEY_NAME         = props['key_name']


                    echo """
                    ================================
                    Configuration Loaded
                    ================================
                    AWS Region       : ${AWS_REGION}
                    Frontend Image   : ${FRONTEND_IMAGE}
                    Backend Image    : ${BACKEND_IMAGE}
                    Prometheus Path  : ${PROMETHEUS_DIR}
                    Terraform Dir    : ${TERRAFORM_DIR}
                    ================================
                    """

=======

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


>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
                }

            }

        }



<<<<<<< HEAD
        // ============================================================
        // BUILD FRONTEND IMAGE
        // ============================================================

        stage('Build Frontend Image') {
=======

        //=================================================
        // BUILD FRONTEND
        //=================================================

        stage('Build Frontend Image') {

>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

            steps {


                sh '''
<<<<<<< HEAD
                    docker build \
                    -t "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                    "$FRONTEND_DIR"


                    docker tag \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER" \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"
=======

                docker build \
                -t $DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER \
                frontend


                docker tag \
                $DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER \
                $DOCKER_USERNAME/$FRONTEND_IMAGE:latest


>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
                '''

            }

        }



<<<<<<< HEAD
        // ============================================================
        // BUILD BACKEND IMAGE
        // ============================================================

        stage('Build Backend Image') {

            steps {

                sh '''
                    docker build \
                    -t "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                    "$BACKEND_DIR"


                    docker tag \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER" \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"
                '''

=======



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

>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
            }

        }




<<<<<<< HEAD
        // ============================================================
        // PUSH DOCKER IMAGES
        // ============================================================
=======




        //=================================================
        // PUSH IMAGES
        //=================================================
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

        stage('Push Docker Images') {


            steps {


                withCredentials([

                    usernamePassword(
<<<<<<< HEAD
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'USERNAME',
                        passwordVariable: 'TOKEN'
=======
                        credentialsId:'dockerhub-credentials',
                        usernameVariable:'USER',
                        passwordVariable:'TOKEN'
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
                    )

<<<<<<< HEAD

                    sh '''

                    echo "$TOKEN" | docker login \
                    -u "$USERNAME" \
                    --password-stdin


                    docker push \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:$BUILD_NUMBER"


                    docker push \
                    "$DOCKER_USERNAME/$FRONTEND_IMAGE:latest"


                    docker push \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:$BUILD_NUMBER"


                    docker push \
                    "$DOCKER_USERNAME/$BACKEND_IMAGE:latest"


                    docker logout

                    '''

=======
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

>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
                }

            }

        }




<<<<<<< HEAD
        // ============================================================
        // TERRAFORM APPLY
        // ============================================================
=======



        //=================================================
        // TERRAFORM
        //=================================================
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

        stage('Terraform Apply') {


            steps {

<<<<<<< HEAD
                dir("${TERRAFORM_DIR}") {

                    sh '''
=======

                dir("${TERRAFORM_DIR}") {


                    sh """
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

                    terraform init


                    terraform apply \
                    -auto-approve \
<<<<<<< HEAD
                    -var="aws_region=$AWS_REGION" \
                    -var="ami_id=$AMI_ID" \
                    -var="instance_type=$INSTANCE_TYPE" \
                    -var="key_name=$KEY_NAME"

                    '''

                }

            }

=======
                    -var aws_region=${AWS_REGION} \
                    -var ami_id=${AMI_ID} \
                    -var instance_type=${INSTANCE_TYPE} \
                    -var key_name=${KEY_NAME}


                    """


                }


            }


>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
        }





<<<<<<< HEAD
        // ============================================================
        // GET EC2 IP
        // ============================================================
=======

        //=================================================
        // GET EC2 IP
        //=================================================
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

        stage('Get EC2 IP') {


            steps {

<<<<<<< HEAD
                dir("${TERRAFORM_DIR}") {
=======

                dir("${TERRAFORM_DIR}") {

>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

                    script {


                        env.EC2_IP = sh(
<<<<<<< HEAD
                            script: 'terraform output -raw public_ip',
                            returnStdout: true
                        ).trim()


                        echo "EC2 IP : ${EC2_IP}"

                    }

=======

                        script:
                        "terraform output -raw public_ip",

                        returnStdout:true

                        ).trim()


                        echo "EC2 IP ${EC2_IP}"

                    }


>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
                }

            }

        }

<<<<<<< HEAD
=======







        //=================================================
        // WAIT SSH
        //=================================================

        stage('Wait For SSH') {

>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb



<<<<<<< HEAD

        // ============================================================
        // DEPLOY APPLICATION
        // ============================================================

=======
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
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb









        //=================================================
        // DEPLOY DOCKER COMPOSE STACK
        //=================================================

        stage('Deploy Todo Stack') {


            steps {

<<<<<<< HEAD

                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${EC2_SSH_CREDENTIAL}",
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {


                    sh '''

                    chmod 600 "$SSH_KEY"



                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$EC2_USER@$EC2_IP" "

                    sudo apt-get update

                    sudo apt-get install -y docker.io docker-compose-v2

                    sudo systemctl enable docker

                    sudo systemctl start docker


                    mkdir -p ~/todo-app/$PROMETHEUS_DIR

                    "




                    # Copy docker compose

                    scp \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    docker-compose.yml \
                    "$EC2_USER@$EC2_IP:~/todo-app/"



                    # Copy prometheus configuration

                    scp \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$PROMETHEUS_DIR/prometheus.yml" \
                    "$EC2_USER@$EC2_IP:~/todo-app/$PROMETHEUS_DIR/"



                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$EC2_USER@$EC2_IP" "


                    cd ~/todo-app


                    docker compose down \
                    --remove-orphans || true


                    docker compose pull


                    docker compose up -d


                    docker compose ps

                    "


                    '''

=======

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

>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
                }

            }

        }





<<<<<<< HEAD
        // ============================================================
        // VERIFY
        // ============================================================

        stage('Verify Deployment') {

            steps {

                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: "${EC2_SSH_CREDENTIAL}",
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {


                    sh '''

                    ssh \
                    -o StrictHostKeyChecking=no \
                    -i "$SSH_KEY" \
                    "$EC2_USER@$EC2_IP" "


                    docker ps


                    curl -f http://localhost:80


                    curl -f http://localhost:9090


                    curl -f http://localhost:3001


                    "

                    '''
=======



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
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

                }

            }

        }


    }


<<<<<<< HEAD
=======

>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
    post {


        success {

<<<<<<< HEAD
            echo "Deployment completed successfully"
=======
            echo "Todo 3 Tier + Monitoring Stack deployed successfully"
>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb

        }


        failure {

            echo "Deployment failed"

        }

<<<<<<< HEAD
    }

=======

    }


>>>>>>> 8f4d280e79b0890f7d9a17b4e1d485fb8a747beb
}
