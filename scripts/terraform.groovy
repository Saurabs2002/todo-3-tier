def applyTerraform(){


dir("${TERRAFORM_DIR}"){


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


return this
