def buildImages(){


sh """

docker build \
-t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER} \
${FRONTEND_DIR}



docker tag \
${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER} \
${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest



docker build \
-t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER} \
${BACKEND_DIR}



docker tag \
${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER} \
${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest


"""


}



def pushImages(){


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



return this
