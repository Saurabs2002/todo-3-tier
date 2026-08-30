def check(){


withCredentials([


sshUserPrivateKey(


credentialsId:'ec2-ssh-key',

keyFileVariable:'SSH_KEY'


)


]){


sh """


echo "Checking deployed containers"



ssh \
-o StrictHostKeyChecking=no \
-i \$SSH_KEY \
${EC2_USER}@${EC2_IP} <<'REMOTE'


echo "Docker Containers"


sudo docker ps



echo "Docker Compose Status"



cd ~/todo-app


sudo docker compose ps



REMOTE



"""


}


}



return this
