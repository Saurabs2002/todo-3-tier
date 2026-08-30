def getIP(){


dir("${TERRAFORM_DIR}"){


env.EC2_IP = sh(

script:"terraform output -raw public_ip",

returnStdout:true

).trim()



echo "EC2 IP ${EC2_IP}"


}


}



def waitForSSH(){


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



return this
