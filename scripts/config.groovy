def loadConfig(){

    if(!fileExists('jenkins-inputs.properties')){

        error "jenkins-inputs.properties missing"

    }


    def props = readProperties(
        file:'jenkins-inputs.properties'
    )


    env.AWS_REGION = props.aws_region

    env.DOCKER_USERNAME = props.docker_username


    env.FRONTEND_IMAGE = props.frontend_image

    env.BACKEND_IMAGE = props.backend_image


    env.FRONTEND_DIR = props.frontend_directory

    env.BACKEND_DIR = props.backend_directory


    env.PROMETHEUS_DIR = props.prometheus_directory


    env.TERRAFORM_DIR = props.terraform_directory


    env.AMI_ID = props.ami_id

    env.INSTANCE_TYPE = props.instance_type

    env.KEY_NAME = props.key_name


    env.EC2_USER = props.ec2_user



    echo """

    Configuration Loaded

    Region:
    ${AWS_REGION}

    Frontend:
    ${FRONTEND_IMAGE}

    Backend:
    ${BACKEND_IMAGE}

    """

}


return this
