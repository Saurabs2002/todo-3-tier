def deployStack(){


withCredentials([

    sshUserPrivateKey(

        credentialsId:'ec2-ssh-key',

        keyFileVariable:'SSH_KEY'

    )

]){


sh """


chmod 600 \$SSH_KEY



echo "Installing Docker on EC2"



ssh \
-o StrictHostKeyChecking=no \
-i \$SSH_KEY \
${EC2_USER}@${EC2_IP} <<'REMOTE'


sudo apt update


sudo apt install -y docker.io docker-compose-v2



sudo systemctl enable docker

sudo systemctl start docker



# Add user into docker group

sudo usermod -aG docker ubuntu



mkdir -p ~/todo-app/${PROMETHEUS_DIR}


REMOTE






echo "Copying Docker Compose file"



scp \
-o StrictHostKeyChecking=no \
-i \$SSH_KEY \
docker-compose.yml \
${EC2_USER}@${EC2_IP}:~/todo-app/





echo "Copying Prometheus configuration"



scp \
-o StrictHostKeyChecking=no \
-i \$SSH_KEY \
${PROMETHEUS_DIR}/prometheus.yml \
${EC2_USER}@${EC2_IP}:~/todo-app/${PROMETHEUS_DIR}/





echo "Starting Application"



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



return this
